# 📋 Executar Migration: Política RLS para Excluir Pedidos

## 🎯 Objetivo

Adicionar política RLS (Row Level Security) que permite aos clientes excluírem seus próprios pedidos de serviço.

---

## ⚠️ Problema Identificado

Atualmente, não existe uma política RLS para **DELETE** na tabela `service_requests`. Isso impede que os clientes excluam seus próprios pedidos, mesmo que o código tente fazer isso.

**Políticas existentes:**
- ✅ SELECT: Clientes podem ver seus próprios pedidos
- ✅ INSERT: Clientes podem criar pedidos
- ✅ UPDATE: Clientes podem atualizar seus próprios pedidos
- ❌ DELETE: **FALTANDO** - Clientes não podem excluir pedidos

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
   - Abra o arquivo: `supabase/migrations/20250128_add_delete_policy_service_requests.sql`
   - Copie TODO o conteúdo
   - Cole no SQL Editor

4. **Execute a migration**
   - Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
   - Aguarde a execução (pode levar 2-5 segundos)

5. **Verificar sucesso**
   - Você deve ver uma tabela com as políticas existentes
   - Deve aparecer a política: `"Clients can delete own requests"`

---

### Método 2: Via Supabase CLI

```bash
# 1. Navegar até a pasta do projeto
cd d:\elastiquality

# 2. Executar migration
supabase db push

# Ou aplicar migration específica
supabase migration up 20250128_add_delete_policy_service_requests
```

---

## ✅ Verificação

### Verificar se a política foi criada:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'service_requests'
ORDER BY policyname;
```

**Resultado esperado:**
```
policyname                          | cmd    | qual                                    | with_check
------------------------------------|--------|-----------------------------------------|------------
Clients can create requests         | INSERT |                                         | (auth.uid() = client_id)
Clients can delete own requests     | DELETE | (auth.uid() = client_id)                 | 
Clients can update own requests     | UPDATE | (auth.uid() = client_id)                 | (auth.uid() = client_id)
Clients can view own requests       | SELECT | (auth.uid() = client_id)                 | 
```

### Testar exclusão:

1. Acesse um pedido que você criou
2. Clique em "Excluir pedido"
3. Confirme a exclusão
4. O pedido deve ser excluído com sucesso

---

## 🔍 Funcionalidades da Política

### O que a política permite:

- ✅ Clientes podem excluir seus próprios pedidos
- ✅ Apenas o dono do pedido pode excluí-lo
- ✅ Outros clientes não podem excluir pedidos de terceiros
- ✅ Profissionais não podem excluir pedidos

### Restrições no código:

O código já tem validações adicionais:
- ✅ Apenas pedidos com status "pending" podem ser excluídos
- ✅ Pedidos com propostas aceitas não podem ser excluídos
- ✅ Confirmação obrigatória antes de excluir

---

## 🐛 Troubleshooting

### Erro: "new row violates row-level security policy"

**Causa**: A política RLS não existe ou está incorreta.

**Solução**: Execute a migration novamente.

### Erro: "permission denied for table service_requests"

**Causa**: O usuário não tem permissão para excluir.

**Solução**: Verifique se a política foi criada corretamente e se o usuário é o dono do pedido.

### Pedido não é excluído mesmo após executar migration

**Causa**: Pode haver outras restrições (foreign keys, triggers, etc.).

**Solução**: 
1. Verifique se o pedido tem status "pending"
2. Verifique se não há propostas aceitas
3. Verifique os logs do console do navegador para erros detalhados

---

## 📝 Notas Importantes

1. **CASCADE**: Ao excluir um pedido, os seguintes dados são excluídos automaticamente:
   - Leads relacionados
   - Propostas relacionadas
   - Avaliações relacionadas
   - Leads desbloqueados relacionados
   - Conversas relacionadas (se houver CASCADE configurado)

2. **Segurança**: A política garante que apenas o dono do pedido pode excluí-lo.

3. **Validações**: O código tem validações adicionais que impedem exclusão de:
   - Pedidos com status diferente de "pending"
   - Pedidos com propostas aceitas

---

## ✅ Checklist

- [ ] Migration executada com sucesso
- [ ] Política "Clients can delete own requests" criada
- [ ] Verificação de políticas executada
- [ ] Teste de exclusão realizado
- [ ] Pedido excluído com sucesso

---

**Data da Migration**: 2025-01-28  
**Arquivo**: `supabase/migrations/20250128_add_delete_policy_service_requests.sql`  
**Status**: ✅ Pronto para execução

