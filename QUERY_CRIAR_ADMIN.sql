-- ============================================
-- CRIAR CONTA ADMINISTRATIVA
-- Execute no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
-- ============================================

-- PASSO 1: Executar migration primeiro
-- Abra e execute: database/migrations/004_admin_system.sql

-- PASSO 2: Tornar um usuário admin
-- Substitua 'seu-email@exemplo.com' pelo email do usuário
SELECT make_user_admin('seu-email@exemplo.com');

-- PASSO 3: Verificar se funcionou
SELECT 
  email,
  user_type,
  is_admin,
  created_at
FROM users
WHERE is_admin = TRUE;

-- ============================================
-- QUERIES ÚTEIS PARA ADMIN
-- ============================================

-- Ver estatísticas gerais
-- SELECT * FROM admin_statistics;

-- Ver todos os usuários (primeiros 20)
-- SELECT * FROM admin_users_summary LIMIT 20;

-- Ver todos os pedidos (primeiros 20)
-- SELECT * FROM admin_orders_summary LIMIT 20;

-- Ver fluxo de caixa
-- SELECT * FROM admin_cash_flow;

-- Ver resumo financeiro mensal
-- SELECT * FROM admin_monthly_financial_summary;

