# 🚀 Como Executar Scripts SQL no Supabase - Guia Rápido

## 📍 Passo 1: Acessar o Supabase

1. Abra seu navegador e acesse: **https://supabase.com/dashboard**
2. Faça login na sua conta
3. **IMPORTANTE**: Selecione o projeto de **PRODUÇÃO** (não o de desenvolvimento!)

---

## 📍 Passo 2: Abrir o SQL Editor

1. No menu lateral esquerdo, procure por **"SQL Editor"** (ícone de banco de dados 📊)
2. Clique nele
3. Você verá uma tela com um editor de código SQL no centro

---

## 📍 Passo 3: Executar Cada Script

### Script 1: Índices (001_production_indexes.sql)

1. Clique no botão **"New query"** (canto superior direito, ao lado de "Templates")
2. Abra o arquivo `database/migrations/001_production_indexes.sql` no Cursor/VS Code
3. Selecione TODO o conteúdo (Ctrl+A)
4. Copie (Ctrl+C)
5. Volte para o Supabase e cole no editor SQL (Ctrl+V)
6. Clique no botão **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter` no Mac)
7. Aguarde alguns segundos
8. ✅ Você deve ver: **"Success. No rows returned"** ou **"Success"**

**⏱️ Tempo**: ~30 segundos

---

### Script 2: Rate Limiting (002_rate_limiting.sql)

1. Clique em **"New query"** novamente (ou limpe o editor anterior)
2. Abra o arquivo `database/migrations/002_rate_limiting.sql`
3. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
4. Cole no SQL Editor do Supabase
5. Clique em **"Run"** (ou `Ctrl+Enter`)
6. Aguarde a execução
7. ✅ Deve aparecer mensagem de sucesso

**⏱️ Tempo**: ~10 segundos

---

### Script 3: Audit Logs (003_audit_logs.sql)

1. Clique em **"New query"** novamente
2. Abra o arquivo `database/migrations/003_audit_logs.sql`
3. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
4. Cole no SQL Editor do Supabase
5. Clique em **"Run"** (ou `Ctrl+Enter`)
6. Aguarde a execução
7. ✅ Deve aparecer mensagem de sucesso

**⏱️ Tempo**: ~10 segundos

---

## ✅ Como Verificar se Funcionou

### Verificação Rápida (1 minuto)

1. No menu lateral, clique em **"Table Editor"**
2. Procure pelas novas tabelas:
   - ✅ `rate_limits` (deve existir)
   - ✅ `audit_logs` (deve existir)

Se ambas existirem, **está funcionando!** ✅

---

## 🎯 Resumo Visual

```
1. Acessar Supabase Dashboard
   ↓
2. Clicar em "SQL Editor" (menu lateral)
   ↓
3. Clicar em "New query"
   ↓
4. Abrir arquivo SQL no Cursor
   ↓
5. Copiar TODO o conteúdo (Ctrl+A, Ctrl+C)
   ↓
6. Colar no Supabase SQL Editor (Ctrl+V)
   ↓
7. Clicar em "Run" ou pressionar Ctrl+Enter
   ↓
8. Verificar mensagem de sucesso
   ↓
9. Repetir para próximo script
```

---

## ⚠️ Possíveis Avisos (São Normais!)

Se aparecer algo como:
- ✅ "relation already exists" - **Normal**, significa que já existe (o `IF NOT EXISTS` evita erro)
- ✅ "function already exists" - **Normal**, o `CREATE OR REPLACE` resolve
- ✅ "Success. No rows returned" - **Perfeito!** Significa que executou com sucesso

**Só se preocupe se aparecer "ERROR" em vermelho!**

---

## 🆘 Se Der Erro

1. **Copie a mensagem de erro completa**
2. Verifique:
   - Está no projeto correto? (produção, não desenvolvimento)
   - Copiou TODO o conteúdo do arquivo?
   - Não esqueceu nenhuma linha?

3. **Erro comum**: Se aparecer erro sobre permissões, certifique-se de estar logado como administrador do projeto

---

## 📸 Onde Está Cada Coisa

### Menu Lateral do Supabase:
```
┌─────────────────┐
│ Table Editor    │ ← Ver tabelas
│ SQL Editor      │ ← AQUI! (onde executa)
│ Database        │
│ Authentication  │
│ Storage         │
│ Edge Functions  │
└─────────────────┘
```

### Botões no SQL Editor:
```
┌─────────────────────────────────────┐
│ [Templates] [New query] [Run] [▶]  │ ← Botões no topo
├─────────────────────────────────────┤
│                                     │
│  [Aqui você cola o SQL]            │ ← Editor
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ Checklist Final

Execute cada script e marque:

- [ ] ✅ Executei `001_production_indexes.sql` - Sucesso!
- [ ] ✅ Executei `002_rate_limiting.sql` - Sucesso!
- [ ] ✅ Executei `003_audit_logs.sql` - Sucesso!
- [ ] ✅ Verifiquei que `rate_limits` existe na Table Editor
- [ ] ✅ Verifiquei que `audit_logs` existe na Table Editor

---

## 🎉 Pronto!

Depois de executar os 3 scripts, você terá:
- ✅ Índices de performance criados
- ✅ Sistema de rate limiting funcionando
- ✅ Logs de auditoria ativos

**Tempo total**: ~5 minutos

**Próximo passo**: Configurar variáveis de ambiente no Netlify e Supabase!

---

**Dúvidas?** Consulte o arquivo `GUIA_EXECUTAR_SQL_SUPABASE.md` para mais detalhes.

