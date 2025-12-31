-- Sistema de Rate Limiting no Backend
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de rate limits
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  ip_address TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON public.rate_limits(key, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON public.rate_limits(user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits(ip_address, action, created_at);

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_action TEXT,
  p_limit_count INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Contar requisições no período
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limits
  WHERE key = p_key
    AND action = p_action
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  -- Se excedeu o limite, retornar false
  IF v_count >= p_limit_count THEN
    RETURN FALSE;
  END IF;

  -- Registrar a requisição atual
  INSERT INTO public.rate_limits (key, action, created_at)
  VALUES (p_key, p_action, NOW());

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de limpeza (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilitar RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: apenas service role pode inserir/ler
CREATE POLICY "Service role can manage rate limits" ON public.rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE public.rate_limits IS 'Tabela para controle de rate limiting';
COMMENT ON FUNCTION check_rate_limit IS 'Verifica se uma ação está dentro do limite de rate';
COMMENT ON FUNCTION cleanup_rate_limits IS 'Remove registros antigos de rate limits';

