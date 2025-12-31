-- Migration: Adicionar número de referência aos pedidos de serviço
-- Data: 2025-01-28
-- Descrição: Adiciona campo reference_number para facilitar identificação dos pedidos

-- Adicionar coluna reference_number na tabela service_requests
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS reference_number TEXT UNIQUE;

-- Criar índice para busca rápida por número de referência
CREATE INDEX IF NOT EXISTS idx_service_requests_reference_number 
ON public.service_requests(reference_number);

-- Função para gerar número de referência único
-- Formato: PED-XXXXX (onde XXXXX é um número aleatório de 5 dígitos)
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS TEXT AS $$
DECLARE
  new_reference TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Gerar número aleatório de 5 dígitos (10000 a 99999)
    new_reference := 'PED-' || LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0');
    
    -- Verificar se já existe
    SELECT EXISTS(
      SELECT 1 FROM public.service_requests 
      WHERE reference_number = new_reference
    ) INTO exists_check;
    
    -- Se não existe, sair do loop
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_reference;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar automaticamente o número de referência ao criar um pedido
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Se reference_number não foi fornecido, gerar automaticamente
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_set_reference_number ON public.service_requests;

CREATE TRIGGER trigger_set_reference_number
  BEFORE INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_reference_number();

-- Atualizar pedidos existentes que não têm número de referência
UPDATE public.service_requests
SET reference_number = generate_reference_number()
WHERE reference_number IS NULL OR reference_number = '';

