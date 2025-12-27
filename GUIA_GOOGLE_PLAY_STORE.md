# 📱 Guia Completo: Publicar App na Google Play Store

**Data**: Janeiro 2025  
**Plataforma**: Android  
**Ferramenta**: Expo Application Services (EAS)

---

## 📋 Pré-requisitos

Antes de começar, você precisa de:

- [ ] Conta Google Developer (custo único: $25 USD)
- [ ] Conta Expo (gratuita)
- [ ] EAS CLI instalado
- [ ] App configurado e testado
- [ ] Assets preparados (ícones, screenshots, etc.)

---

## 🚀 Passo 1: Criar Conta Google Developer

### 1.1. Criar Conta

1. Acesse: https://play.google.com/console/signup
2. Clique em **"Começar"**
3. Preencha:
   - Nome da conta
   - Email
   - País/Região: **Portugal**
   - Aceite os termos
4. **Pague a taxa única de $25 USD** (válida para sempre)
5. Complete o perfil da conta

### 1.2. Verificar Conta

- Google pode solicitar verificação de identidade
- Pode levar até 48 horas para aprovação

---

## 🔧 Passo 2: Configurar EAS Build

### 2.1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2.2. Login no Expo

```bash
eas login
```

Se não tiver conta Expo:
```bash
eas register
```

### 2.3. Configurar Projeto

```bash
eas build:configure
```

Isso criará o arquivo `eas.json` com as configurações de build.

### 2.4. Verificar/Criar eas.json

Crie ou edite o arquivo `eas.json` na raiz do projeto:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 📦 Passo 3: Preparar Assets

### 3.1. Ícone do App

- **Tamanho**: 512x512px (PNG)
- **Formato**: PNG sem transparência
- **Localização**: `./assets/images/icon-512x512.png`
- ✅ Já configurado no `app.json`

### 3.2. Screenshots (Obrigatórios)

Você precisa de screenshots em diferentes tamanhos:

**Telefone:**
- Mínimo: 2 screenshots
- Recomendado: 4-8 screenshots
- Tamanho: 320px - 3840px de altura
- Proporção: 16:9 ou 9:16

**Tablet (7"):**
- Mínimo: 1 screenshot
- Tamanho: 320px - 3840px de altura

**Tablet (10"):**
- Mínimo: 1 screenshot
- Tamanho: 320px - 3840px de altura

**Como criar screenshots:**
1. Execute o app em um emulador/dispositivo
2. Tire screenshots das telas principais
3. Use ferramentas como:
   - [App Mockup](https://app-mockup.com/)
   - [Screenshot Builder](https://screenshotbuilder.com/)
   - Photoshop/Figma

### 3.3. Imagem de Destaque (Feature Graphic)

- **Tamanho**: 1024x500px
- **Formato**: PNG ou JPG
- **Conteúdo**: Logo + texto promocional
- **Uso**: Banner na loja

### 3.4. Ícone de Alta Resolução

- **Tamanho**: 512x512px
- **Formato**: PNG
- ✅ Já configurado

---

## 🔐 Passo 4: Configurar Credenciais Android

### 4.1. Gerar Keystore

O EAS pode gerar automaticamente, mas você pode criar manualmente:

```bash
# Criar keystore manualmente (opcional)
keytool -genkeypair -v -storetype PKCS12 -keystore elastiquality-release.keystore -alias elastiquality-key -keyalg RSA -keysize 2048 -validity 10000
```

**OU deixe o EAS gerar automaticamente** (recomendado)

### 4.2. Configurar Credenciais no EAS

```bash
eas credentials
```

Escolha:
- **Android**
- **Set up credentials for production**
- Siga as instruções

O EAS irá:
1. Gerar keystore automaticamente
2. Armazenar de forma segura
3. Usar em builds futuros

---

## 🏗️ Passo 5: Build do App Bundle

### 5.1. Build de Produção

```bash
eas build --platform android --profile production
```

**O que acontece:**
- Upload do código para servidores Expo
- Build na nuvem (não precisa de Android Studio)
- Geração do arquivo `.aab` (Android App Bundle)
- Tempo: 15-30 minutos

### 5.2. Monitorar Build

Você receberá um link para acompanhar o progresso:
```
https://expo.dev/accounts/[sua-conta]/builds/[build-id]
```

### 5.3. Download do App Bundle

Após concluir:
- Download automático do `.aab`
- Ou baixe do dashboard do Expo

---

## 📝 Passo 6: Criar App na Google Play Console

### 6.1. Acessar Play Console

1. Acesse: https://play.google.com/console
2. Clique em **"Criar app"**

### 6.2. Informações Básicas

**Nome do app:**
```
Elastiquality
```

**Idioma padrão:**
```
Português (Portugal)
```

**Tipo de app:**
```
App
```

**Gratuito ou pago:**
```
Gratuito
```

**Declarações:**
- ✅ Declaro que tenho todos os direitos necessários
- ✅ Este app cumpre todas as políticas do Google Play

### 6.3. Informações da Loja

**Título curto (30 caracteres):**
```
Elastiquality
```

**Descrição completa (4000 caracteres):**
```
Conectamos clientes a profissionais de serviços em Portugal.

A Elastiquality é a plataforma que facilita o encontro entre quem precisa de serviços e profissionais qualificados em todo o país.

PARA CLIENTES:
✅ Publique pedidos de serviço gratuitamente
✅ Receba propostas de profissionais verificados
✅ Compare preços, avaliações e prazos
✅ Contrate com segurança e avalie o serviço

PARA PROFISSIONAIS:
✅ Encontre leads qualificados na sua região
✅ Desbloqueie contatos de clientes interessados
✅ Envie propostas detalhadas
✅ Construa sua reputação e cresça seu negócio

CATEGORIAS DISPONÍVEIS:
🎨 Pintura
🔧 Canalizador
⚡ Eletricista
🏗️ Construção Civil
🪴 Jardinagem
🧹 Limpeza
🚚 Mudanças
🔨 Carpintaria
E muito mais!

POR QUE ESCOLHER A ELASTIQUALITY?
✅ Leads qualificados por categoria e localização
✅ Sistema de avaliações transparente
✅ Chat integrado para comunicação direta
✅ Pagamentos seguros via Stripe
✅ Suporte dedicado em português

Disponível em Web, Android e iOS. É grátis para solicitar orçamentos!

Baixe agora e encontre o profissional ideal para o seu serviço.
```

**Descrição curta (80 caracteres):**
```
Conectamos clientes a profissionais de serviços em Portugal
```

### 6.4. Categoria e Classificação

**Categoria:**
```
Negócios
```

**Classificação de conteúdo:**
- Responda o questionário
- Selecione: **Todos os públicos** (se aplicável)

### 6.5. Contato e Privacidade

**Email de suporte:**
```
suporte@elastiquality.pt
```

**URL do site:**
```
https://elastiquality.pt
```

**Política de privacidade:**
```
https://elastiquality.pt/privacy
```

---

## 📤 Passo 7: Upload do App Bundle

### 7.1. Acessar Produção

1. No Play Console, vá em **"Produção"** (menu lateral)
2. Clique em **"Criar nova versão"**

### 7.2. Upload do Arquivo

1. Clique em **"Upload do arquivo .aab"**
2. Selecione o arquivo `.aab` gerado pelo EAS
3. Aguarde o upload e processamento

### 7.3. Informações da Versão

**Nome da versão:**
```
1.0.0
```

**Notas da versão:**
```
Versão inicial do Elastiquality
- Conecta clientes a profissionais de serviços
- Sistema de propostas e avaliações
- Chat integrado
- Pagamentos seguros
```

---

## 🖼️ Passo 8: Adicionar Assets Visuais

### 8.1. Screenshots

1. Vá em **"Loja"** → **"Imagens"**
2. Faça upload dos screenshots:
   - Telefone (mínimo 2)
   - Tablet 7" (mínimo 1)
   - Tablet 10" (mínimo 1)

### 8.2. Imagem de Destaque

1. Upload da imagem 1024x500px
2. Deve conter logo e texto promocional

### 8.3. Ícone

- Já será usado do app bundle
- Ou faça upload manual de 512x512px

---

## ✅ Passo 9: Preencher Formulários

### 9.1. Conteúdo do App

- ✅ Descrição completa
- ✅ Screenshots
- ✅ Categoria
- ✅ Classificação

### 9.2. Privacidade

- ✅ Política de privacidade URL
- ✅ Declaração de dados coletados
- ✅ Uso de localização (se aplicável)

### 9.3. Preços e Distribuição

- ✅ País: Portugal (e outros se desejar)
- ✅ Preço: Gratuito
- ✅ Aceitar termos

---

## 🚀 Passo 10: Enviar para Revisão

### 10.1. Revisar Tudo

Antes de enviar, verifique:

- [ ] App bundle carregado
- [ ] Todas as informações preenchidas
- [ ] Screenshots adicionados
- [ ] Política de privacidade linkada
- [ ] Email de suporte configurado
- [ ] Categoria correta
- [ ] Classificação de conteúdo

### 10.2. Enviar

1. Clique em **"Revisar versão"**
2. Revise todas as informações
3. Clique em **"Iniciar lançamento para produção"**
4. Confirme o envio

### 10.3. Aguardar Revisão

**Tempo médio:** 1-3 dias úteis

**Status possíveis:**
- ⏳ Em revisão
- ✅ Publicado
- ❌ Rejeitado (com feedback)

---

## 🔄 Passo 11: Atualizações Futuras

### 11.1. Build Nova Versão

```bash
# Atualizar versão no app.json
# "version": "1.0.1"

# Build
eas build --platform android --profile production
```

### 11.2. Upload Nova Versão

1. Play Console → Produção
2. Criar nova versão
3. Upload novo `.aab`
4. Adicionar notas da versão
5. Enviar para revisão

---

## 🛠️ Comandos Úteis

### Verificar Status do Build

```bash
eas build:list
```

### Ver Credenciais

```bash
eas credentials
```

### Build Local (para testes)

```bash
eas build --platform android --profile preview --local
```

### Atualizar App (OTA - Over The Air)

```bash
eas update --branch production --message "Correção de bugs"
```

---

## 📋 Checklist Final

Antes de publicar, confirme:

- [ ] Conta Google Developer criada ($25 pago)
- [ ] EAS CLI instalado e configurado
- [ ] Build de produção gerado (.aab)
- [ ] App criado no Play Console
- [ ] Todas as informações preenchidas
- [ ] Screenshots adicionados (mínimo 2)
- [ ] Política de privacidade linkada
- [ ] Email de suporte configurado
- [ ] App testado localmente
- [ ] Versão correta no app.json

---

## 🐛 Troubleshooting

### Erro: "Keystore not found"

**Solução:**
```bash
eas credentials
# Configure credenciais novamente
```

### Erro: "Build failed"

**Solução:**
1. Verifique logs no dashboard Expo
2. Confirme que todas as dependências estão no package.json
3. Verifique se app.json está correto

### Erro: "App rejected"

**Possíveis causas:**
- Política de privacidade não acessível
- Screenshots faltando
- Informações incompletas
- Violação de políticas do Google

**Solução:**
- Leia o feedback do Google
- Corrija os problemas
- Reenvie

### App não aparece na busca

**Causa:** Pode levar até 24 horas após publicação

**Solução:** Aguarde e verifique novamente

---

## 💰 Custos

### Google Play Developer

- **Taxa única**: $25 USD
- **Válido para sempre**
- **Permite publicar apps ilimitados**

### Expo EAS Build

- **Plano gratuito**: 30 builds/mês
- **Plano Starter**: $29/mês (100 builds)
- **Plano Production**: $99/mês (500 builds)

**Para começar:** Plano gratuito é suficiente!

---

## 📞 Suporte

**Documentação Expo:**
- https://docs.expo.dev/build/introduction/

**Documentação Google Play:**
- https://support.google.com/googleplay/android-developer

**Suporte Elastiquality:**
- suporte@elastiquality.pt

---

## 🎯 Próximos Passos Após Publicação

1. ✅ Monitorar downloads e avaliações
2. ✅ Responder comentários dos usuários
3. ✅ Preparar atualizações regulares
4. ✅ Configurar analytics (Google Analytics)
5. ✅ Promover o app nas redes sociais
6. ✅ Considerar App Store (iOS)

---

**Boa sorte com a publicação! 🚀**

