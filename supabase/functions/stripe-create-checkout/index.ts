import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecretKey || !supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required environment variables for stripe-create-checkout function.');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Não foi possível validar o utilizador.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { packageId, successUrl, cancelUrl } = body as {
      packageId?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!packageId || !successUrl || !cancelUrl) {
      return new Response(JSON.stringify({ error: 'Parâmetros inválidos.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: creditPackage, error: packageError } = await supabaseAdmin
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .eq('active', true)
      .maybeSingle();

    if (packageError) {
      throw packageError;
    }

    if (!creditPackage) {
      return new Response(JSON.stringify({ error: 'Pacote não encontrado ou inativo.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const lookupKey = `credit_package_${creditPackage.id}`;
    let priceId: string | null = null;

    const existingPrices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      active: true,
      limit: 1,
    });

    if (existingPrices.data.length > 0) {
      priceId = existingPrices.data[0].id;
    } else {
      const productName = `${creditPackage.name} - ${creditPackage.credits} moedas`;
      const price = await stripe.prices.create({
        currency: 'eur',
        unit_amount: Math.round(Number(creditPackage.price) * 100),
        lookup_key: lookupKey,
        product_data: {
          name: productName,
          metadata: {
            credit_package_id: creditPackage.id,
          },
        },
      });

      priceId = price.id;
    }

    if (!priceId) {
      throw new Error('Não foi possível determinar o preço no Stripe.');
    }

    const successUrlWithParams = `${successUrl}${successUrl.includes('?') ? '&' : '?'}status=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrlWithParams = `${cancelUrl}${cancelUrl.includes('?') ? '&' : '?'}status=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrlWithParams,
      cancel_url: cancelUrlWithParams,
      customer_email: user.email,
      metadata: {
        professional_id: user.id,
        package_id: creditPackage.id,
        credits: creditPackage.credits.toString(),
        price: creditPackage.price.toFixed(2),
        package_name: creditPackage.name,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_method_types: ['card'],
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('stripe-create-checkout error:', err);
    const message = err instanceof Error ? err.message : 'Erro ao criar sessão de checkout.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


