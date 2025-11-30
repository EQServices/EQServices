# 🐛 Guia: Configurar Sentry para Error Tracking

## 📋 Objetivo

Configurar Sentry para monitorar erros e exceções em produção.

---

## 🚀 Passo a Passo

### 1. Criar Conta no Sentry

1. Acesse: https://sentry.io/signup/
2. Crie uma conta (pode usar GitHub/GitLab para login rápido)
3. Escolha o plano **Free** (suficiente para começar)

### 2. Criar Projeto

1. Após login, clique em **"Create Project"**
2. Selecione **"React Native"** como plataforma
3. Nome do projeto: `Elastiquality`
4. Clique em **"Create Project"**

### 3. Obter DSN

1. Na página do projeto, você verá o **DSN** (Data Source Name)
2. Copie o DSN completo (algo como: `https://xxx@xxx.ingest.sentry.io/xxx`)

### 4. Configurar no Netlify

Execute via CLI:

```powershell
netlify env:set 'EXPO_PUBLIC_SENTRY_DSN' 'https://xxx@xxx.ingest.sentry.io/xxx' --context production
netlify env:set 'EXPO_PUBLIC_SENTRY_ENABLED' 'true' --context production
```

Ou configure manualmente:
1. Acesse: https://app.netlify.com/projects/dainty-gnome-5cbd33/configuration/env
2. Adicione:
   - `EXPO_PUBLIC_SENTRY_DSN` = `https://xxx@xxx.ingest.sentry.io/xxx`
   - `EXPO_PUBLIC_SENTRY_ENABLED` = `true`

### 5. Verificar Instalação

O código já está preparado! Após configurar as variáveis:

1. Faça um novo deploy no Netlify
2. Teste gerando um erro (ex: clique em um botão quebrado)
3. Verifique no dashboard do Sentry se o erro aparece

---

## ✅ Verificação

1. Acesse: https://sentry.io/organizations/[seu-org]/issues/
2. Após alguns minutos de uso, você deve ver eventos aparecendo
3. Clique em um evento para ver detalhes completos

---

## 🔍 Troubleshooting

### Erros não aparecem no Sentry
- Verifique se `EXPO_PUBLIC_SENTRY_DSN` está configurado corretamente
- Verifique se `EXPO_PUBLIC_SENTRY_ENABLED=true`
- Verifique se fez deploy após configurar as variáveis

### Sentry não inicializa
- O código já está implementado em `src/services/errorTracking.ts`
- Verifique os logs do console para erros de inicialização

---

## 📊 Recursos do Sentry

- **Issues**: Lista de erros agrupados
- **Performance**: Monitoramento de performance
- **Releases**: Rastreamento de versões
- **Alerts**: Notificações por email/Slack

---

**Tempo estimado**: 15 minutos

