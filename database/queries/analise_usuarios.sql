-- Análise Completa de Usuários - Elastiquality
-- Execute no SQL Editor do Supabase

-- ============================================
-- 1. RESUMO GERAL
-- ============================================
SELECT 
  'Total de Usuários' as categoria,
  COUNT(*) as quantidade,
  NULL::text as detalhes
FROM users

UNION ALL

SELECT 
  'Clientes' as categoria,
  COUNT(*) as quantidade,
  NULL::text as detalhes
FROM users
WHERE user_type = 'client'

UNION ALL

SELECT 
  'Profissionais' as categoria,
  COUNT(*) as quantidade,
  NULL::text as detalhes
FROM users
WHERE user_type = 'professional'

UNION ALL

SELECT 
  'Usuários últimos 7 dias' as categoria,
  COUNT(*) as quantidade,
  NULL::text as detalhes
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'Usuários últimos 30 dias' as categoria,
  COUNT(*) as quantidade,
  NULL::text as detalhes
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days';

-- ============================================
-- 2. DISTRIBUIÇÃO POR TIPO
-- ============================================
SELECT 
  user_type,
  COUNT(*) as total,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as ultimos_7_dias,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as ultimos_30_dias,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentual
FROM users
GROUP BY user_type
ORDER BY total DESC;

-- ============================================
-- 3. ANÁLISE DE PROFISSIONAIS
-- ============================================
SELECT 
  'Profissionais com créditos' as categoria,
  COUNT(*) as quantidade,
  COALESCE(SUM(credits), 0) as total_creditos
FROM professionals
WHERE credits > 0

UNION ALL

SELECT 
  'Profissionais sem créditos' as categoria,
  COUNT(*) as quantidade,
  0 as total_creditos
FROM professionals
WHERE credits = 0 OR credits IS NULL

UNION ALL

SELECT 
  'Total de profissionais' as categoria,
  COUNT(*) as quantidade,
  COALESCE(SUM(credits), 0) as total_creditos
FROM professionals;

-- ============================================
-- 4. DISTRIBUIÇÃO DE CRÉDITOS ENTRE PROFISSIONAIS
-- ============================================
SELECT 
  CASE 
    WHEN credits = 0 OR credits IS NULL THEN 'Sem créditos'
    WHEN credits BETWEEN 1 AND 50 THEN '1-50 créditos'
    WHEN credits BETWEEN 51 AND 100 THEN '51-100 créditos'
    WHEN credits BETWEEN 101 AND 200 THEN '101-200 créditos'
    ELSE '200+ créditos'
  END as faixa_creditos,
  COUNT(*) as quantidade_profissionais,
  COALESCE(SUM(credits), 0) as total_creditos
FROM professionals
GROUP BY 
  CASE 
    WHEN credits = 0 OR credits IS NULL THEN 'Sem créditos'
    WHEN credits BETWEEN 1 AND 50 THEN '1-50 créditos'
    WHEN credits BETWEEN 51 AND 100 THEN '51-100 créditos'
    WHEN credits BETWEEN 101 AND 200 THEN '101-200 créditos'
    ELSE '200+ créditos'
  END
ORDER BY 
  CASE 
    WHEN credits = 0 OR credits IS NULL THEN 1
    WHEN credits BETWEEN 1 AND 50 THEN 2
    WHEN credits BETWEEN 51 AND 100 THEN 3
    WHEN credits BETWEEN 101 AND 200 THEN 4
    ELSE 5
  END;

-- ============================================
-- 5. USUÁRIOS RECENTES (ÚLTIMOS 10)
-- ============================================
SELECT 
  u.id,
  u.email,
  u.user_type,
  u.first_name || ' ' || u.last_name as nome_completo,
  u.created_at,
  CASE 
    WHEN u.user_type = 'professional' THEN COALESCE(p.credits, 0)
    ELSE NULL
  END as creditos
FROM users u
LEFT JOIN professionals p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================
-- 6. ESTATÍSTICAS DE ATIVIDADE
-- ============================================
SELECT 
  'Clientes com pedidos criados' as categoria,
  COUNT(DISTINCT client_id) as quantidade
FROM service_requests

UNION ALL

SELECT 
  'Profissionais que desbloquearam leads' as categoria,
  COUNT(DISTINCT professional_id) as quantidade
FROM unlocked_leads

UNION ALL

SELECT 
  'Profissionais que enviaram propostas' as categoria,
  COUNT(DISTINCT professional_id) as quantidade
FROM proposals;

-- ============================================
-- 7. RESUMO EXECUTIVO
-- ============================================
SELECT 
  'RESUMO EXECUTIVO' as secao,
  '' as metrica,
  '' as valor
WHERE false

UNION ALL

SELECT 
  'Total de Usuários',
  'Total',
  COUNT(*)::text
FROM users

UNION ALL

SELECT 
  'Total de Usuários',
  'Clientes',
  COUNT(*)::text
FROM users
WHERE user_type = 'client'

UNION ALL

SELECT 
  'Total de Usuários',
  'Profissionais',
  COUNT(*)::text
FROM users
WHERE user_type = 'professional'

UNION ALL

SELECT 
  'Crescimento',
  'Últimos 7 dias',
  COUNT(*)::text
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'

UNION ALL

SELECT 
  'Crescimento',
  'Últimos 30 dias',
  COUNT(*)::text
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  'Profissionais',
  'Com créditos',
  COUNT(*)::text
FROM professionals
WHERE credits > 0

UNION ALL

SELECT 
  'Profissionais',
  'Total de créditos',
  COALESCE(SUM(credits), 0)::text
FROM professionals;

