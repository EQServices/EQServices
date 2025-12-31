-- ⚠️ ATENÇÃO: Este script exclui TODOS os pedidos de serviço existentes
-- Data: 2025-01-28
-- 
-- ⚠️ CONSEQUÊNCIAS:
-- - Todos os pedidos serão excluídos permanentemente
-- - Todos os leads relacionados serão excluídos (CASCADE)
-- - Todas as propostas relacionadas serão excluídas (CASCADE)
-- - Todas as avaliações relacionadas serão excluídas (CASCADE)
-- - Todos os leads desbloqueados relacionados serão excluídos (CASCADE)
-- - Todas as conversas relacionadas serão excluídas (se houver CASCADE)
--
-- ⚠️ ESTA OPERAÇÃO NÃO PODE SER DESFEITA!
--
-- Execute apenas se tiver certeza absoluta!

-- Verificar quantos pedidos serão excluídos ANTES de executar
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pedidos_pendentes,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as pedidos_ativos,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as pedidos_concluidos,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as pedidos_cancelados
FROM service_requests;

-- ⚠️ DESCOMENTE A LINHA ABAIXO PARA EXECUTAR A EXCLUSÃO
-- DELETE FROM public.service_requests;

-- Alternativa: Excluir apenas pedidos de um cliente específico
-- DELETE FROM public.service_requests WHERE client_id = 'UUID_DO_CLIENTE';

-- Alternativa: Excluir apenas pedidos com status específico
-- DELETE FROM public.service_requests WHERE status = 'pending';

-- Alternativa: Excluir pedidos antigos (anteriores a uma data)
-- DELETE FROM public.service_requests WHERE created_at < '2025-01-01';

-- Verificar após exclusão (se executou)
-- SELECT COUNT(*) as pedidos_restantes FROM service_requests;

