-- Corrigir políticas RLS para service_requests
-- Permite que profissionais visualizem service_requests de leads que desbloquearam
-- Execute este script no SQL Editor do Supabase Dashboard

-- Adicionar política para profissionais visualizarem service_requests de leads desbloqueados
CREATE POLICY "Professionals can view service requests for unlocked leads" ON public.service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.unlocked_leads ul
      JOIN public.leads l ON l.id = ul.lead_id
      WHERE l.service_request_id = service_requests.id
        AND ul.professional_id = auth.uid()
    )
  );

-- Verificar se a política foi criada
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'service_requests'
ORDER BY policyname;

