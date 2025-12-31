-- Migration: Atualizar todos os pacotes de créditos com valores corretos
-- Data: 2025-01-28
-- Inclui: Pacote Inicial (20 créditos), Pacote Básico (50 créditos), Pacote Premium (100 créditos)

-- Desativar todos os pacotes antigos
UPDATE public.credit_packages 
SET active = false
WHERE active = true;

-- Atualizar ou Inserir Pacote Inicial (20 créditos por €19 - 5% desconto)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.credit_packages WHERE name = 'Pacote Inicial' AND credits = 20) THEN
    UPDATE public.credit_packages 
    SET price = 19.00, discount = 5, active = true
    WHERE name = 'Pacote Inicial' AND credits = 20;
  ELSE
    INSERT INTO public.credit_packages (name, credits, price, discount, active)
    VALUES ('Pacote Inicial', 20, 19.00, 5, true);
  END IF;
END $$;

-- Atualizar ou Inserir Pacote Básico (50 créditos por €45 - 10% desconto)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.credit_packages WHERE name = 'Pacote Básico' AND credits = 50) THEN
    UPDATE public.credit_packages 
    SET price = 45.00, discount = 10, active = true
    WHERE name = 'Pacote Básico' AND credits = 50;
  ELSE
    INSERT INTO public.credit_packages (name, credits, price, discount, active)
    VALUES ('Pacote Básico', 50, 45.00, 10, true);
  END IF;
END $$;

-- Atualizar ou Inserir Pacote Premium (100 créditos por €80 - 20% desconto)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.credit_packages WHERE name = 'Pacote Premium' AND credits = 100) THEN
    UPDATE public.credit_packages 
    SET price = 80.00, discount = 20, active = true
    WHERE name = 'Pacote Premium' AND credits = 100;
  ELSE
    INSERT INTO public.credit_packages (name, credits, price, discount, active)
    VALUES ('Pacote Premium', 100, 80.00, 20, true);
  END IF;
END $$;

-- Atualizar ou Inserir Pay as you go (1 crédito por €1)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.credit_packages WHERE name = 'Pay as you go' AND credits = 1) THEN
    UPDATE public.credit_packages 
    SET price = 1.00, discount = 0, active = true
    WHERE name = 'Pay as you go' AND credits = 1;
  ELSE
    INSERT INTO public.credit_packages (name, credits, price, discount, active)
    VALUES ('Pay as you go', 1, 1.00, 0, true);
  END IF;
END $$;

