# ✅ Instruções: Configurar Sentry no Netlify

**DSN do Sentry**: `https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472`

---

## 🚀 Passo a Passo Rápido

### 1. Acessar Netlify Dashboard

Acesse: **https://app.netlify.com/sites/dainty-gnome-5cbd33/settings/deploys#environment-variables**

### 2. Adicionar Variáveis

Clique em **"Add a variable"** e adicione:

#### Variável 1:
- **Key**: `EXPO_PUBLIC_SENTRY_DSN`
- **Value**: `https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472`
- **Scopes**: Marque todas (`Production`, `Deploy previews`, `Branch deploys`)

#### Variável 2:
- **Key**: `EXPO_PUBLIC_SENTRY_ENABLED`
- **Value**: `true`
- **Scopes**: Marque todas (`Production`, `Deploy previews`, `Branch deploys`)

### 3. Salvar

Clique em **"Save"** para salvar as alterações.

### 4. Fazer Novo Deploy

1. Vá em: **https://app.netlify.com/sites/dainty-gnome-5cbd33/deploys**
2. Clique em **"Trigger deploy"** → **"Deploy site"**
3. Aguarde o deploy completar

---

## ✅ Verificação

Após o deploy:

1. **Acesse**: https://sentry.io
2. **Faça login** na sua conta
3. **Selecione o projeto**: Elastiquality
4. **Verifique** se há erros sendo capturados

---

## 🧪 Testar

Para testar se está funcionando:

1. Acesse a aplicação em produção
2. Force um erro (ex: clique em um botão que cause erro)
3. Verifique no Sentry se o erro foi capturado

---

**Tempo estimado**: 5 minutos

