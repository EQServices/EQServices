# ⚠️ Excluir Todos os Pedidos Existentes

## 🚨 ATENÇÃO: OPERAÇÃO DESTRUTIVA

Este script exclui **TODOS** os pedidos de serviço do banco de dados.

---

## ⚠️ CONSEQUÊNCIAS

Ao excluir os pedidos, também serão excluídos automaticamente (CASCADE):

- ✅ **Todos os leads** relacionados aos pedidos
- ✅ **Todas as propostas** enviadas pelos profissionais
- ✅ **Todas as avaliações** feitas pelos clientes
- ✅ **Todos os leads desbloqueados** pelos profissionais
- ✅ **Todas as conversas** relacionadas (se houver)

**⚠️ ESTA OPERAÇÃO NÃO PODE SER DESFEITA!**

---

## 📋 Passo a Passo

### 1. Verificar Quantos Pedidos Serão Excluídos

Primeiro, execute esta query para ver o que será excluído:

```sql
SELECT 
  COUNT(*) as total_pedidos,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pedidos_pendentes,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as pedidos_ativos,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as pedidos_concluidos,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as pedidos_cancelados
FROM service_requests;
```

### 2. Fazer Backup (Recomendado)

Antes de excluir, faça backup dos dados:

```sql
-- Criar tabela de backup
CREATE TABLE IF NOT EXISTS service_requests_backup AS 
SELECT * FROM service_requests;

-- Verificar backup
SELECT COUNT(*) FROM service_requests_backup;
```

### 3. Executar Exclusão

**Opção 1: Excluir TODOS os pedidos**

```sql
DELETE FROM public.service_requests;
```

**Opção 2: Excluir apenas pedidos de um cliente específico**

```sql
DELETE FROM public.service_requests 
WHERE client_id = 'UUID_DO_CLIENTE_AQUI';
```

**Opção 3: Excluir apenas pedidos pendentes**

```sql
DELETE FROM public.service_requests 
WHERE status = 'pending';
```

**Opção 4: Excluir pedidos antigos (anteriores a uma data)**

```sql
DELETE FROM public.service_requests 
WHERE created_at < '2025-01-01';
```

### 4. Verificar Resultado

```sql
-- Ver quantos pedidos restam
SELECT COUNT(*) as pedidos_restantes 
FROM service_requests;

-- Verificar se leads foram excluídos
SELECT COUNT(*) as leads_restantes 
FROM leads;

-- Verificar se propostas foram excluídas
SELECT COUNT(*) as propostas_restantes 
FROM proposals;
```

---

## 🔄 Restaurar do Backup (se necessário)

Se precisar restaurar:

```sql
-- Restaurar pedidos do backup
INSERT INTO service_requests 
SELECT * FROM service_requests_backup;

-- Verificar restauração
SELECT COUNT(*) FROM service_requests;
```

---

## 📝 Alternativas Mais Seguras

### Excluir Apenas Pedidos de Teste

```sql
-- Excluir pedidos criados por um usuário específico (ex: usuário de teste)
DELETE FROM public.service_requests 
WHERE client_id IN (
  SELECT id FROM users 
  WHERE email LIKE '%test%' OR email LIKE '%exemplo%'
);
```

### Excluir Pedidos Antigos

```sql
-- Excluir pedidos com mais de 6 meses
DELETE FROM public.service_requests 
WHERE created_at < NOW() - INTERVAL '6 months';
```

### Excluir Pedidos Cancelados

```sql
-- Excluir apenas pedidos cancelados
DELETE FROM public.service_requests 
WHERE status = 'cancelled';
```

---

## ✅ Checklist Antes de Executar

- [ ] Fiz backup dos dados
- [ ] Verifiquei quantos pedidos serão excluídos
- [ ] Entendi que esta operação não pode ser desfeita
- [ ] Confirmei que quero excluir TODOS os pedidos
- [ ] Notifiquei a equipe (se aplicável)

---

## 🚨 Comando Rápido (CUIDADO!)

Se você tem **CERTEZA ABSOLUTA** que quer excluir tudo:

```sql
-- 1. Verificar
SELECT COUNT(*) FROM service_requests;

-- 2. Excluir
DELETE FROM public.service_requests;

-- 3. Confirmar
SELECT COUNT(*) FROM service_requests; -- Deve retornar 0
```

---

## 📞 Suporte

Se tiver dúvidas ou precisar de ajuda:
- Verifique o arquivo: `supabase/migrations/20250128_delete_all_service_requests.sql`
- Consulte a documentação do Supabase
- Faça backup antes de qualquer operação destrutiva

---

**⚠️ LEMBRE-SE: Esta operação é PERMANENTE e IRREVERSÍVEL!**

**Última Atualização**: 2025-01-28

