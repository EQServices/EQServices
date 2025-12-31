# 📋 Executar Migration: Número de Referência dos Pedidos

## 🎯 Objetivo

Adicionar um número de referência único e amigável aos pedidos de serviço para facilitar a identificação.

**Formato**: `PED-XXXXX` (ex: PED-12345)

---

## ✅ O que esta migration faz:

1. **Adiciona coluna `reference_number`** na tabela `service_requests`
2. **Cria função** para gerar números de referência únicos automaticamente
3. **Cria trigger** que gera o número automaticamente ao criar um pedido
4. **Atualiza pedidos existentes** que não têm número de referência
5. **Cria índice** para busca rápida por número de referência

---

## 🚀 Como Executar

### Método 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em **"SQL Editor"**
   - Clique em **"New query"**

3. **Cole o conteúdo da migration**
   - Abra o arquivo: `supabase/migrations/20250128_add_reference_number.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor

4. **Execute a migration**
   - Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
   - Aguarde a execução (pode levar 10-30 segundos)

5. **Verificar sucesso**
   - Você deve ver: `Success. No rows returned`
   - Se houver erros, verifique os logs

---

### Método 2: Via Supabase CLI

```bash
# 1. Navegar até a pasta do projeto
cd d:\elastiquality

# 2. Executar migration
supabase db push

# Ou aplicar migration específica
supabase migration up 20250128_add_reference_number
```

---

## ✅ Verificação

### Verificar se a coluna foi criada:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_requests'
AND column_name = 'reference_number';
```

**Resultado esperado:**
```
column_name        | data_type | is_nullable
-------------------|-----------|------------
reference_number   | text      | YES
```

### Verificar se os pedidos têm números:

```sql
SELECT id, reference_number, title, created_at
FROM service_requests
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado esperado:** Todos os pedidos devem ter um `reference_number` no formato `PED-XXXXX`

### Testar criação de novo pedido:

```sql
-- Criar um pedido de teste
INSERT INTO service_requests (
  client_id,
  category,
  title,
  description,
  location,
  status
)
VALUES (
  (SELECT id FROM users LIMIT 1), -- Use um ID real
  'Limpeza',
  'Teste de número de referência',
  'Descrição de teste',
  'Lisboa',
  'pending'
)
RETURNING id, reference_number, title;
```

**Resultado esperado:** O pedido deve ter um `reference_number` gerado automaticamente.

---

## 🔍 Funcionalidades

### Geração Automática

- **Novos pedidos**: O número é gerado automaticamente ao criar um pedido
- **Pedidos existentes**: São atualizados automaticamente pela migration
- **Formato**: `PED-XXXXX` onde XXXXX é um número de 5 dígitos (10000-99999)
- **Único**: Garantido pela constraint UNIQUE no banco

### Exibição

O número de referência aparece:
- ✅ Na tela de detalhes do pedido (ServiceRequestDetailScreen)
- ✅ No histórico de pedidos (OrderHistoryScreen)
- ✅ Como um chip ao lado do título

---

## 🐛 Troubleshooting

### Erro: "column already exists"

**Solução**: A coluna já foi criada. Pode ignorar este erro ou remover a linha `ADD COLUMN IF NOT EXISTS`.

### Erro: "duplicate key value"

**Solução**: Raramente pode acontecer se dois pedidos receberem o mesmo número. A função tem um loop que tenta novamente até encontrar um número único.

### Pedidos antigos sem número

**Solução**: Execute novamente a parte de UPDATE da migration:

```sql
UPDATE public.service_requests
SET reference_number = generate_reference_number()
WHERE reference_number IS NULL OR reference_number = '';
```

---

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup antes de executar migrations em produção
2. **Teste**: Teste primeiro em ambiente de desenvolvimento
3. **Performance**: O índice criado garante busca rápida por número de referência
4. **Compatibilidade**: Pedidos antigos são atualizados automaticamente

---

## ✅ Checklist

- [ ] Migration executada com sucesso
- [ ] Coluna `reference_number` criada
- [ ] Função `generate_reference_number()` criada
- [ ] Trigger `trigger_set_reference_number` criado
- [ ] Pedidos existentes atualizados
- [ ] Índice criado
- [ ] Teste de criação de novo pedido funcionando
- [ ] Número aparece nas telas do app

---

**Data da Migration**: 2025-01-28  
**Arquivo**: `supabase/migrations/20250128_add_reference_number.sql`  
**Status**: ✅ Pronto para execução

