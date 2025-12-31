# 🚀 Guia de Deploy no Netlify - Elastiquality

**Data**: 2025-11-17  
**Plataforma**: Netlify  
**Tipo**: Progressive Web App (PWA)

---

## ✅ Pré-requisitos

Antes de fazer o deploy, certifique-se de que:

- [x] Código está funcionando localmente
- [x] Arquivo `.env` está configurado
- [x] Schema SQL foi executado no Supabase
- [x] Não há erros no console
- [x] Testes básicos foram feitos

---

## 📋 Método 1: Deploy via Interface Web (Recomendado)

### Passo 1: Criar Conta no Netlify

1. Acesse https://www.netlify.com
2. Clique em "Sign up"
3. Escolha "Sign up with GitHub" (recomendado)
4. Autorize o Netlify a acessar seus repositórios

### Passo 2: Conectar Repositório

1. No dashboard do Netlify, clique em **"Add new site"**
2. Selecione **"Import an existing project"**
3. Escolha **"Deploy with GitHub"**
4. Selecione o repositório `elastiquality`
5. Clique em **"Authorize Netlify"** se solicitado

### Passo 3: Configurar Build

O Netlify deve detectar automaticamente as configurações do `netlify.toml`, mas verifique:

**Build settings:**
- **Base directory**: (deixe vazio)
- **Build command**: `npx expo export --platform web`
- **Publish directory**: `dist`
- **Node version**: 18

### Passo 4: Configurar Variáveis de Ambiente

1. Antes de fazer deploy, clique em **"Site settings"**
2. No menu lateral, clique em **"Environment variables"**
3. Clique em **"Add a variable"**
4. Adicione as seguintes variáveis:

```
EXPO_PUBLIC_SUPABASE_URL=https://qeswqwhccqfbdtmywzkz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlc3dxd2hjY3FmYmR0bXl3emt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTkwOTcsImV4cCI6MjA3ODI3NTA5N30.zKQ-IonSx1iazytJ8fPb4DrhsccFv1Hdwa0Zhx-14UA
```

**Opcional (adicionar quando configurar):**
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Passo 5: Deploy

1. Volte para a aba **"Deploys"**
2. Clique em **"Deploy site"**
3. Aguarde o build (3-5 minutos)
4. ✅ Site estará disponível em: `https://random-name-123.netlify.app`

### Passo 6: Configurar Domínio Personalizado (Opcional)

1. Vá em **"Site settings"** → **"Domain management"**
2. Clique em **"Add custom domain"**
3. Digite: `elastiquality.pt` ou `app.elastiquality.pt`
4. Siga as instruções para configurar DNS

---

## 📋 Método 2: Deploy via CLI

### Passo 1: Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Passo 2: Login

```bash
netlify login
```

Isso abrirá o navegador para você fazer login.

### Passo 3: Build Local

```bash
npm run build:web
```

Isso criará a pasta `dist` com os arquivos otimizados.

### Passo 4: Deploy

**Deploy de teste:**
```bash
netlify deploy
```

Quando solicitado:
- **Publish directory**: `dist`

**Deploy de produção:**
```bash
netlify deploy --prod
```

### Passo 5: Configurar Variáveis de Ambiente via CLI

```bash
# Adicionar variáveis
netlify env:set EXPO_PUBLIC_SUPABASE_URL "https://qeswqwhccqfbdtmywzkz.supabase.co"
netlify env:set EXPO_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Listar variáveis
netlify env:list
```

---

## 📋 Método 3: Deploy Automático (CI/CD)

### Configurar Deploy Automático

1. No Netlify, vá em **"Site settings"** → **"Build & deploy"**
2. Em **"Continuous deployment"**, clique em **"Edit settings"**
3. Configure:
   - **Branch to deploy**: `main` ou `master`
   - **Build command**: `npx expo export --platform web`
   - **Publish directory**: `dist`

### Criar Arquivo de CI/CD (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build:web
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.EXPO_PUBLIC_SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.EXPO_PUBLIC_SUPABASE_ANON_KEY }}
          
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=dist
```

---

## 🔧 Configurações Avançadas

### 1. Headers de Segurança

Adicione ao `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(self), microphone=(), camera=()"
```

### 2. Cache Optimization

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 3. Redirects Adicionais

```toml
# Redirecionar www para não-www
[[redirects]]
  from = "https://www.elastiquality.pt/*"
  to = "https://elastiquality.pt/:splat"
  status = 301
  force = true

# Redirecionar HTTP para HTTPS
[[redirects]]
  from = "http://elastiquality.pt/*"
  to = "https://elastiquality.pt/:splat"
  status = 301
  force = true
```

---

## ✅ Checklist Pós-Deploy

Após o deploy, verifique:

- [ ] Site está acessível
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Imagens carregam
- [ ] Navegação funciona
- [ ] Console não tem erros
- [ ] Mobile responsivo funciona
- [ ] PWA é instalável
- [ ] Favicon aparece
- [ ] Logo aparece

---

## 🐛 Troubleshooting

### Erro: "Build failed"

**Causa**: Erro no build do Expo  
**Solução**:
```bash
# Testar build localmente
npm run build:web

# Verificar logs no Netlify
```

### Erro: "Page not found" em rotas

**Causa**: Redirects não configurados  
**Solução**: Verificar se `netlify.toml` tem:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Erro: "Supabase connection failed"

**Causa**: Variáveis de ambiente não configuradas  
**Solução**: Verificar variáveis no Netlify:
```bash
netlify env:list
```

### Site carrega mas está em branco

**Causa**: Erro de JavaScript  
**Solução**:
1. Abrir console do navegador (F12)
2. Verificar erros
3. Verificar se variáveis de ambiente estão corretas

---

## 📊 Monitoramento

### Analytics do Netlify

1. Vá em **"Analytics"** no dashboard
2. Veja:
   - Pageviews
   - Unique visitors
   - Top pages
   - Bandwidth usage

### Logs de Deploy

1. Vá em **"Deploys"**
2. Clique em um deploy
3. Veja logs completos

### Logs de Função (se usar)

1. Vá em **"Functions"**
2. Clique em uma função
3. Veja logs em tempo real

---

## 💰 Custos

### Plano Gratuito (Starter)
- ✅ 100 GB bandwidth/mês
- ✅ 300 build minutes/mês
- ✅ Deploy automático
- ✅ HTTPS grátis
- ✅ Domínio personalizado

### Quando Escalar
- **1.000 usuários/mês**: Plano gratuito suficiente
- **10.000 usuários/mês**: Considerar plano Pro ($19/mês)
- **100.000+ usuários/mês**: Plano Business ($99/mês)

---

## 🎯 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Configurar domínio personalizado
2. ✅ Configurar SSL (automático no Netlify)
3. ✅ Adicionar Google Analytics
4. ✅ Configurar Sentry para monitoramento
5. ✅ Testar em diferentes dispositivos
6. ✅ Compartilhar com beta testers

---

## 📞 Suporte

**Documentação Netlify**: https://docs.netlify.com  
**Status Netlify**: https://www.netlifystatus.com  
**Suporte**: https://answers.netlify.com

---

**URL do Site**: https://[seu-site].netlify.app  
**Status**: 🟢 Online  
**Última Atualização**: Automática a cada push

