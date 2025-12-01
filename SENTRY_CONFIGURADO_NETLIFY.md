# ✅ Sentry Configurado no Netlify via CLI

**Data**: 15 de Janeiro de 2025

---

## 📋 Variáveis Configuradas

### EXPO_PUBLIC_SENTRY_DSN
- **Valor**: `https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472`
- **Contextos**: Production, Deploy Preview, Branch Deploy

### EXPO_PUBLIC_SENTRY_ENABLED
- **Valor**: `true`
- **Contextos**: Production, Deploy Preview, Branch Deploy

---

## ✅ Status

- ✅ Variáveis configuradas via Netlify CLI
- ✅ Aplicadas em todos os contextos (production, preview, branch)
- ⚠️ **Próximo passo**: Fazer novo deploy para aplicar as mudanças

---

## 🚀 Próximos Passos

### 1. Fazer Novo Deploy

Opção 1: Via Netlify Dashboard
1. Acesse: https://app.netlify.com/sites/dainty-gnome-5cbd33/deploys
2. Clique em **"Trigger deploy"** → **"Deploy site"**

Opção 2: Via CLI
```powershell
netlify deploy --prod
```

### 2. Verificar Configuração

Após o deploy, verifique se as variáveis estão ativas:

```powershell
netlify env:list
```

### 3. Testar Sentry

1. Acesse a aplicação em produção
2. Force um erro (ex: clique em um botão que cause erro)
3. Verifique no Sentry: https://sentry.io
4. O erro deve aparecer no dashboard

---

## 🔍 Verificação

### Ver Variáveis Configuradas

```powershell
netlify env:list
```

### Ver Logs do Deploy

```powershell
netlify logs
```

---

## 📊 Monitoramento

Após o deploy, o Sentry começará a capturar:
- ✅ Erros JavaScript/TypeScript
- ✅ Erros de rede
- ✅ Erros de autenticação
- ✅ Stack traces completos
- ✅ Contexto do usuário
- ✅ Informações do dispositivo

---

**Status**: ✅ Configurado, aguardando deploy

