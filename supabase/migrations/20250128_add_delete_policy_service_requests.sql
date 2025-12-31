-- Migration: Adicionar política RLS para DELETE em service_requests
-- Data: 2025-01-28
-- Descrição: Permite que clientes excluam seus próprios pedidos de serviço

-- Verificar se a política já existe antes de criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'service_requests' 
    AND policyname = 'Clients can delete own requests'
  ) THEN
    -- Criar política para clientes excluírem seus próprios pedidos
    CREATE POLICY "Clients can delete own requests" ON public.service_requests
      FOR DELETE 
      USING (auth.uid() = client_id);
  END IF;
END $$;

-- Verificar políticas existentes para service_requests
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'service_requests'
ORDER BY policyname;

