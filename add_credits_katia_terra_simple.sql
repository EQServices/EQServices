-- Versão simplificada: Adicionar 100 moedas para Katia Terra
-- Execute este script no SQL Editor do Supabase

-- PRIMEIRO: Execute esta query para encontrar o usuário exato
-- Ajuste o nome conforme necessário
SELECT 
  u.id,
  u.name,
  u.email,
  u.user_type,
  p.credits as creditos_atuais
FROM public.users u
LEFT JOIN public.professionals p ON p.id = u.id
WHERE LOWER(u.name) LIKE '%katia%' OR LOWER(u.email) LIKE '%katia%'
ORDER BY u.created_at DESC;

-- SEGUNDO: Após encontrar o ID correto, execute este comando
-- Substitua 'USER_ID_AQUI' pelo ID encontrado na query acima
-- 
-- SELECT public.add_credits('USER_ID_AQUI', 100);
--
-- OU execute diretamente:
--
-- UPDATE public.professionals
-- SET credits = credits + 100,
--     updated_at = NOW()
-- WHERE id = 'USER_ID_AQUI';
--
-- INSERT INTO public.credit_transactions (
--   professional_id,
--   type,
--   amount,
--   balance_after,
--   description
-- )
-- SELECT 
--   'USER_ID_AQUI',
--   'purchase',
--   100,
--   credits + 100,
--   'Créditos adicionados manualmente pelo administrador'
-- FROM public.professionals
-- WHERE id = 'USER_ID_AQUI';

