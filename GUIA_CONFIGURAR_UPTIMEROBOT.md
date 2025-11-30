# 📊 Guia: Configurar UptimeRobot para Monitoramento

## 📋 Objetivo

Configurar monitoramento de uptime para receber alertas quando o site estiver offline.

---

## 🚀 Passo a Passo

### 1. Criar Conta

1. Acesse: https://uptimerobot.com/signUp
2. Preencha o formulário de registro
3. Confirme o email

### 2. Criar Monitor

1. Após login, clique em **"Add New Monitor"**
2. Preencha:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Elastiquality Web`
   - **URL**: `https://dainty-gnome-5cbd33.netlify.app`
   - **Monitoring Interval**: `5 minutes` (recomendado)
3. Clique em **"Create Monitor"**

### 3. Configurar Alertas

1. Vá em **"My Settings"** → **"Alert Contacts"**
2. Clique em **"Add Alert Contact"**
3. Escolha:
   - **Type**: `E-mail` ou `SMS`
   - **Value**: Seu email/telefone
4. Salve

### 4. Associar Alertas ao Monitor

1. Vá em **"My Monitors"**
2. Clique no monitor criado
3. Em **"Alert Contacts"**, selecione os contatos configurados
4. Salve

---

## ✅ Verificação

1. Aguarde alguns minutos
2. Verifique se o monitor mostra status **"Up"** (verde)
3. Teste manualmente: acesse o site e verifique se está funcionando

---

## 🔔 Alertas

Você receberá alertas quando:
- O site ficar offline (down)
- O site voltar online (up)
- O tempo de resposta estiver muito alto

---

## 📊 Dashboard

No dashboard você pode ver:
- Status atual (Up/Down)
- Tempo de resposta
- Uptime percentual
- Histórico de eventos

---

## 💡 Dicas

- Configure múltiplos alertas (email + SMS) para maior confiabilidade
- Use intervalos menores (5 min) para detecção mais rápida
- Configure alertas para diferentes horários se necessário

---

**Tempo estimado**: 10 minutos

