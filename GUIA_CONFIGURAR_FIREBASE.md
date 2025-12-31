# 🔥 Guia Completo: Configurar Firebase para Notificações Push

**Data**: Janeiro 2025  
**Plataforma**: Android e iOS  
**Serviço**: Firebase Cloud Messaging (FCM)

---

## 📋 Pré-requisitos

Antes de começar, você precisa de:

- [ ] Conta Google (gmail)
- [ ] Acesso ao Firebase Console
- [ ] Projeto Expo configurado
- [ ] EAS Build configurado

---

## 🚀 Passo 1: Criar Projeto no Firebase

### 1.1. Acessar Firebase Console

1. Acesse: https://console.firebase.google.com/
2. Faça login com sua conta Google
3. Clique em **"Adicionar projeto"** ou **"Create a project"**

### 1.2. Configurar Projeto

**Nome do projeto:**
```
Elastiquality
```

**Google Analytics:**
- ✅ Ativar Google Analytics para este projeto
- Escolha uma conta do Analytics (ou crie uma nova)

**Região:**
```
Europa (europe-west) ou mais próxima de Portugal
```

### 1.3. Aceitar Termos

- Aceite os termos de serviço
- Clique em **"Criar projeto"**
- Aguarde a criação (1-2 minutos)

---

## 📱 Passo 2: Adicionar App Android

### 2.1. Adicionar App Android

1. No dashboard do Firebase, clique no ícone **Android** (🟢)
2. Preencha:

**Nome do pacote Android:**
```
com.elastiquality.app
```

**Apelido do app (opcional):**
```
Elastiquality Android
```

**Certificado de depuração SHA-1 (opcional):**
- Deixe em branco por enquanto
- Pode adicionar depois se necessário

3. Clique em **"Registrar app"**

### 2.2. Baixar google-services.json

1. Baixe o arquivo `google-services.json`
2. **IMPORTANTE**: Coloque na **raiz do projeto**:
   ```
   elastiquality/
   └── google-services.json
   ```

3. **NÃO faça commit** deste arquivo (já está no `.gitignore`)

### 2.3. Configurar no app.json

O arquivo já está configurado no `app.json`:
```json
"android": {
  "googleServicesFile": "./google-services.json"
}
```

### 2.4. Adicionar ao EAS Build

Como o arquivo está no `.gitignore`, precisamos enviá-lo via variável de ambiente do EAS:

```bash
# Converter para base64
# Windows PowerShell:
$content = Get-Content google-services.json -Raw
$base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
$base64 | Out-File google-services-base64.txt

# Depois adicionar no EAS:
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --type string --value-file google-services-base64.txt
```

**OU** adicionar manualmente no dashboard do EAS:
1. Acesse: https://expo.dev/accounts/elastiquality/projects/elastiquality/secrets
2. Clique em **"Create secret"**
3. Nome: `GOOGLE_SERVICES_JSON`
4. Valor: Cole o conteúdo completo do `google-services.json`
5. Visibilidade: **Build-time only**

---

## 🍎 Passo 3: Adicionar App iOS (Opcional)

### 3.1. Adicionar App iOS

1. No dashboard do Firebase, clique no ícone **iOS** (🍎)
2. Preencha:

**ID do pacote iOS:**
```
com.elastiquality.app
```

**Apelido do app:**
```
Elastiquality iOS
```

**ID da App Store (opcional):**
- Deixe em branco se ainda não publicou

3. Clique em **"Registrar app"**

### 3.2. Baixar GoogleService-Info.plist

1. Baixe o arquivo `GoogleService-Info.plist`
2. Coloque na raiz do projeto:
   ```
   elastiquality/
   └── GoogleService-Info.plist
   ```

3. Já está configurado no `app.json`:
```json
"ios": {
  "googleServicesFile": "./GoogleService-Info.plist"
}
```

---

## 🔔 Passo 4: Configurar Cloud Messaging (FCM)

### 4.1. Ativar Cloud Messaging

1. No Firebase Console, vá em **"Build"** → **"Cloud Messaging"**
2. Clique em **"Começar"** ou **"Get started"**
3. Aceite os termos

### 4.2. Configurar Chaves de API

1. Vá em **"Project Settings"** (⚙️) → **"Cloud Messaging"**
2. Em **"Cloud Messaging API (Legacy)"**:
   - ✅ Ative se ainda não estiver ativo
   - Isso permite usar FCM Legacy

3. Em **"Cloud Messaging API (V1)"**:
   - ✅ Ative para usar FCM V1 (recomendado)

### 4.3. Obter Chave do Servidor

1. Vá em **"Project Settings"** → **"Cloud Messaging"**
2. Em **"Cloud Messaging API (Legacy)"**, copie a **"Server key"**
3. Guarde esta chave (será usada no backend)

---

## 🔐 Passo 5: Configurar Credenciais no EAS

### 5.1. Configurar Google Service Account

Para enviar notificações do backend, você precisa de uma Service Account:

1. No Firebase Console, vá em **"Project Settings"** → **"Service accounts"**
2. Clique em **"Generate new private key"**
3. Baixe o arquivo JSON
4. **NÃO faça commit** deste arquivo

### 5.2. Adicionar ao EAS

```bash
eas credentials
```

Escolha:
- **Android**
- **Push Notifications (FCM V1)**
- **Set up a new Google Service Account Key**
- Faça upload do arquivo JSON baixado

---

## 📝 Passo 6: Atualizar Código do App

### 6.1. Verificar Configuração Atual

O código já está preparado em `src/services/notifications.ts`. Verifique se está correto.

### 6.2. Adicionar Plugin de Volta

Após configurar o Firebase, adicione o plugin de volta no `app.json`:

```json
"plugins": [
  [
    "expo-notifications",
    {
      "icon": "./assets/images/icon-192x192.png",
      "color": "#2f61a6",
      "sounds": []
    }
  ],
  "expo-secure-store",
  ...
]
```

### 6.3. Configurar Permissões Android

No `app.json`, adicione permissões (já devem estar):

```json
"android": {
  "permissions": [
    "ACCESS_FINE_LOCATION",
    "ACCESS_COARSE_LOCATION",
    "RECEIVE_BOOT_COMPLETED",
    "VIBRATE"
  ]
}
```

---

## 🧪 Passo 7: Testar Notificações

### 7.1. Build com Firebase

Após configurar tudo:

```bash
eas build --platform android --profile preview
```

### 7.2. Testar no Dispositivo

1. Instale o APK no dispositivo Android
2. Faça login no app
3. O app deve solicitar permissão para notificações
4. Verifique se o token aparece no Supabase (tabela `device_tokens`)

### 7.3. Enviar Notificação de Teste

**Via Firebase Console:**
1. Vá em **"Cloud Messaging"**
2. Clique em **"Send your first message"**
3. Preencha:
   - Título: "Teste"
   - Texto: "Esta é uma notificação de teste"
   - App: Selecione o app Android
4. Clique em **"Enviar"**

**Via Backend (Supabase Function):**
Crie uma função Edge Function para enviar notificações:

```typescript
// supabase/functions/send-notification/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const { token, title, body } = await req.json()
  
  const response = await fetch('https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token: token,
        notification: {
          title: title,
          body: body,
        },
      },
    }),
  })
  
  return new Response(JSON.stringify(await response.json()))
})
```

---

## 🔧 Passo 8: Configurar Variáveis de Ambiente

### 8.1. Variáveis no EAS

Adicione as variáveis de ambiente no EAS:

```bash
# Firebase Project ID
eas secret:create --scope project --name FIREBASE_PROJECT_ID --value "seu-project-id"

# Firebase Server Key (Legacy)
eas secret:create --scope project --name FIREBASE_SERVER_KEY --value "sua-server-key"
```

### 8.2. Variáveis no Supabase

Se usar Supabase Functions, adicione no Supabase:

```bash
supabase secrets set FIREBASE_PROJECT_ID=seu-project-id
supabase secrets set FIREBASE_SERVER_KEY=sua-server-key
```

---

## 📋 Checklist de Configuração

Antes de fazer build de produção, confirme:

- [ ] Projeto Firebase criado
- [ ] App Android adicionado no Firebase
- [ ] `google-services.json` baixado e colocado na raiz
- [ ] `google-services.json` adicionado como secret no EAS
- [ ] Cloud Messaging ativado
- [ ] Chave do servidor copiada
- [ ] Service Account criada e adicionada ao EAS
- [ ] Plugin `expo-notifications` adicionado no `app.json`
- [ ] Permissões Android configuradas
- [ ] Testado em dispositivo físico

---

## 🐛 Troubleshooting

### Erro: "google-services.json is missing"

**Solução:**
1. Verifique se o arquivo está na raiz do projeto
2. Adicione como secret no EAS Build
3. Ou faça commit temporário (não recomendado)

### Erro: "FirebaseApp not initialized"

**Solução:**
1. Verifique se o `google-services.json` está correto
2. Confirme que o package name está correto: `com.elastiquality.app`
3. Rebuild o app

### Notificações não chegam

**Possíveis causas:**
- Token não registrado corretamente
- Permissões não concedidas
- Firebase não configurado corretamente
- Backend não está enviando corretamente

**Solução:**
1. Verifique logs do app
2. Confirme token no Supabase
3. Teste via Firebase Console primeiro
4. Verifique configuração do backend

### Build falha com Firebase

**Solução:**
1. Remova temporariamente o plugin `expo-notifications`
2. Faça build sem Firebase primeiro
3. Depois adicione Firebase gradualmente

---

## 📚 Recursos Adicionais

**Documentação Firebase:**
- https://firebase.google.com/docs/cloud-messaging

**Documentação Expo Notifications:**
- https://docs.expo.dev/versions/latest/sdk/notifications/

**Guia EAS Build:**
- https://docs.expo.dev/build/introduction/

---

## 💰 Custos Firebase

### Plano Gratuito (Spark)

- ✅ 10.000 mensagens/dia (FCM)
- ✅ 1 GB storage
- ✅ 10 GB transferência/mês
- ✅ Suficiente para começar!

### Quando Escalar

- **10.000+ mensagens/dia**: Considerar plano Blaze (pay-as-you-go)
- **100.000+ mensagens/dia**: Plano Blaze necessário

**Para começar:** Plano gratuito é suficiente!

---

## 🎯 Próximos Passos

Após configurar Firebase:

1. ✅ Fazer build de teste com Firebase
2. ✅ Testar notificações no dispositivo
3. ✅ Configurar backend para enviar notificações
4. ✅ Implementar notificações por eventos (novos leads, propostas, etc.)
5. ✅ Configurar notificações agendadas (se necessário)

---

**Boa sorte com a configuração! 🔥**

