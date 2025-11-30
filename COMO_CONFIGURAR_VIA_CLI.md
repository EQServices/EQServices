# 🚀 Como Configurar Variáveis via CLI - Guia Rápido

Sim! É possível configurar tudo via CLI. Escolha o método que preferir:

---

## 🎯 Método 1: Script Interativo (Mais Fácil)

Execute o script que pergunta cada valor:

```powershell
.\scripts\configurar-variaveis-rapido.ps1
```

**O que faz:**
- ✅ Usa o projeto Netlify já linkado (`dainty-gnome-5cbd33`)
- ✅ Usa o project-ref do Supabase (`qeswqwhccqfbdtmywzkz`)
- ✅ Pergunta cada valor interativamente
- ✅ Configura tudo automaticamente

**Tempo**: 5-10 minutos

---

## 🎯 Método 2: Importar de Arquivo

1. **Crie o arquivo `.env.production`** baseado em `.env.production.example`
2. **Preencha com seus valores reais**
3. **Execute**:
```powershell
netlify env:import .env.production
```

**Para Supabase secrets**, execute:
```powershell
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_... SUPABASE_SERVICE_ROLE_KEY=eyJ... --project-ref qeswqwhccqfbdtmywzkz
```

---

## 🎯 Método 3: Comandos Individuais

### Netlify (uma por vez):
```powershell
netlify env:set EXPO_PUBLIC_SUPABASE_URL="https://qeswqwhccqfbdtmywzkz.supabase.co"
netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY="sua-chave-aqui"
netlify env:set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
netlify env:set EXPO_PUBLIC_STRIPE_SUCCESS_URL="https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso"
netlify env:set EXPO_PUBLIC_STRIPE_CANCEL_URL="https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado"
```

### Supabase (todos de uma vez):
```powershell
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_... STRIPE_WEBHOOK_SECRET=whsec_... SUPABASE_SERVICE_ROLE_KEY=eyJ... --project-ref qeswqwhccqfbdtmywzkz
```

---

## 📋 Checklist de Valores Necessários

Antes de executar, tenha em mãos:

### Netlify:
- [ ] `EXPO_PUBLIC_SUPABASE_URL` → `https://qeswqwhccqfbdtmywzkz.supabase.co`
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` → (obtenha no dashboard)
- [ ] `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...` ou `pk_test_...`
- [ ] `EXPO_PUBLIC_STRIPE_SUCCESS_URL` → `https://dainty-gnome-5cbd33.netlify.app/checkout/sucesso`
- [ ] `EXPO_PUBLIC_STRIPE_CANCEL_URL` → `https://dainty-gnome-5cbd33.netlify.app/checkout/cancelado`

### Supabase:
- [ ] `STRIPE_SECRET_KEY` → `sk_live_...` ou `sk_test_...`
- [ ] `STRIPE_WEBHOOK_SECRET` → `whsec_...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` → (obtenha no dashboard)

---

## 🔍 Onde Obter os Valores

### Supabase:
**URL**: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api
- **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
- **anon public** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### Stripe:
**URL**: https://dashboard.stripe.com/apikeys
- **Publishable key** → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** → `STRIPE_SECRET_KEY`

**Webhook**: https://dashboard.stripe.com/webhooks
- **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## ✅ Verificar Configuração

### Netlify:
```powershell
netlify env:list
```

### Supabase:
```powershell
npx supabase secrets list --project-ref qeswqwhccqfbdtmywzkz
```

---

## 🚀 Recomendação

**Use o Método 1** (script interativo) - é o mais fácil e seguro!

```powershell
.\scripts\configurar-variaveis-rapido.ps1
```

---

**Boa sorte! 🚀**

