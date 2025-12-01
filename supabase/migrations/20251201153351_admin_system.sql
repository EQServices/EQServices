-- Sistema de Administração
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. Adicionar campo admin na tabela users
-- ============================================
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;

-- ============================================
-- 2. Criar função para tornar usuário admin
-- ============================================
CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET is_admin = TRUE
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Criar view para dashboard admin - Usuários
-- ============================================
CREATE OR REPLACE VIEW admin_users_summary AS
SELECT 
  u.id,
  u.email,
  u.first_name || ' ' || u.last_name as nome_completo,
  u.user_type,
  u.created_at,
  u.phone,
  u.location_label,
  CASE 
    WHEN u.user_type = 'professional' THEN p.credits
    ELSE NULL
  END as creditos,
  CASE 
    WHEN u.user_type = 'professional' THEN p.rating
    ELSE NULL
  END as avaliacao
FROM public.users u
LEFT JOIN public.professionals p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- 4. Criar view para dashboard admin - Pedidos
-- ============================================
CREATE OR REPLACE VIEW admin_orders_summary AS
SELECT 
  sr.id,
  sr.title,
  sr.category,
  sr.status,
  sr.budget,
  sr.created_at,
  sr.completed_at,
  u.email as cliente_email,
  u.first_name || ' ' || u.last_name as cliente_nome,
  COUNT(DISTINCT p.id) as total_propostas,
  COUNT(DISTINCT ul.id) as total_desbloqueios,
  COUNT(DISTINCT r.id) as total_avaliacoes
FROM public.service_requests sr
LEFT JOIN public.users u ON sr.client_id = u.id
LEFT JOIN public.proposals p ON sr.id = p.service_request_id
LEFT JOIN public.leads l ON sr.id = l.service_request_id
LEFT JOIN public.unlocked_leads ul ON l.id = ul.lead_id
LEFT JOIN public.reviews r ON sr.id = r.service_request_id
GROUP BY sr.id, sr.title, sr.category, sr.status, sr.budget, sr.created_at, sr.completed_at, u.email, u.first_name, u.last_name
ORDER BY sr.created_at DESC;

-- ============================================
-- 5. Criar view para dashboard admin - Fluxo de Caixa
-- ============================================
CREATE OR REPLACE VIEW admin_cash_flow AS
SELECT 
  'Compras de Créditos' as tipo_transacao,
  COUNT(*) as quantidade,
  COALESCE(SUM(cp.price), 0) as valor_total,
  COALESCE(SUM(cp.credits), 0) as creditos_total,
  MIN(cp.created_at) as primeira_transacao,
  MAX(cp.created_at) as ultima_transacao
FROM public.credit_purchases cp
WHERE cp.payment_status = 'completed'

UNION ALL

SELECT 
  'Desbloqueios de Leads' as tipo_transacao,
  COUNT(*) as quantidade,
  COALESCE(SUM(ul.cost), 0) as valor_total,
  COALESCE(SUM(ul.cost), 0) as creditos_total,
  MIN(ul.unlocked_at) as primeira_transacao,
  MAX(ul.unlocked_at) as ultima_transacao
FROM public.unlocked_leads ul;

-- ============================================
-- 6. Criar view para resumo financeiro mensal
-- ============================================
CREATE OR REPLACE VIEW admin_monthly_financial_summary AS
SELECT 
  DATE_TRUNC('month', cp.created_at) as mes,
  COUNT(*) as compras_realizadas,
  COALESCE(SUM(cp.price), 0) as receita_total,
  COALESCE(SUM(cp.credits), 0) as creditos_vendidos
FROM public.credit_purchases cp
WHERE cp.payment_status = 'completed'
GROUP BY DATE_TRUNC('month', cp.created_at)
ORDER BY mes DESC;

-- ============================================
-- 7. Criar view para estatísticas gerais
-- ============================================
CREATE OR REPLACE VIEW admin_statistics AS
SELECT 
  (SELECT COUNT(*) FROM public.users WHERE user_type = 'client') as total_clientes,
  (SELECT COUNT(*) FROM public.users WHERE user_type = 'professional') as total_profissionais,
  (SELECT COUNT(*) FROM public.service_requests) as total_pedidos,
  (SELECT COUNT(*) FROM public.service_requests WHERE status = 'pending') as pedidos_pendentes,
  (SELECT COUNT(*) FROM public.service_requests WHERE status = 'completed') as pedidos_completos,
  (SELECT COUNT(*) FROM public.proposals) as total_propostas,
  (SELECT COUNT(*) FROM public.proposals WHERE status = 'accepted') as propostas_aceitas,
  (SELECT COUNT(*) FROM public.unlocked_leads) as total_leads_desbloqueados,
  (SELECT COALESCE(SUM(price), 0) FROM public.credit_purchases WHERE payment_status = 'completed') as receita_total,
  (SELECT COALESCE(SUM(credits), 0) FROM public.credit_purchases WHERE payment_status = 'completed') as creditos_vendidos,
  (SELECT COALESCE(SUM(credits), 0) FROM public.professionals) as creditos_em_circulacao;

-- ============================================
-- 8. Políticas RLS para views admin
-- ============================================
-- Permitir apenas admins verem as views
ALTER VIEW admin_users_summary OWNER TO postgres;
ALTER VIEW admin_orders_summary OWNER TO postgres;
ALTER VIEW admin_cash_flow OWNER TO postgres;
ALTER VIEW admin_monthly_financial_summary OWNER TO postgres;
ALTER VIEW admin_statistics OWNER TO postgres;

-- ============================================
-- 9. Comentários
-- ============================================
COMMENT ON COLUMN public.users.is_admin IS 'Indica se o usuário é administrador';
COMMENT ON FUNCTION make_user_admin IS 'Torna um usuário administrador pelo email';
COMMENT ON VIEW admin_users_summary IS 'Resumo de todos os usuários para dashboard admin';
COMMENT ON VIEW admin_orders_summary IS 'Resumo de todos os pedidos para dashboard admin';
COMMENT ON VIEW admin_cash_flow IS 'Fluxo de caixa (compras e desbloqueios) para dashboard admin';
COMMENT ON VIEW admin_monthly_financial_summary IS 'Resumo financeiro mensal para dashboard admin';
COMMENT ON VIEW admin_statistics IS 'Estatísticas gerais da plataforma para dashboard admin';

