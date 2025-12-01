-- ============================================
-- ANÁLISE RÁPIDA DE USUÁRIOS
-- Execute no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
-- ============================================

-- QUERY PRINCIPAL: Distribuição por Tipo
SELECT 
  user_type as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as ultimos_7_dias,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentual
FROM users
GROUP BY user_type
ORDER BY total DESC;

-- ============================================
-- QUERIES ADICIONAIS (Execute separadamente)
-- ============================================

-- Total de Usuários
-- SELECT COUNT(*) as total_usuarios FROM users;

-- Total de Clientes
-- SELECT COUNT(*) as total_clientes FROM users WHERE user_type = 'client';

-- Total de Profissionais
-- SELECT COUNT(*) as total_profissionais FROM users WHERE user_type = 'professional';

-- Profissionais com Créditos
-- SELECT 
--   COUNT(*) as profissionais_com_creditos,
--   SUM(credits) as total_creditos
-- FROM professionals
-- WHERE credits > 0;

-- Usuários Recentes (últimos 10)
-- SELECT 
--   email,
--   user_type,
--   first_name || ' ' || last_name as nome,
--   created_at
-- FROM users
-- ORDER BY created_at DESC
-- LIMIT 10;

