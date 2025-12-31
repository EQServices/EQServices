# 🚀 Guia de Deploy no Vercel - Elastiquality

**Status**: ✅ Configuração Pronta  
**Plataforma**: Vercel  
**Tempo Estimado**: 5-10 minutos

---

## ✅ Pré-requisitos

- [x] Código funciona localmente
- [x] Build funciona (`npm run build:web`)
- [x] Arquivo `vercel.json` configurado
- [x] Variáveis de ambiente preparadas

---

## 🚀 Deploy Rápido (CLI)

### Passo 1: Login no Vercel

```bash
vercel login
```

Siga as instruções no navegador para autenticar.

### Passo 2: Build Local (Opcional, mas recomendado)

```bash
npm run build:web
```

Isso cria a pasta `dist` com os arquivos prontos para deploy.

### Passo 3: Deploy de Produção

```bash
vercel --prod
```

**Ou deploy de preview (teste):**
```bash
vercel
```

---

## 🌐 Deploy via Interface Web (Alternativa)

### Passo 1: Acessar Vercel Dashboard

1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New Project"**

### Passo 2: Conectar Repositório

1. Selecione o repositório `elastiquality`
2. O Vercel detectará automaticamente o `vercel.json`

### Passo 3: Configurar Variáveis de Ambiente

1. Na seção **"Environment Variables"**, adicione:

```
EXPO_PUBLIC_SUPABASE_URL=https://qeswqwhccqfbdtmywzkz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Opcional (quando configurar):**
```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_STRIPE_SUCCESS_URL=https://seu-dominio.vercel.app/checkout/sucesso
EXPO_PUBLIC_STRIPE_CANCEL_URL=https://seu-dominio.vercel.app/checkout/cancelado
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Passo 4: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-5 minutos)
3. ✅ Site estará disponível em: `https://elastiquality-[hash].vercel.app`

---

## 📋 Configuração Atual (vercel.json)

```json
{
  "buildCommand": "npm run build:web",
  "outputDirectory": "dist",
  "devCommand": "npm run web",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 🔧 Comandos Úteis

### Ver Status
```bash
vercel ls
```

### Ver Logs
```bash
vercel logs
```

### Abrir Dashboard
```bash
vercel inspect
```

### Remover Deploy
```bash
vercel remove
```

### Listar Projetos
```bash
vercel projects ls
```

---

## 🌍 Domínio Personalizado

### Adicionar Domínio

1. No Vercel Dashboard: **Settings** → **Domains**
2. Adicione seu domínio: `elastiquality.pt`
3. Configure DNS conforme instruções
4. Aguarde propagação (até 48h)

### Via CLI
```bash
vercel domains add elastiquality.pt
```

---

## 🔄 Deploy Automático

O Vercel faz deploy automático quando você faz push para o repositório:

- **Branch `main`**: Deploy de produção
- **Outras branches**: Deploy de preview

---

## 🐛 Troubleshooting

### Build Falha
```bash
# Testar build localmente
npm run build:web

# Ver logs detalhados
vercel logs --follow
```

### Variáveis de Ambiente Não Funcionam
```bash
# Verificar variáveis configuradas
vercel env ls

# Adicionar variável via CLI
vercel env add EXPO_PUBLIC_SUPABASE_URL production
```

### Site em Branco
- Verificar se `dist` foi criado corretamente
- Verificar se `index.html` existe em `dist`
- Verificar variáveis de ambiente no dashboard

---

## 📊 Monitoramento

### Analytics
- Acesse: Dashboard → Analytics
- Veja: Pageviews, visitors, performance

### Logs
- Acesse: Dashboard → Deployments → [deploy] → Logs
- Ou via CLI: `vercel logs`

---

## 💰 Custos

### Vercel (Plano Gratuito)
- ✅ 100 GB bandwidth/mês
- ✅ Builds ilimitados
- ✅ HTTPS grátis
- ✅ Deploy automático
- ✅ Domínio personalizado

**Suficiente para**: 1.000-5.000 usuários/mês

---

## ✅ Checklist Rápido

### Antes do Deploy
- [x] Build local funciona
- [x] `vercel.json` configurado
- [x] Variáveis de ambiente preparadas

### Durante o Deploy
- [ ] Login no Vercel (`vercel login`)
- [ ] Deploy executado (`vercel --prod`)
- [ ] Aguardar build (2-5 min)

### Depois do Deploy
- [ ] Testar site
- [ ] Verificar login/registro
- [ ] Verificar responsividade
- [ ] Configurar domínio (opcional)

---

## 🎯 Comando Mais Rápido

Se você já está logado no Vercel:

```bash
npm run build:web && vercel --prod
```

**Pronto!** 🎉

---

## 📞 Suporte

**Vercel Docs**: https://vercel.com/docs  
**Vercel Status**: https://www.vercel-status.com  
**Vercel Support**: https://vercel.com/support

---

**Última Atualização**: 2025-01-28  
**Status**: ✅ Pronto para Deploy

