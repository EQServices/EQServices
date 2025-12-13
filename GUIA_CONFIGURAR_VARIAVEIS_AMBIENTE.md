# 🔧 Guia Completo: Configurar Variáveis de Ambiente

**Tempo estimado**: 30 minutos  
**Dificuldade**: Fácil

---

## 📋 Checklist de Variáveis Necessárias

### Netlify Dashboard (Frontend)
- [ ] `EXPO_PUBLIC_SUPABASE_URL`
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `EXPO_PUBLIC_STRIPE_SUCCESS_URL`
- [ ] `EXPO_PUBLIC_STRIPE_CANCEL_URL`
- [ ] `EXPO_PUBLIC_SENTRY_DSN` (opcional, mas recomendado)
- [ ] `EXPO_PUBLIC_SENTRY_ENABLED` (opcional)

### Supabase Dashboard (Edge Functions)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_URL` (opcional, mas útil)

---

## 🌐 Parte 1: Configurar Variáveis no Netlify

### Passo 1: Acessar o Netlify Dashboard

1. Abra seu navegador e acesse: **https://app.netlify.com**
2. Faça login na sua conta
3. Selecione o site **"Elastiquality"** (ou o nome do seu site)

### Passo 2: Navegar para Environment Variables

1. No menu superior, clique em **"Site settings"** (ou "Configurações do site")
2. No menu lateral esquerdo, procure por **"Environment variables"** (ou "Variáveis de ambiente")
3. Clique nele

### Passo 3: Adicionar Variáveis do Supabase

**Variável 1: EXPO_PUBLIC_SUPABASE_URL**

1. Clique no botão **"Add variable"** (ou "Adicionar variável")
2. **Key**: `EXPO_PUBLIC_SUPABASE_URL`
3. **Value**: `https://qeswqwhccqfbdtmywzkz.supabase.co` (ou seu project URL)
4. **Scopes**: Selecione **"Production"** (e "Deploy previews" se quiser)
5. Clique em **"Save"**

**Variável 2: EXPO_PUBLIC_SUPABASE_ANON_KEY**

1. Clique em **"Add variable"** novamente
2. **Key**: `EXPO_PUBLIC_SUPABASE_ANON_KEY`
3. **Value**: Sua chave anon do Supabase (obtenha em: Supabase Dashboard → Settings → API → anon public)
4. **Scopes**: **"Production"**
5. Clique em **"Save"**

### Passo 4: Adicionar Variáveis do Stripe

**Variável 3: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY**

1. **Key**: `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. **Value**: `pk_live_...` (chave de produção) ou `pk_test_...` (para testes)
3. **Scopes**: **"Production"**
4. **Save**

**Variável 4: EXPO_PUBLIC_STRIPE_SUCCESS_URL**

1. **Key**: `EXPO_PUBLIC_STRIPE_SUCCESS_URL`
2. **Value**: `https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso` (ou seu domínio)
3. **Scopes**: **"Production"**
4. **Save**

**Variável 5: EXPO_PUBLIC_STRIPE_CANCEL_URL**

1. **Key**: `EXPO_PUBLIC_STRIPE_CANCEL_URL`
2. **Value**: `https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado` (ou seu domínio)
3. **Scopes**: **"Production"**
4. **Save**

### Passo 5: Adicionar Variáveis do Sentry (Opcional)

**Variável 6: EXPO_PUBLIC_SENTRY_DSN**

1. **Key**: `EXPO_PUBLIC_SENTRY_DSN`
2. **Value**: `https://xxx@xxx.ingest.sentry.io/xxx` (obtenha em sentry.io)
3. **Scopes**: **"Production"**
4. **Save**

**Variável 7: EXPO_PUBLIC_SENTRY_ENABLED**

1. **Key**: `EXPO_PUBLIC_SENTRY_ENABLED`
2. **Value**: `true`
3. **Scopes**: **"Production"**
4. **Save**

### ✅ Verificação Netlify

Após adicionar todas, você deve ver uma lista com 7 variáveis (ou 5 se não adicionar Sentry).

---

## 🗄️ Parte 2: Configurar Secrets no Supabase

### Passo 1: Acessar o Supabase Dashboard

1. Acesse: **https://supabase.com/dashboard**
2. Faça login
3. Selecione o projeto de **produção** (`qeswqwhccqfbdtmywzkz`)

### Passo 2: Navegar para Edge Functions Secrets

1. No menu lateral esquerdo, clique em **"Edge Functions"**
2. Clique na aba **"Secrets"** (ou "Segredos")
3. Você verá uma lista de secrets existentes (pode estar vazia)

### Passo 3: Adicionar Secret: STRIPE_SECRET_KEY

1. Clique no botão **"Add new secret"** (ou "Adicionar novo segredo")
2. **Name**: `STRIPE_SECRET_KEY`
3. **Value**: `sk_live_...` (chave secreta de produção do Stripe)
   - Obtenha em: https://dashboard.stripe.com/apikeys
   - **IMPORTANTE**: Use a chave de **PRODUÇÃO** (`sk_live_...`), não a de teste!
4. Clique em **"Save"** ou **"Add"**

### Passo 4: Adicionar Secret: STRIPE_WEBHOOK_SECRET

1. Clique em **"Add new secret"** novamente
2. **Name**: `STRIPE_WEBHOOK_SECRET`
3. **Value**: `whsec_...` (webhook secret do Stripe)
   - Obtenha em: https://dashboard.stripe.com/webhooks
   - Clique no webhook → "Reveal" no "Signing secret"
4. Clique em **"Save"**

### Passo 5: Adicionar Secret: SUPABASE_SERVICE_ROLE_KEY

1. Clique em **"Add new secret"** novamente
2. **Name**: `SUPABASE_SERVICE_ROLE_KEY`
3. **Value**: Sua Service Role Key do Supabase
   - Obtenha em: Supabase Dashboard → Settings → API → `service_role` (secret)
   - **ATENÇÃO**: Esta é uma chave muito sensível! Não compartilhe!
4. Clique em **"Save"**

### Passo 6: Adicionar Secret: SUPABASE_URL (Opcional mas Recomendado)

1. **Name**: `SUPABASE_URL`
2. **Value**: `https://qeswqwhccqfbdtmywzkz.supabase.co` (seu project URL)
3. **Save**

### ✅ Verificação Supabase

Você deve ver pelo menos 3 secrets listados:
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

---

## 📝 Resumo das Variáveis

### Netlify (Frontend - Públicas)
```env
EXPO_PUBLIC_SUPABASE_URL=https://qeswqwhccqfbdtmywzkz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_STRIPE_SUCCESS_URL=https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso
EXPO_PUBLIC_STRIPE_CANCEL_URL=https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado
EXPO_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
EXPO_PUBLIC_SENTRY_ENABLED=true
```

### Supabase (Backend - Secrets)
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://qeswqwhccqfbdtmywzkz.supabase.co
```

---

## 🔍 Como Obter Cada Valor

### Supabase URL e Keys

1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api
2. Você verá:
   - **Project URL**: `https://qeswqwhccqfbdtmywzkz.supabase.co` → Use para `EXPO_PUBLIC_SUPABASE_URL` e `SUPABASE_URL`
   - **anon public**: Chave longa começando com `eyJ...` → Use para `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret): Chave longa → Use para `SUPABASE_SERVICE_ROLE_KEY`

### Stripe Keys

1. Acesse: https://dashboard.stripe.com/apikeys
2. Certifique-se de estar em **"Live mode"** (modo produção)
3. Você verá:
   - **Publishable key**: `pk_live_...` → Use para `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key**: `sk_live_...` → Use para `STRIPE_SECRET_KEY` (clique em "Reveal")

### Stripe Webhook Secret

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no webhook configurado (ou crie um novo)
3. Role até "Signing secret"
4. Clique em **"Reveal"**
5. Copie o valor `whsec_...` → Use para `STRIPE_WEBHOOK_SECRET`

### Sentry DSN

1. Acesse: https://sentry.io
2. Vá em **Settings** → **Projects** → Selecione seu projeto
3. Vá em **Client Keys (DSN)**
4. Copie o DSN → Use para `EXPO_PUBLIC_SENTRY_DSN`

---

## ⚠️ Importante

### Segurança

- ✅ **NUNCA** commite essas chaves no Git
- ✅ Use chaves de **PRODUÇÃO** apenas em produção
- ✅ Use chaves de **TESTE** para desenvolvimento
- ✅ A `SUPABASE_SERVICE_ROLE_KEY` é muito sensível - trate com cuidado!

### URLs de Produção

- Substitua `dainty-gnome-5cbd33.netlify.app` pelo seu domínio real quando configurar
- URLs do Stripe devem apontar para o domínio de produção

---

## ✅ Checklist Final

### Netlify
- [ ] `EXPO_PUBLIC_SUPABASE_URL` configurada
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada
- [ ] `EXPO_PUBLIC_STRIPE_SUCCESS_URL` configurada
- [ ] `EXPO_PUBLIC_STRIPE_CANCEL_URL` configurada
- [ ] `EXPO_PUBLIC_SENTRY_DSN` configurada (opcional)
- [ ] `EXPO_PUBLIC_SENTRY_ENABLED` configurada (opcional)

### Supabase
- [ ] `STRIPE_SECRET_KEY` configurada
- [ ] `STRIPE_WEBHOOK_SECRET` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `SUPABASE_URL` configurada (opcional)

---

## 🚀 Após Configurar

1. **Fazer novo deploy no Netlify** para aplicar as variáveis
2. **Testar** se tudo está funcionando
3. **Verificar logs** se houver erros

---

## 📞 Precisa de Ajuda?

Se tiver dificuldade para encontrar alguma chave:
- **Supabase**: Settings → API
- **Stripe**: Dashboard → Developers → API keys
- **Sentry**: Settings → Projects → Client Keys

---

**Tempo estimado**: 30 minutos  
**Dificuldade**: Fácil (apenas copiar e colar valores)

**Boa sorte! 🚀**

