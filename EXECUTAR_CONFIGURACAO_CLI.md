# 🚀 Executar Configuração de Variáveis via CLI

Sim! É possível configurar tudo via CLI. Criei scripts automatizados para facilitar.

---

## 📋 Opções Disponíveis

### Opção 1: Script Interativo (Recomendado)

Execute o script que pergunta cada valor:

```powershell
# Windows PowerShell
.\scripts\configurar-tudo-via-cli.ps1
```

Este script:
- ✅ Verifica se está logado no Netlify e Supabase
- ✅ Pergunta cada valor interativamente
- ✅ Configura tudo automaticamente
- ✅ Mostra progresso e erros

### Opção 2: Scripts Separados

**Netlify apenas:**
```powershell
.\scripts\configurar-variaveis-netlify.ps1
```

**Supabase apenas:**
```powershell
.\scripts\configurar-secrets-supabase.ps1
```

### Opção 3: Comandos Manuais via CLI

Se preferir executar manualmente:

#### Netlify (uma variável por vez):
```bash
netlify env:set EXPO_PUBLIC_SUPABASE_URL="https://qeswqwhccqfbdtmywzkz.supabase.co"
netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY="sua-chave-aqui"
netlify env:set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
netlify env:set EXPO_PUBLIC_STRIPE_SUCCESS_URL="https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso"
netlify env:set EXPO_PUBLIC_STRIPE_CANCEL_URL="https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado"
```

#### Supabase (todos de uma vez):
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_... SUPABASE_SERVICE_ROLE_KEY=eyJ... --project-ref qeswqwhccqfbdtmywzkz
```

---

## 🎯 Execução Rápida (Recomendado)

Execute este comando:

```powershell
.\scripts\configurar-tudo-via-cli.ps1
```

O script vai:
1. ✅ Verificar login no Netlify
2. ✅ Verificar login no Supabase
3. ✅ Perguntar cada valor
4. ✅ Configurar tudo automaticamente

**Tempo estimado**: 10-15 minutos (depende da velocidade de digitação)

---

## 📝 Pré-requisitos

Antes de executar, tenha em mãos:

### Para Netlify:
- ✅ Supabase URL: `https://qeswqwhccqfbdtmywzkz.supabase.co`
- ✅ Supabase Anon Key: (obtenha no dashboard)
- ✅ Stripe Publishable Key: `pk_live_...` ou `pk_test_...`
- ✅ URLs do Stripe (success e cancel)

### Para Supabase:
- ✅ Stripe Secret Key: `sk_live_...` ou `sk_test_...`
- ✅ Stripe Webhook Secret: `whsec_...`
- ✅ Supabase Service Role Key: (obtenha no dashboard)

---

## 🔍 Como Obter os Valores

### Supabase Keys:
1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api
2. Copie:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe Keys:
1. Acesse: https://dashboard.stripe.com/apikeys
2. Certifique-se de estar em **"Live mode"** para produção
3. Copie:
   - **Publishable key** → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY` (clique em "Reveal")

### Stripe Webhook Secret:
1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique no webhook → **"Signing secret"** → **"Reveal"**
3. Copie `whsec_...` → `STRIPE_WEBHOOK_SECRET`

---

## ✅ Verificação Após Configurar

### Verificar Netlify:
```bash
netlify env:list
```

### Verificar Supabase:
```bash
npx supabase secrets list --project-ref qeswqwhccqfbdtmywzkz
```

---

## 🚀 Próximo Passo

Após configurar as variáveis:

1. **Fazer novo deploy no Netlify** para aplicar as variáveis
2. **Testar** se tudo está funcionando
3. **Verificar logs** se houver erros

---

**Boa sorte! 🚀**

