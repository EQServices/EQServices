-- Corrigir política RLS para inserção de leads
-- O problema: a política estava usando leads.service_request_id, mas em WITH CHECK para INSERT
-- você precisa referenciar diretamente a coluna sem o prefixo da tabela

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

