# 📘 Guia: Como Executar Scripts SQL no Supabase

Este guia mostra como executar os scripts de migração criados para produção.

---

## 🎯 Scripts que Precisam ser Executados

Execute na seguinte ordem:

1. `database/migrations/001_production_indexes.sql` - Índices para performance
2. `database/migrations/002_rate_limiting.sql` - Sistema de rate limiting
3. `database/migrations/003_audit_logs.sql` - Logs de auditoria

---

## 📋 Passo a Passo Detalhado

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto de **produção** (não o de desenvolvimento!)

### Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"** (ícone de banco de dados 📊)
2. Você verá uma tela com um editor SQL no centro

### Passo 3: Executar o Primeiro Script (Índices)

1. Clique no botão **"New query"** (canto superior direito)
2. Abra o arquivo `database/migrations/001_production_indexes.sql` no seu editor de código
3. **Copie TODO o conteúdo** do arquivo (Ctrl+A, Ctrl+C)
4. **Cole no SQL Editor** do Supabase (Ctrl+V)
5. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
6. Aguarde alguns segundos
7. Você deve ver: **"Success. No rows returned"** ou mensagem de sucesso

**✅ Verificação**: Se aparecer algum erro, verifique se já existem alguns índices (isso é normal, o `IF NOT EXISTS` evita erros)

### Passo 4: Executar o Segundo Script (Rate Limiting)

1. Clique em **"New query"** novamente
2. Abra o arquivo `database/migrations/002_rate_limiting.sql`
3. **Copie TODO o conteúdo**
4. **Cole no SQL Editor**
5. Clique em **"Run"** (ou `Ctrl+Enter`)
6. Aguarde a execução
7. Verifique se apareceu mensagem de sucesso

**✅ Verificação**: 
- Vá em **"Table Editor"** no menu lateral
- Procure pela tabela `rate_limits`
- Se existir, está funcionando!

### Passo 5: Executar o Terceiro Script (Audit Logs)

1. Clique em **"New query"** novamente
2. Abra o arquivo `database/migrations/003_audit_logs.sql`
3. **Copie TODO o conteúdo**
4. **Cole no SQL Editor**
5. Clique em **"Run"** (ou `Ctrl+Enter`)
6. Aguarde a execução
7. Verifique se apareceu mensagem de sucesso

**✅ Verificação**:
- Vá em **"Table Editor"**
- Procure pela tabela `audit_logs`
- Se existir, está funcionando!

---

## 🔍 Como Verificar se Funcionou

### Verificar Tabelas Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as novas tabelas:
   - ✅ `rate_limits`
   - ✅ `audit_logs`

### Verificar Índices Criados

1. No SQL Editor, execute esta query:
```sql
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
    AND (indexname LIKE 'idx_%' OR indexname LIKE 'idx_rate_%' OR indexname LIKE 'idx_audit_%')
ORDER BY tablename, indexname;
```

2. Você deve ver vários índices listados

### Verificar Funções Criadas

1. No SQL Editor, execute:
```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('check_rate_limit', 'cleanup_rate_limits', 'log_credit_changes', 'log_credit_transactions', 'log_credit_purchases')
ORDER BY routine_name;
```

2. Você deve ver 5 funções listadas

### Verificar Triggers Criados

1. No SQL Editor, execute:
```sql
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'audit_%'
ORDER BY event_object_table;
```

2. Você deve ver os triggers de auditoria

---

## ⚠️ Possíveis Erros e Soluções

### Erro: "relation already exists"
**Causa**: Alguns índices ou tabelas já existem  
**Solução**: Isso é normal! O `IF NOT EXISTS` evita erros. Pode continuar.

### Erro: "permission denied"
**Causa**: Não tem permissões suficientes  
**Solução**: Certifique-se de estar usando o projeto correto e ter permissões de administrador

### Erro: "function already exists"
**Causa**: Função já foi criada anteriormente  
**Solução**: O script usa `CREATE OR REPLACE`, então deve funcionar. Se persistir, pode ignorar.

### Erro: "trigger already exists"
**Causa**: Trigger já existe  
**Solução**: O script usa `DROP TRIGGER IF EXISTS` antes de criar, então deve funcionar.

---

## 📸 Screenshots de Referência

### Localização do SQL Editor
```
Supabase Dashboard
├── Menu Lateral Esquerdo
│   ├── Table Editor
│   ├── SQL Editor ← AQUI!
│   ├── Database
│   └── ...
```

### Botão "Run"
```
SQL Editor
├── [New query] ← Botão no topo
├── Editor de código (onde cola o SQL)
└── [Run] ou [Ctrl+Enter] ← Para executar
```

---

## ✅ Checklist de Execução

Marque conforme executa:

- [ ] Acessei o Supabase Dashboard
- [ ] Abri o SQL Editor
- [ ] Executei `001_production_indexes.sql` ✅
- [ ] Executei `002_rate_limiting.sql` ✅
- [ ] Executei `003_audit_logs.sql` ✅
- [ ] Verifiquei que as tabelas foram criadas
- [ ] Verifiquei que as funções foram criadas
- [ ] Verifiquei que os triggers foram criados

---

## 🚀 Execução Rápida (Copy-Paste)

Se preferir, pode executar tudo de uma vez:

1. Abra o SQL Editor
2. Cole este conteúdo (combina os 3 scripts):

```sql
-- ============================================
-- SCRIPT 1: ÍNDICES
-- ============================================
-- [Cole aqui o conteúdo de 001_production_indexes.sql]

-- ============================================
-- SCRIPT 2: RATE LIMITING
-- ============================================
-- [Cole aqui o conteúdo de 002_rate_limiting.sql]

-- ============================================
-- SCRIPT 3: AUDIT LOGS
-- ============================================
-- [Cole aqui o conteúdo de 003_audit_logs.sql]
```

3. Clique em "Run"

**Nota**: É melhor executar um por vez para identificar erros específicos.

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema:

1. **Copie a mensagem de erro completa**
2. **Verifique qual script estava executando**
3. **Verifique se está no projeto correto** (produção vs desenvolvimento)

---

## 🎯 Próximos Passos Após Executar

Depois de executar os scripts SQL:

1. ✅ Configurar variáveis de ambiente no Netlify
2. ✅ Configurar secrets no Supabase
3. ✅ Configurar Sentry
4. ✅ Testar tudo funcionando

---

**Boa sorte! 🚀**

