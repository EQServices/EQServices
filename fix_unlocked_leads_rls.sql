-- Corrigir políticas RLS para unlocked_leads
-- Execute este script no SQL Editor do Supabase Dashboard
-- Isso resolve o erro "new row violates row-level security policy for table unlocked_leads"

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

-- Adicionar política RLS para profissionais visualizarem service_requests de leads desbloqueados
-- Isso permite que profissionais vejam os detalhes completos do pedido após desbloquear o lead
DROP POLICY IF EXISTS "Professionals can view service requests for unlocked leads" ON public.service_requests;

CREATE POLICY "Professionals can view service requests for unlocked leads" ON public.service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.unlocked_leads ul
      JOIN public.leads l ON l.id = ul.lead_id
      WHERE l.service_request_id = service_requests.id
        AND ul.professional_id = auth.uid()
    )
    OR
    -- Também permitir visualizar service_requests de conversas em que o profissional participa
    EXISTS (
      SELECT 1
      FROM public.conversations c
      JOIN public.conversation_participants cp ON cp.conversation_id = c.id
      WHERE c.service_request_id = service_requests.id
        AND cp.user_id = auth.uid()
        AND cp.role = 'professional'
    )
  );

