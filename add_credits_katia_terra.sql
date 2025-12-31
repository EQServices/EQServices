-- Script para adicionar 100 moedas para Katia Terra
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos encontrar o usuário "katia terra"
-- (pode ser pelo nome ou email, ajuste conforme necessário)

-- Opção 1: Buscar pelo nome (case-insensitive)
DO $$
DECLARE
  v_user_id UUID;
  v_professional_exists BOOLEAN;
BEGIN
  -- Buscar o ID do usuário pelo nome
  SELECT id INTO v_user_id
  FROM public.users
  WHERE LOWER(name) LIKE '%katia%terra%' OR LOWER(name) LIKE '%katia terra%'
  LIMIT 1;

  -- Verificar se encontrou o usuário
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário "katia terra" não encontrado. Verifique o nome exato no banco de dados.';
  END IF;

  -- Verificar se é um profissional
  SELECT EXISTS(SELECT 1 FROM public.professionals WHERE id = v_user_id) INTO v_professional_exists;

  IF NOT v_professional_exists THEN
    RAISE EXCEPTION 'Usuário encontrado mas não é um profissional. ID: %', v_user_id;
  END IF;

  -- Adicionar 100 créditos usando a função add_credits
  PERFORM public.add_credits(v_user_id, 100);

  -- Registrar a transação manualmente (opcional, para histórico)
  INSERT INTO public.credit_transactions (
    professional_id,
    type,
    amount,
    balance_after,
    description
  )
  SELECT 
    v_user_id,
    'purchase',
    100,
    credits + 100,
    'Créditos adicionados manualmente pelo administrador'
  FROM public.professionals
  WHERE id = v_user_id;

  RAISE NOTICE '100 moedas adicionadas com sucesso para o usuário ID: %', v_user_id;
END $$;

-- Verificar o resultado
SELECT 
  u.id,
  u.name,
  u.email,
  p.credits as creditos_atuais
FROM public.users u
JOIN public.professionals p ON p.id = u.id
WHERE LOWER(u.name) LIKE '%katia%terra%' OR LOWER(u.name) LIKE '%katia terra%';

