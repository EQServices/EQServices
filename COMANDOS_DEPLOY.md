# ⚡ Comandos Rápidos de Deploy

Copie e cole estes comandos para fazer deploy rapidamente.

---

## 🚀 Deploy Completo (Um Comando)

### Windows (PowerShell)
```powershell
npm run build:web; if ($?) { netlify deploy --prod }
```

### Linux/Mac (Bash)
```bash
npm run build:web && netlify deploy --prod
```

---

## 📦 Instalação Inicial

### Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### Login no Netlify
```bash
netlify login
```

### Verificar Status
```bash
netlify status
```

---

## 🔨 Build

### Build Local
```bash
npm run build:web
```

### Build com Cache Limpo
```bash
rm -rf dist node_modules/.cache && npm run build:web
```

### Verificar Build
```bash
ls -la dist
```

---

## 🚀 Deploy

### Deploy de Teste (Preview)
```bash
netlify deploy
```

### Deploy de Produção
```bash
netlify deploy --prod
```

### Deploy com Diretório Específico
```bash
netlify deploy --prod --dir=dist
```

---

## 🔧 Configuração

### Inicializar Site
```bash
netlify init
```

### Linkar Site Existente
```bash
netlify link
```

### Ver Configuração
```bash
netlify status
```

---

## 🌐 Variáveis de Ambiente

### Adicionar Variável
```bash
netlify env:set EXPO_PUBLIC_SUPABASE_URL "https://qeswqwhccqfbdtmywzkz.supabase.co"
```

### Listar Variáveis
```bash
netlify env:list
```

### Importar de Arquivo
```bash
netlify env:import .env.production
```

---

## 📊 Monitoramento

### Ver Logs do Último Deploy
```bash
netlify logs
```

### Ver Logs em Tempo Real
```bash
netlify logs --live
```

### Abrir Dashboard
```bash
netlify open
```

### Abrir Site
```bash
netlify open:site
```

---

## 🔄 Rollback

### Listar Deploys
```bash
netlify deploys
```

### Restaurar Deploy Anterior
```bash
netlify rollback
```

---

## 🧹 Limpeza

### Limpar Cache Local
```bash
rm -rf dist node_modules/.cache .expo
```

### Limpar e Reinstalar
```bash
rm -rf node_modules package-lock.json && npm install
```

---

## 🐛 Debug

### Build com Logs Detalhados
```bash
npm run build:web -- --verbose
```

### Testar Build Localmente
```bash
npx serve dist
```

### Verificar Erros
```bash
netlify logs --function=all
```

---

## 📝 Scripts Personalizados

### Deploy Completo (Windows)
```powershell
# Salvar como deploy-quick.ps1
Write-Host "🧹 Limpando..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host "🔨 Building..." -ForegroundColor Yellow
npm run build:web

Write-Host "🚀 Deploying..." -ForegroundColor Yellow
netlify deploy --prod

Write-Host "✅ Concluído!" -ForegroundColor Green
```

### Deploy Completo (Linux/Mac)
```bash
# Salvar como deploy-quick.sh
#!/bin/bash
echo "🧹 Limpando..."
rm -rf dist

echo "🔨 Building..."
npm run build:web

echo "🚀 Deploying..."
netlify deploy --prod

echo "✅ Concluído!"
```

---

## 🎯 Workflows Comuns

### Workflow 1: Primeiro Deploy
```bash
# 1. Instalar CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Build
npm run build:web

# 4. Deploy de teste
netlify deploy

# 5. Verificar e aprovar
netlify open:site

# 6. Deploy de produção
netlify deploy --prod
```

### Workflow 2: Deploy Rápido
```bash
# Build e deploy em um comando
npm run build:web && netlify deploy --prod
```

### Workflow 3: Deploy com Verificação
```bash
# 1. Limpar
rm -rf dist

# 2. Build
npm run build:web

# 3. Testar localmente
npx serve dist

# 4. Deploy
netlify deploy --prod
```

---

## 🔐 Segurança

### Verificar Variáveis de Ambiente
```bash
netlify env:list
```

### Remover Variável
```bash
netlify env:unset NOME_DA_VARIAVEL
```

### Verificar Secrets
```bash
netlify env:list --scope builds
```

---

## 📈 Performance

### Analisar Bundle
```bash
npm run build:web -- --analyze
```

### Verificar Tamanho
```bash
du -sh dist
```

### Otimizar Imagens
```bash
# Instalar imagemin
npm install -g imagemin-cli

# Otimizar
imagemin dist/**/*.{jpg,png} --out-dir=dist
```

---

## 🌍 Domínio

### Adicionar Domínio
```bash
netlify domains:add elastiquality.pt
```

### Listar Domínios
```bash
netlify domains:list
```

### Configurar DNS
```bash
netlify dns:create elastiquality.pt
```

---

## 🔄 CI/CD

### Trigger Build Manual
```bash
netlify build
```

### Ver Build Hooks
```bash
netlify hooks:list
```

### Criar Build Hook
```bash
netlify hooks:create
```

---

## 📦 Backup

### Baixar Site Atual
```bash
netlify deploy:download
```

### Exportar Configuração
```bash
netlify sites:list > sites-backup.txt
```

---

## ⚡ Atalhos Úteis

```bash
# Alias úteis (adicionar ao .bashrc ou .zshrc)
alias nd="netlify deploy"
alias ndp="netlify deploy --prod"
alias nopen="netlify open:site"
alias nlog="netlify logs"
alias nstatus="netlify status"

# Build e deploy rápido
alias bdeploy="npm run build:web && netlify deploy --prod"
```

---

## 🎉 Deploy em 3 Comandos

```bash
# 1. Build
npm run build:web

# 2. Deploy
netlify deploy --prod

# 3. Abrir
netlify open:site
```

**Pronto!** 🚀

---

**Dica**: Salve este arquivo nos favoritos para acesso rápido!

