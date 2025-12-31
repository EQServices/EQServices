# 🚀 Como Executar a Migration de Múltiplas Categorias

## ⚠️ Importante

Esta migration altera a estrutura da tabela `service_requests` para permitir múltiplas categorias por pedido.

## 📋 Passo a Passo

### Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: **Elastiqualyt's Project**

2. **Abra o SQL Editor**
   - No menu lateral, clique em **SQL Editor**
   - Clique em **New query**

3. **Cole o SQL da Migration**
   - Abra o arquivo: `supabase/migrations/20250127_add_multiple_categories.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor

4. **Execute a Migration**
   - Clique em **Run** (ou pressione `Ctrl+Enter`)
   - Aguarde alguns segundos
   - Você deve ver: "Success. No rows returned"

5. **Verificar**
   - Vá em **Table Editor**
   - Selecione a tabela `service_requests`
   - Verifique se a coluna `categories` existe (tipo `text[]`)

### Opção 2: Via Supabase CLI (se tiver psql instalado)

Se você tiver o PostgreSQL client (`psql`) instalado, pode executar diretamente:

```bash
# Obter a connection string do Supabase Dashboard:
# Settings → Database → Connection string → URI

psql "postgresql://postgres:[SUA-SENHA]@db.qeswqwhccqfbdtmywzkz.supabase.co:5432/postgres" -f supabase/migrations/20250127_add_multiple_categories.sql
```

## ✅ O que a Migration Faz

1. ✅ Cria uma nova coluna `categories_temp` do tipo `TEXT[]`
2. ✅ Migra dados existentes: converte `category` única em array `[category]`
3. ✅ Remove a coluna antiga `category`
4. ✅ Renomeia `categories_temp` para `categories`
5. ✅ Adiciona constraint para garantir pelo menos uma categoria
6. ✅ Cria índice GIN para busca eficiente

## 🔍 Verificação Pós-Migration

Após executar a migration, verifique:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'service_requests' 
AND column_name IN ('category', 'categories');

-- Verificar dados migrados
SELECT id, title, categories 
FROM service_requests 
LIMIT 5;
```

## ⚠️ Notas Importantes

- A migration é **segura** e não perde dados
- Dados existentes são automaticamente convertidos
- A tabela `leads` mantém `category` como `TEXT` (cada lead representa uma categoria)
- Quando um pedido tem múltiplas categorias, múltiplos leads são criados (um por categoria)

## 🆘 Problemas?

Se encontrar erros:

1. Verifique se não há pedidos com `category = NULL`
2. Verifique se a tabela `service_requests` existe
3. Verifique permissões do usuário (deve ser `postgres` ou admin)

Para ajuda adicional, consulte: https://supabase.com/docs/guides/database/troubleshooting

