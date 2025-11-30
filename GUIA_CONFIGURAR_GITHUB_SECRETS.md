# 🔐 Guia: Configurar GitHub Secrets para Backups Automáticos

## 📋 Objetivo

Configurar os secrets necessários para que o workflow de backup automático funcione corretamente.

---

## 🚀 Passo a Passo

### 1. Obter Supabase Access Token

1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em **"Generate new token"**
3. Dê um nome descritivo (ex: "GitHub Actions Backup")
4. Copie o token gerado (você só verá uma vez!)

### 2. Configurar Secrets no GitHub

1. Acesse o repositório: https://github.com/SuporteElastiquality/APP
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**

#### Secret 1: `SUPABASE_ACCESS_TOKEN`
- **Name**: `SUPABASE_ACCESS_TOKEN`
- **Value**: Cole o token gerado no passo 1
- Clique em **"Add secret"**

#### Secret 2: `SUPABASE_PROJECT_REF`
- **Name**: `SUPABASE_PROJECT_REF`
- **Value**: `qeswqwhccqfbdtmywzkz`
- Clique em **"Add secret"**

---

## ✅ Verificação

Após configurar os secrets:

1. Vá em **Actions** no GitHub
2. Clique em **"Database Backup"** workflow
3. Clique em **"Run workflow"** → **"Run workflow"**
4. Verifique se o workflow executa com sucesso

---

## 📅 Agendamento

O workflow está configurado para executar:
- **Diariamente às 2h UTC** (3h em Portugal no horário de verão)
- **Manual**: Pode ser executado a qualquer momento via `workflow_dispatch`

---

## 🔍 Troubleshooting

### Erro: "Authentication failed"
- Verifique se o `SUPABASE_ACCESS_TOKEN` está correto
- Gere um novo token se necessário

### Erro: "Project not found"
- Verifique se o `SUPABASE_PROJECT_REF` está correto: `qeswqwhccqfbdtmywzkz`

### Workflow não executa automaticamente
- Verifique se os secrets estão configurados
- Verifique se o arquivo `.github/workflows/backup.yml` existe no repositório

---

**Tempo estimado**: 5 minutos

