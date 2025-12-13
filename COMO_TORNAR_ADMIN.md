# 🔐 Como Tornar elastiquality@elastiquality.pt Admin

## 📋 Opção 1: Via Script Node.js (RECOMENDADO)

### **Passo 1: Obter a Service Role Key**

1. Acesse o Supabase Dashboard:
   👉 https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api

2. Na seção **"Project API keys"**, copie a chave **"service_role"**
   - ⚠️ ATENÇÃO: Esta chave é SECRETA! Não compartilhe!

### **Passo 2: Configurar a Variável de Ambiente**

**PowerShell** (Windows):
```powershell
$env:SUPABASE_SERVICE_ROLE_KEY="cole_sua_service_role_key_aqui"
```

**CMD** (Windows):
```cmd
set SUPABASE_SERVICE_ROLE_KEY=cole_sua_service_role_key_aqui
```

**Bash** (Linux/Mac):
```bash
export SUPABASE_SERVICE_ROLE_KEY="cole_sua_service_role_key_aqui"
```

### **Passo 3: Executar o Script**

```bash
node scripts/criar-e-tornar-admin.js
```

### **Resultado Esperado**:

```
🚀 Iniciando processo de criação do perfil Elastiquality...

📋 Passo 1: Verificando se o usuário já existe...
📋 Passo 2: Criando usuário no Supabase Auth...
✅ Usuário criado no Auth!
   ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

📋 Passo 3: Inserindo dados na tabela users...
✅ Dados inseridos na tabela users!

📋 Passo 4: Criando perfil profissional...
✅ Perfil profissional criado!

📋 Passo 5: Tornando usuário admin...
✅ Usuário tornado admin com sucesso!

📋 Passo 6: Verificando...
✅ Verificação concluída:
   Email: elastiquality@elastiquality.pt
   Tipo: professional
   Admin: true
   Criado em: 01/12/2025, 16:30:00

🎉 SUCESSO! Perfil Elastiquality criado e configurado como ADMIN!

📱 Próximos passos:
   1. Acesse: https://dainty-gnome-5cbd33.netlify.app
   2. Faça login com:
      Email: elastiquality@elastiquality.pt
      Senha: Empresa2025!
   3. Você será redirecionado para o Dashboard Admin

✅ O perfil tem acesso a:
   - TODAS as 51 categorias de serviços
   - TODAS as 20 regiões de Portugal
   - 10.000 créditos iniciais
   - Dashboard Admin completo
```

---

## 📋 Opção 2: Via Supabase SQL Editor (MANUAL)

Se você não conseguir executar o script Node.js, pode fazer manualmente:

### **Passo 1: Criar Usuário no Auth**

1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/auth/users
2. Clique em **"Add User"**
3. Preencha:
   - **Email**: `elastiquality@elastiquality.pt`
   - **Password**: `Empresa2025!`
   - **Auto Confirm User**: ✅ Marque esta opção
4. Clique em **"Create User"**
5. **COPIE O UUID** do usuário criado

### **Passo 2: Executar SQL**

1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
2. Cole e execute o seguinte SQL (substitua `USER_ID_AQUI` pelo UUID copiado):

```sql
-- Inserir na tabela users
INSERT INTO public.users (
  id,
  email,
  name,
  first_name,
  last_name,
  phone,
  user_type,
  location_label,
  is_admin,
  created_at,
  updated_at
) VALUES (
  'USER_ID_AQUI'::uuid, -- SUBSTITUA pelo UUID do usuário
  'elastiquality@elastiquality.pt',
  'Elastiquality',
  'Elastiquality',
  'Portugal',
  '+351000000000',
  'professional',
  'Portugal',
  TRUE, -- JÁ CRIAR COMO ADMIN
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = TRUE,
  updated_at = NOW();

-- Inserir na tabela professionals
INSERT INTO public.professionals (
  id,
  categories,
  regions,
  credits,
  rating,
  total_reviews
) VALUES (
  'USER_ID_AQUI'::uuid, -- SUBSTITUA pelo UUID do usuário
  ARRAY['all'], -- Todas as categorias
  ARRAY['all'], -- Todas as regiões
  10000,
  5.0,
  0
) ON CONFLICT (id) DO UPDATE SET
  credits = 10000,
  rating = 5.0;

-- Verificar
SELECT 
  email,
  user_type,
  is_admin,
  created_at
FROM users
WHERE email = 'elastiquality@elastiquality.pt';
```

### **Resultado Esperado**:

```
email                           | user_type    | is_admin | created_at
--------------------------------|--------------|----------|------------
elastiquality@elastiquality.pt  | professional | true     | 2025-12-01
```

---

## 🎯 Testar o Login

1. **Acesse**: https://dainty-gnome-5cbd33.netlify.app
2. **Faça login** com:
   - Email: `elastiquality@elastiquality.pt`
   - Senha: `Empresa2025!`
3. **Você será redirecionado** automaticamente para o **Dashboard Admin**! 🎉

---

## ✅ O que o Perfil Elastiquality Pode Fazer

### **Como Admin**:
- ✅ Ver Dashboard Admin com estatísticas completas
- ✅ Gerenciar todos os usuários (clientes e profissionais)
- ✅ Ver todos os pedidos de serviço
- ✅ Acompanhar fluxo de caixa e receita
- ✅ Exportar relatórios (futuro)
- ✅ Moderar conteúdo (futuro)

### **Como Profissional**:
- ✅ Ver TODAS as oportunidades de trabalho
- ✅ Acesso a TODAS as 51 categorias
- ✅ Atende em TODAS as 20 regiões de Portugal
- ✅ 10.000 créditos para desbloquear leads
- ✅ Enviar propostas ilimitadas

---

## 🔍 Verificar se Funcionou

Execute no SQL Editor:

```sql
-- Ver dados do usuário
SELECT 
  id,
  email,
  user_type,
  is_admin,
  created_at
FROM users
WHERE email = 'elastiquality@elastiquality.pt';

-- Ver dados do profissional
SELECT 
  p.id,
  p.categories,
  p.regions,
  p.credits,
  p.rating,
  u.email
FROM professionals p
JOIN users u ON p.id = u.id
WHERE u.email = 'elastiquality@elastiquality.pt';
```

---

## ❓ Problemas Comuns

### **Erro: "Invalid login credentials"**
- O usuário não foi criado no Auth
- A senha está incorreta
- O email não foi confirmado

**Solução**: Crie o usuário manualmente no Auth Dashboard (Opção 2)

### **Erro: "User already exists"**
- O usuário já existe, mas não é admin

**Solução**: Execute apenas o UPDATE:
```sql
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'elastiquality@elastiquality.pt';
```

### **Erro: "SUPABASE_SERVICE_ROLE_KEY não configurada"**
- A variável de ambiente não foi definida

**Solução**: Configure a variável (veja Passo 2 da Opção 1)

---

## 📞 Próximos Passos

Depois de criar o admin:

1. ✅ Teste o login
2. ✅ Explore o Dashboard Admin
3. ✅ Verifique todas as funcionalidades
4. ✅ Monitore a plataforma
5. 🟡 Implemente melhorias de produção (veja `ANALISE_PRODUCAO_COMPLETA.md`)

---

**Boa sorte! 🚀**

