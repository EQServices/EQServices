-- Corrigir políticas RLS para unlocked_leads
-- Permite que profissionais visualizem e insiram seus próprios leads desbloqueados

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Professionals can view own unlocked leads" ON public.unlocked_leads;
DROP POLICY IF EXISTS "Professionals can insert own unlocked leads" ON public.unlocked_leads;
DROP POLICY IF EXISTS "Professionals can view unlocked leads" ON public.unlocked_leads;

-- Política para visualizar: profissionais podem ver seus próprios leads desbloqueados
CREATE POLICY "Professionals can view own unlocked leads" ON public.unlocked_leads
  FOR SELECT USING (auth.uid() = professional_id);

-- Política para inserir: profissionais podem inserir leads desbloqueados para si mesmos
-- Isso permite que a função unlock_lead funcione corretamente
CREATE POLICY "Professionals can insert own unlocked leads" ON public.unlocked_leads
  FOR INSERT WITH CHECK (auth.uid() = professional_id);

-- Atualizar a função unlock_lead para garantir que ela use SECURITY DEFINER
-- Isso permite que a função execute com privilégios elevados, contornando RLS se necessário
CREATE OR REPLACE FUNCTION public.unlock_lead(
  lead_id UUID,
  professional_id UUID,
  cost INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Verificar créditos disponíveis
  SELECT credits INTO current_credits
  FROM public.professionals
  WHERE id = professional_id;

  IF current_credits IS NULL THEN
    RAISE EXCEPTION 'Profissional não encontrado';
  END IF;

  IF current_credits < cost THEN
    RAISE EXCEPTION 'Créditos insuficientes';
  END IF;

  -- Verificar se já foi desbloqueado
  IF EXISTS (
    SELECT 1 FROM public.unlocked_leads
    WHERE unlocked_leads.lead_id = unlock_lead.lead_id
    AND unlocked_leads.professional_id = unlock_lead.professional_id
  ) THEN
    RAISE EXCEPTION 'Lead já foi desbloqueado';
  END IF;

  -- Debitar créditos
  UPDATE public.professionals
  SET credits = credits - cost,
      updated_at = NOW()
  WHERE id = professional_id;

  -- Registrar desbloqueio
  INSERT INTO public.unlocked_leads (lead_id, professional_id, cost)
  VALUES (lead_id, professional_id, cost);

  -- Registrar transação
  INSERT INTO public.credit_transactions (
    professional_id,
    type,
    amount,
    balance_after,
    description,
    reference_id
  )
  VALUES (
    professional_id,
    'debit',
    -cost,
    current_credits - cost,
    'Desbloqueio de lead',
    lead_id
  );
END;
$$;

