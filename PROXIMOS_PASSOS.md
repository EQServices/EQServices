# 🚀 Próximos Passos - Guia Prático

Este documento contém os comandos e passos práticos para implementar as melhorias identificadas.

---

## 📋 Passo 1: Executar Schema SQL no Supabase

### 1.1 Acessar Supabase Dashboard
```
URL: https://qeswqwhccqfbdtmywzkz.supabase.co
```

### 1.2 Ir para SQL Editor
1. Abrir https://supabase.com/dashboard
2. Selecionar projeto "elastiquality"
3. Clicar em "SQL Editor" no menu lateral
4. Clicar em "New Query"

### 1.3 Executar Schema
1. Abrir arquivo `database/schema.sql`
2. Copiar todo o conteúdo
3. Colar no SQL Editor
4. Clicar em "Run" ou pressionar Ctrl+Enter
5. Verificar se não há erros

### 1.4 Verificar Tabelas Criadas
```sql
-- Executar esta query para verificar
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Tabelas esperadas:**
- users
- professionals
- service_requests
- leads
- unlocked_leads
- proposals
- reviews
- credit_transactions
- credit_packages
- conversations
- messages
- notifications

---

## 📋 Passo 2: Configurar Stripe

### 2.1 Criar Conta Stripe
1. Acessar https://stripe.com/pt-pt
2. Clicar em "Começar agora"
3. Preencher dados da empresa
4. Verificar email

### 2.2 Obter Chaves de API
1. Ir para Dashboard → Developers → API keys
2. Copiar "Publishable key" (começa com `pk_test_`)
3. Copiar "Secret key" (começa com `sk_test_`)

### 2.3 Adicionar ao .env
```bash
# Abrir arquivo .env e adicionar:
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2.4 Configurar Produtos
1. Ir para Dashboard → Products
2. Criar 3 produtos:
   - **Pacote Básico**: 50 moedas por €45
   - **Pacote Médio**: 100 moedas por €80
   - **Pacote Premium**: 200 moedas por €140

### 2.5 Configurar Webhook
1. Ir para Dashboard → Developers → Webhooks
2. Clicar em "Add endpoint"
3. URL: `https://qeswqwhccqfbdtmywzkz.supabase.co/functions/v1/stripe-webhook`
4. Selecionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copiar "Signing secret" (começa com `whsec_`)

### 2.6 Testar Localmente
```bash
# Instalar Stripe CLI
# Windows (com Chocolatey):
choco install stripe-cli

# Ou baixar de: https://github.com/stripe/stripe-cli/releases

# Login
stripe login

# Testar webhook localmente
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Em outro terminal, testar pagamento
stripe trigger checkout.session.completed
```

---

## 📋 Passo 3: Configurar Firebase (Notificações Push)

### 3.1 Criar Projeto Firebase
1. Acessar https://console.firebase.google.com
2. Clicar em "Adicionar projeto"
3. Nome: "Elastiquality"
4. Desabilitar Google Analytics (opcional)
5. Clicar em "Criar projeto"

### 3.2 Adicionar App Android
1. Clicar no ícone Android
2. Package name: `com.elastiquality.app`
3. Baixar `google-services.json`
4. Colocar em: `android/app/google-services.json`

### 3.3 Adicionar App iOS
1. Clicar no ícone iOS
2. Bundle ID: `com.elastiquality.app`
3. Baixar `GoogleService-Info.plist`
4. Colocar em: `ios/GoogleService-Info.plist`

### 3.4 Configurar Cloud Messaging
1. Ir para Project Settings → Cloud Messaging
2. Copiar "Server key"
3. Adicionar ao Supabase:
   - Ir para Supabase Dashboard → Settings → API
   - Adicionar em "Custom Claims" ou usar Edge Function

### 3.5 Instalar Dependências
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 3.6 Testar Notificações
```bash
# Executar app
npm run android
# ou
npm run ios

# Verificar se token é gerado no console
```

---

## 📋 Passo 4: Configurar Sentry (Error Tracking)

### 4.1 Criar Conta Sentry
1. Acessar https://sentry.io
2. Criar conta gratuita
3. Criar novo projeto
4. Selecionar "React Native"

### 4.2 Obter DSN
1. Copiar DSN (formato: `https://...@sentry.io/...`)

### 4.3 Adicionar ao .env
```bash
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### 4.4 Instalar e Configurar
```bash
# Instalar
npm install @sentry/react-native

# Configurar no App.tsx (já está parcialmente configurado)
```

### 4.5 Testar
```typescript
// Adicionar em qualquer tela para testar
import * as Sentry from '@sentry/react-native';

// Testar erro
Sentry.captureException(new Error('Teste de erro'));
```

---

## 📋 Passo 5: Implementar Recuperação de Senha

### 5.1 Criar Tela de Reset
```bash
# Criar arquivo
touch src/screens/ResetPasswordScreen.tsx
```

### 5.2 Adicionar Código
Ver exemplo completo em `MELHORIAS_CODIGO.md` seção 1.

### 5.3 Adicionar Rota
```typescript
// Em AppNavigator.tsx
<Stack.Screen
  name="ResetPassword"
  component={ResetPasswordScreen}
  options={{ title: 'Redefinir Senha' }}
/>
```

### 5.4 Testar
1. Ir para tela de login
2. Clicar em "Esqueci minha senha"
3. Inserir email
4. Verificar email recebido
5. Clicar no link
6. Redefinir senha

---

## 📋 Passo 6: Aumentar Cobertura de Testes

### 6.1 Instalar Dependências de Teste
```bash
npm install --save-dev @testing-library/react-native @testing-library/jest-native
```

### 6.2 Executar Testes Existentes
```bash
npm test
```

### 6.3 Ver Cobertura
```bash
npm run test:coverage
```

### 6.4 Adicionar Testes
Ver exemplos em `MELHORIAS_CODIGO.md` seção 7.

### 6.5 Meta de Cobertura
```json
// Em package.json, adicionar:
"jest": {
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

---

## 📋 Passo 7: Testar em Dispositivos Reais

### 7.1 Android
```bash
# Conectar dispositivo via USB
# Habilitar "Depuração USB" no dispositivo

# Verificar dispositivo conectado
adb devices

# Executar app
npm run android
```

### 7.2 iOS
```bash
# Abrir Xcode
open ios/elastiquality.xcworkspace

# Selecionar dispositivo
# Clicar em "Run" (▶️)
```

### 7.3 Web
```bash
# Executar
npm run web

# Testar em diferentes navegadores:
# - Chrome
# - Firefox
# - Safari
# - Edge
```

---

## 📋 Passo 8: Build de Produção

### 8.1 Configurar EAS (Expo Application Services)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar projeto
eas build:configure
```

### 8.2 Build Android
```bash
# Build APK (para testes)
eas build --platform android --profile preview

# Build AAB (para Google Play)
eas build --platform android --profile production
```

### 8.3 Build iOS
```bash
# Build para TestFlight
eas build --platform ios --profile production
```

### 8.4 Build Web
```bash
# Build
npm run build:web

# Deploy para Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=web-build
```

---

## 📋 Passo 9: Monitoramento

### 9.1 Configurar Uptime Monitoring
1. Usar https://uptimerobot.com (gratuito)
2. Adicionar URL: https://elastiquality.pt
3. Configurar alertas por email

### 9.2 Configurar Analytics
```bash
# Já está configurado em src/services/analytics.ts
# Apenas ativar no código
```

### 9.3 Dashboard de Métricas
1. Criar dashboard no Supabase
2. Queries úteis:
```sql
-- Novos usuários por dia
SELECT DATE(created_at) as date, COUNT(*) as count
FROM users
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Pedidos por dia
SELECT DATE(created_at) as date, COUNT(*) as count
FROM service_requests
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Receita por dia
SELECT DATE(created_at) as date, SUM(amount) as revenue
FROM credit_transactions
WHERE type = 'purchase'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 📋 Passo 10: Lançamento Beta

### 10.1 Preparar Lista de Beta Testers
- 50-100 pessoas
- Mix de clientes e profissionais
- Diferentes regiões de Portugal

### 10.2 Criar Formulário de Feedback
```
Google Forms com perguntas:
1. Qual é a sua experiência geral? (1-5)
2. O que você mais gostou?
3. O que você menos gostou?
4. Encontrou algum bug?
5. Sugestões de melhoria?
```

### 10.3 Enviar Convites
```
Assunto: Convite para Beta do Elastiquality

Olá!

Você foi selecionado para testar a nova plataforma Elastiquality!

🔗 Link: https://elastiquality.pt
📱 App Android: [link TestFlight]
🍎 App iOS: [link TestFlight]

Por favor, teste e envie feedback: [link formulário]

Obrigado!
Equipe Elastiquality
```

### 10.4 Monitorar Feedback
- Responder em 24h
- Corrigir bugs críticos imediatamente
- Priorizar melhorias mais solicitadas

---

## ✅ Checklist Final

- [ ] Schema SQL executado
- [ ] Stripe configurado e testado
- [ ] Firebase configurado
- [ ] Sentry configurado
- [ ] Recuperação de senha implementada
- [ ] Cobertura de testes >70%
- [ ] Testado em 3+ dispositivos
- [ ] Build de produção funcionando
- [ ] Monitoramento configurado
- [ ] Beta testers convidados

---

**Boa sorte com o lançamento! 🚀**

