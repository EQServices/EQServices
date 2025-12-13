-- Índices para melhorar performance em produção
-- Execute este script no SQL Editor do Supabase

-- Leads
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category);
CREATE INDEX IF NOT EXISTS idx_leads_location ON public.leads(location);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Service Requests
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_client ON public.service_requests(client_id, created_at DESC);

-- Professionals
CREATE INDEX IF NOT EXISTS idx_professionals_categories ON public.professionals USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_professionals_regions ON public.professionals USING GIN(regions);

-- Proposals
CREATE INDEX IF NOT EXISTS idx_proposals_professional ON public.proposals(professional_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_request ON public.proposals(service_request_id, created_at DESC);

-- Credit Transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_professional ON public.credit_transactions(professional_id, created_at DESC);

-- Conversas e Mensagens
CREATE INDEX IF NOT EXISTS idx_conversations_service_request ON public.conversations(service_request_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id, created_at DESC);

-- Device Tokens (para notificações)
CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON public.device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_platform ON public.device_tokens(platform);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read_at, created_at DESC);

