-- Criar função para inserir lead de forma segura
-- Esta função usa SECURITY DEFINER para garantir que a inserção funcione
-- mesmo com políticas RLS, desde que o service_request pertença ao usuário

CREATE OR REPLACE FUNCTION public.create_lead_for_service_request(
  p_service_request_id UUID,
  p_category TEXT,
  p_cost INTEGER,
  p_location TEXT,
  p_description TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_client_id UUID;
  v_lead_id UUID;
BEGIN
  -- Verificar se o service_request existe e pertence ao usuário atual
  SELECT client_id INTO v_client_id
  FROM public.service_requests
  WHERE id = p_service_request_id;
  
  IF v_client_id IS NULL THEN
    RAISE EXCEPTION 'Service request não encontrado';
  END IF;
  
  IF v_client_id != auth.uid() THEN
    RAISE EXCEPTION 'Você não tem permissão para criar lead para este service request';
  END IF;
  
  -- Inserir o lead
  INSERT INTO public.leads (
    service_request_id,
    category,
    cost,
    location,
    description
  )
  VALUES (
    p_service_request_id,
    p_category,
    p_cost,
    p_location,
    p_description
  )
  RETURNING id INTO v_lead_id;
  
  RETURN v_lead_id;
END;
$$;

-- Garantir que a política RLS ainda existe como fallback
DROP POLICY IF EXISTS "Clients can create leads for own requests" ON public.leads;

CREATE POLICY "Clients can create leads for own requests" ON public.leads
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.service_requests
      WHERE service_requests.id = service_request_id
        AND service_requests.client_id = auth.uid()
    )
  );

