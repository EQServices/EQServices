-- Tornar usuário admin
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new

SELECT make_user_admin('elastiquality@elastiquality.pt');

-- Verificar se funcionou
SELECT 
  email,
  user_type,
  is_admin,
  created_at
FROM users
WHERE email = 'elastiquality@elastiquality.pt';

