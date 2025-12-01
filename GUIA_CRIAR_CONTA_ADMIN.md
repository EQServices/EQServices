# 👤 Guia: Criar Conta Administrativa

## 📋 Objetivo

Criar uma conta de administrador para acessar o dashboard administrativo e visualizar:
- Usuários cadastrados
- Fluxo de pedidos
- Fluxo de caixa

---

## 🚀 Passo a Passo

### 1. Executar Migration SQL

Primeiro, execute a migration que adiciona o sistema admin:

1. **Acesse**: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
2. **Abra o arquivo**: `database/migrations/004_admin_system.sql`
3. **Copie todo o conteúdo** e cole no SQL Editor
4. **Execute** (Run)

Isso criará:
- Campo `is_admin` na tabela `users`
- Views administrativas
- Função para tornar usuário admin

---

### 2. Criar Usuário Admin

#### Opção A: Tornar Usuário Existente Admin

Se você já tem uma conta cadastrada:

1. **Acesse**: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
2. **Execute**:

```sql
-- Substitua 'seu-email@exemplo.com' pelo email do usuário que quer tornar admin
SELECT make_user_admin('seu-email@exemplo.com');
```

#### Opção B: Criar Novo Usuário Admin

1. **Registre-se normalmente** no app como cliente ou profissional
2. **Anote o email** usado
3. **Execute** a função acima com o email

---

### 3. Verificar se Funcionou

Execute esta query para verificar:

```sql
SELECT 
  email,
  user_type,
  is_admin,
  created_at
FROM users
WHERE is_admin = TRUE;
```

Você deve ver seu usuário listado com `is_admin = TRUE`.

---

### 4. Fazer Login

1. **Faça logout** se estiver logado
2. **Faça login** com a conta admin
3. **Você será redirecionado** automaticamente para o Dashboard Admin

---

## 📊 O que o Admin Pode Ver

### Dashboard Principal
- Estatísticas gerais (clientes, profissionais, pedidos)
- Resumo financeiro
- Links rápidos para outras telas

### Usuários
- Lista completa de todos os usuários
- Filtro por tipo (cliente/profissional)
- Busca por email ou nome
- Informações detalhadas de cada usuário

### Pedidos
- Lista de todos os pedidos de serviço
- Status de cada pedido
- Informações do cliente
- Número de propostas e desbloqueios

### Fluxo de Caixa
- Receita total
- Compras de créditos
- Desbloqueios de leads
- Resumo mensal (últimos 12 meses)

---

## 🔒 Segurança

### Políticas RLS

As views administrativas são protegidas. Apenas usuários com `is_admin = TRUE` podem:
- Ver todas as informações
- Acessar o dashboard admin

### Recomendações

1. **Use email seguro** para conta admin
2. **Não compartilhe** credenciais admin
3. **Revise regularmente** quem tem acesso admin
4. **Use 2FA** se disponível

---

## 🛠️ Comandos Úteis

### Listar Todos os Admins

```sql
SELECT email, user_type, created_at 
FROM users 
WHERE is_admin = TRUE;
```

### Remover Admin (se necessário)

```sql
UPDATE users 
SET is_admin = FALSE 
WHERE email = 'email-a-remover@exemplo.com';
```

### Verificar Views Admin

```sql
-- Ver estatísticas gerais
SELECT * FROM admin_statistics;

-- Ver usuários
SELECT * FROM admin_users_summary LIMIT 10;

-- Ver pedidos
SELECT * FROM admin_orders_summary LIMIT 10;

-- Ver fluxo de caixa
SELECT * FROM admin_cash_flow;
```

---

## ✅ Checklist

- [ ] Migration SQL executada (`004_admin_system.sql`)
- [ ] Usuário criado ou existente identificado
- [ ] Função `make_user_admin()` executada
- [ ] Verificado que `is_admin = TRUE` no banco
- [ ] Login realizado com conta admin
- [ ] Dashboard admin acessível

---

**Tempo estimado**: 10 minutos

