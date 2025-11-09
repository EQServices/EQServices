import { supabase } from '../config/supabase';

interface StartCheckoutParams {
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}

export const startCheckout = async ({ packageId, successUrl, cancelUrl }: StartCheckoutParams) => {
  const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>('stripe-create-checkout', {
    body: {
      packageId,
      successUrl,
      cancelUrl,
    },
  });

  if (error) {
    throw error;
  }

  if (!data?.url) {
    throw new Error(data?.error || 'Não foi possível iniciar o checkout no Stripe.');
  }

  return data.url;
};

export interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export const listCreditTransactions = async (professionalId: string) => {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('id, amount, balance_after, description, created_at')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as CreditTransaction[];
};

