-- Migration: Atualizar valores dos pacotes de créditos
-- Data: 2025-01-27
-- NOTA: Esta migration foi substituída por 20250128_update_all_credit_packages.sql
-- que inclui o Pacote Inicial (20 créditos por €19 - 5% desconto)

-- Atualizar valores dos pacotes conforme documentação
-- Pacote Inicial: 20 créditos por €19 (5% de desconto)
-- Pacote Básico: 50 créditos por €45 (10% de desconto)
-- Pacote Premium: 100 créditos por €80 (20% de desconto)

-- Inserir/Criar Pacote Inicial
INSERT INTO public.credit_packages (name, credits, price, discount, active)
VALUES ('Pacote Inicial', 20, 19.00, 5, true)
ON CONFLICT (name, credits) DO UPDATE
SET price = 19.00, discount = 5, active = true;

UPDATE public.credit_packages 
SET 
  price = 45.00,
  discount = 10
WHERE name = 'Pacote Básico' AND credits = 50;

UPDATE public.credit_packages 
SET 
  price = 80.00,
  discount = 20
WHERE name = 'Pacote Premium' AND credits = 100;

-- Remover pacotes duplicados (manter apenas o mais recente)
-- Primeiro, desativar duplicatas mantendo apenas um ativo por combinação name+credits
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY name, credits ORDER BY created_at DESC) as rn
  FROM public.credit_packages
  WHERE active = true
)
UPDATE public.credit_packages
SET active = false
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verificar se existe pacote "Pay as you go" (1 crédito por €1)
-- Se não existir, criar. Se existir múltiplos, manter apenas um ativo
DELETE FROM public.credit_packages 
WHERE name = 'Pay as you go' 
AND id NOT IN (
  SELECT id FROM public.credit_packages 
  WHERE name = 'Pay as you go' 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Garantir que existe um pacote "Pay as you go" ativo
INSERT INTO public.credit_packages (name, credits, price, discount, active)
SELECT 'Pay as you go', 1, 1.00, 0, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.credit_packages 
  WHERE name = 'Pay as you go' AND credits = 1 AND active = true
);

