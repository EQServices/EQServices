# ✅ Configuração do Sentry - Concluída

**Data**: 15 de Janeiro de 2025

---

## 📋 Informações Configuradas

### DSN do Sentry
```
https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472
```

### Variáveis de Ambiente Necessárias no Netlify

1. **EXPO_PUBLIC_SENTRY_DSN**
   - Valor: `https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472`

2. **EXPO_PUBLIC_SENTRY_ENABLED**
   - Valor: `true`

---

## 🔧 Como Configurar no Netlify

### Opção 1: Via Netlify Dashboard (Recomendado)

1. **Acesse**: https://app.netlify.com/sites/dainty-gnome-5cbd33/settings/deploys#environment-variables

2. **Clique em "Add a variable"** e adicione:

   **Variável 1:**
   - Key: `EXPO_PUBLIC_SENTRY_DSN`
   - Value: `https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472`
   - Scopes: `Production`, `Deploy previews`, `Branch deploys`

   **Variável 2:**
   - Key: `EXPO_PUBLIC_SENTRY_ENABLED`
   - Value: `true`
   - Scopes: `Production`, `Deploy previews`, `Branch deploys`

3. **Salve** as alterações

4. **Faça um novo deploy**:
   - Vá em: https://app.netlify.com/sites/dainty-gnome-5cbd33/deploys
   - Clique em "Trigger deploy" → "Deploy site"

### Opção 2: Via Netlify CLI

```powershell
# Instalar Netlify CLI (se ainda não tiver)
npm install -g netlify-cli

# Fazer login
netlify login

# Configurar variáveis
netlify env:set EXPO_PUBLIC_SENTRY_DSN "https://1f64e493ce8a3698166ea7d0300f05e1@o4510460187705344.ingest.de.sentry.io/4510460190523472" --context production
netlify env:set EXPO_PUBLIC_SENTRY_ENABLED "true" --context production

# Ou usar o script automatizado
.\scripts\configurar-sentry-netlify.ps1
```

---

## ✅ Verificação

### 1. Verificar se Sentry está Capturando Erros

Após o deploy:

1. **Acesse**: https://sentry.io
2. **Faça login** na sua conta
3. **Selecione o projeto**: Elastiquality (ou o nome que você deu)
4. **Verifique** se há erros sendo capturados

### 2. Testar Captura de Erro

Para testar se está funcionando:

1. **Acesse a aplicação** em produção
2. **Force um erro** (ex: clique em um botão que cause erro)
3. **Verifique no Sentry** se o erro foi capturado

### 3. Verificar Logs

O Sentry deve capturar:
- ✅ Erros JavaScript/TypeScript
- ✅ Erros de rede
- ✅ Erros de autenticação
- ✅ Stack traces completos
- ✅ Contexto do usuário
- ✅ Informações do dispositivo

---

## 📊 O que o Sentry Captura

### Informações Automáticas
- Stack traces completos
- URL da página onde ocorreu o erro
- Navegador e versão
- Sistema operacional
- Resolução da tela
- User agent

### Contexto do Usuário (se logado)
- ID do usuário
- Email (se disponível)
- Tipo de usuário (client/professional)

### Breadcrumbs
- Ações do usuário antes do erro
- Navegação entre telas
- Requisições de rede
- Console logs

---

## 🔍 Monitoramento

### Dashboard do Sentry

Acesse: https://sentry.io para ver:
- **Issues**: Erros capturados
- **Performance**: Tempo de resposta
- **Releases**: Versões do app
- **Users**: Usuários afetados

### Alertas

Configure alertas no Sentry para:
- Novos erros
- Erros críticos
- Taxa de erro alta
- Performance degradada

---

## 🛠️ Código Já Configurado

O código já está pronto para usar o Sentry:

- ✅ `src/services/errorTracking.ts` - Serviço de error tracking
- ✅ `src/config/analytics.ts` - Inicialização do monitoramento
- ✅ `App.tsx` - Inicialização no app
- ✅ `src/contexts/AuthContext.tsx` - Contexto do usuário

---

## 📝 Próximos Passos

1. ✅ Configurar variáveis no Netlify (fazer agora)
2. ⚠️ Fazer novo deploy
3. ⚠️ Testar captura de erros
4. ⚠️ Configurar alertas no Sentry
5. ⚠️ Revisar erros capturados periodicamente

---

## 🔗 Links Úteis

- **Sentry Dashboard**: https://sentry.io
- **Netlify Environment Variables**: https://app.netlify.com/sites/dainty-gnome-5cbd33/settings/deploys#environment-variables
- **Documentação Sentry React Native**: https://docs.sentry.io/platforms/react-native/

---

**Status**: ✅ DSN configurado, aguardando configuração no Netlify

