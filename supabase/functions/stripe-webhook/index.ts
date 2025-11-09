import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required environment variables for stripe-webhook function.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const creditPackageName = (metadata: Record<string, string | undefined>) => {
  if (metadata.package_name) return metadata.package_name;
  if (metadata.credits) return `${metadata.credits} moedas`;
  return 'Pacote de créditos';
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let event: Stripe.Event;

  try {
    const signature = req.headers.get('Stripe-Signature');
    if (!signature) {
      return new Response('Missing signature', { status: 400 });
    }

    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};
      const professionalId = metadata.professional_id;
      const packageId = metadata.package_id;
      const credits = Number(metadata.credits ?? 0);
      const price = Number(metadata.price ?? session.amount_total ? session.amount_total / 100 : 0);

      if (!professionalId || !packageId || !credits) {
        console.warn('Invalid metadata on checkout session:', metadata);
        return new Response('ok', { status: 200 });
      }

      const paymentId = session.payment_intent ?? session.id;

      const { data: purchaseExists, error: purchaseError } = await supabaseAdmin
        .from('credit_purchases')
        .select('id')
        .eq('stripe_payment_id', paymentId)
        .maybeSingle();

      if (purchaseError) {
        throw purchaseError;
      }

      if (!purchaseExists) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);

        const {
          data: insertedPurchase,
          error: insertPurchaseError,
        } = await supabaseAdmin
          .from('credit_purchases')
          .insert({
            professional_id: professionalId,
            package_id: packageId,
            credits,
            price,
            payment_method: session.payment_method_types?.[0] ?? 'card',
            payment_status: 'completed',
            stripe_payment_id: paymentId,
            expires_at: expiresAt.toISOString(),
          })
          .select('id')
          .single();

        if (insertPurchaseError) {
          throw insertPurchaseError;
        }

        if (!insertedPurchase?.id) {
          throw new Error('Falha ao guardar compra de créditos: id ausente.');
        }

        const purchaseId = insertedPurchase.id;

        const { error: rpcError } = await supabaseAdmin.rpc('add_credits', {
          professional_id: professionalId,
          credits_to_add: credits,
        });

        if (rpcError) {
          // fallback: manual increment
          const { data: currentProfessional, error: professionalError } = await supabaseAdmin
            .from('professionals')
            .select('credits')
            .eq('id', professionalId)
            .maybeSingle();

          if (professionalError) {
            throw professionalError;
          }

          const currentCredits = currentProfessional?.credits ?? 0;

          const { error: fallbackError } = await supabaseAdmin
            .from('professionals')
            .update({
              credits: currentCredits + credits,
              updated_at: new Date().toISOString(),
            })
            .eq('id', professionalId);

          if (fallbackError) {
            throw fallbackError;
          }
        }

        const { data: updatedProfessional, error: balanceError } = await supabaseAdmin
          .from('professionals')
          .select('credits')
          .eq('id', professionalId)
          .maybeSingle();

        if (balanceError) {
          throw balanceError;
        }

        const { data: existingTransaction, error: transactionLookupError } = await supabaseAdmin
          .from('credit_transactions')
          .select('id')
          .eq('reference_id', purchaseId)
          .maybeSingle();

        if (transactionLookupError) {
          throw transactionLookupError;
        }

        if (!existingTransaction && updatedProfessional?.credits !== undefined) {
          const { error: insertTransactionError } = await supabaseAdmin.from('credit_transactions').insert({
            professional_id: professionalId,
            type: 'purchase',
            amount: credits,
            balance_after: updatedProfessional.credits,
            description: `Compra de créditos via Stripe (${creditPackageName(metadata)})`,
            reference_id: purchaseId,
          });

          if (insertTransactionError) {
            throw insertTransactionError;
          }
        }
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return new Response('Internal error', { status: 500 });
  }
});


