-- Migration: Habilitar Realtime para tabela messages
-- Data: 2025-01-28
-- Descrição: Habilita Supabase Realtime para a tabela messages para chat em tempo real

-- Habilitar Realtime para a tabela messages
-- Isso permite que o Supabase Realtime funcione para novas mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Verificar se foi adicionado
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'messages';

-- Nota: Se a publicação não existir, criar:
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES;

