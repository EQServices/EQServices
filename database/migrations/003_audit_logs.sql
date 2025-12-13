-- Sistema de Logs de Auditoria
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON public.audit_logs(table_name, record_id, created_at DESC);

-- Função para logar mudanças em créditos de profissionais
CREATE OR REPLACE FUNCTION log_credit_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Só logar se os créditos mudaram
  IF OLD.credits IS DISTINCT FROM NEW.credits THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      NEW.id, -- professional_id é o mesmo que user_id
      TG_OP,
      'professionals',
      NEW.id,
      jsonb_build_object('credits', OLD.credits),
      jsonb_build_object('credits', NEW.credits)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para mudanças de créditos
DROP TRIGGER IF EXISTS audit_professional_credits ON public.professionals;
CREATE TRIGGER audit_professional_credits
AFTER UPDATE OF credits ON public.professionals
FOR EACH ROW
EXECUTE FUNCTION log_credit_changes();

-- Função para logar transações de crédito
CREATE OR REPLACE FUNCTION log_credit_transactions()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) VALUES (
    NEW.professional_id,
    TG_OP,
    'credit_transactions',
    NEW.id,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para transações de crédito
DROP TRIGGER IF EXISTS audit_credit_transactions ON public.credit_transactions;
CREATE TRIGGER audit_credit_transactions
AFTER INSERT ON public.credit_transactions
FOR EACH ROW
EXECUTE FUNCTION log_credit_transactions();

-- Função para logar compras de crédito
CREATE OR REPLACE FUNCTION log_credit_purchases()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) VALUES (
    NEW.professional_id,
    TG_OP,
    'credit_purchases',
    NEW.id,
    to_jsonb(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para compras de crédito
DROP TRIGGER IF EXISTS audit_credit_purchases ON public.credit_purchases;
CREATE TRIGGER audit_credit_purchases
AFTER INSERT ON public.credit_purchases
FOR EACH ROW
EXECUTE FUNCTION log_credit_purchases();

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own audit logs" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Política: service role pode fazer tudo
CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE public.audit_logs IS 'Logs de auditoria para ações críticas do sistema';
COMMENT ON FUNCTION log_credit_changes IS 'Registra mudanças nos créditos de profissionais';
COMMENT ON FUNCTION log_credit_transactions IS 'Registra transações de crédito';
COMMENT ON FUNCTION log_credit_purchases IS 'Registra compras de crédito';

