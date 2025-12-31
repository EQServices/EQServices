-- ============================================
-- TORNAR ELASTIQUALITY@ELASTIQUALITY.PT ADMIN
-- ============================================
-- Execute no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
-- ============================================

-- PASSO 1: Verificar se o usuário existe
SELECT 
  id,
  email,
  user_type,
  is_admin,
  created_at
FROM users
WHERE email = 'elastiquality@elastiquality.pt';

-- Se o usuário NÃO existir, você precisa criá-lo primeiro
-- Siga as instruções em: database/create_elastiquality_profile.sql

-- ============================================
-- PASSO 2: Tornar o usuário admin
-- ============================================

-- Opção A: Usando a função (RECOMENDADO)
SELECT make_user_admin('elastiquality@elastiquality.pt');

-- Opção B: Update direto (se a função não existir)
-- UPDATE users 
-- SET is_admin = TRUE 
-- WHERE email = 'elastiquality@elastiquality.pt';

-- ============================================
-- PASSO 3: Verificar se funcionou
-- ============================================

SELECT 
  email,
  user_type,
  is_admin,
  first_name,
  last_name,
  created_at
FROM users
WHERE email = 'elastiquality@elastiquality.pt';

-- Resultado esperado:
-- email: elastiquality@elastiquality.pt
-- user_type: professional
-- is_admin: TRUE ← DEVE SER TRUE

-- ============================================
-- PASSO 4: Verificar acesso às views admin
-- ============================================

-- Testar view de estatísticas
SELECT * FROM admin_statistics;

-- Testar view de usuários (primeiros 5)
SELECT * FROM admin_users_summary LIMIT 5;

-- Testar view de pedidos (primeiros 5)
SELECT * FROM admin_orders_summary LIMIT 5;

-- Testar view de fluxo de caixa
SELECT * FROM admin_cash_flow;

-- ============================================
-- PRONTO! 🎉
-- ============================================
-- Agora faça:
-- 1. Logout da aplicação (se estiver logado)
-- 2. Login com elastiquality@elastiquality.pt / Empresa2025!
-- 3. Você será redirecionado para o Dashboard Admin
-- ============================================

