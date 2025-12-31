# ⚠️ CORREÇÃO URGENTE: Template de Email no Supabase

## Problema Identificado

O link de reset de senha está redirecionando para `/` em vez de `/reset-password` porque o **template de email no Supabase não está configurado corretamente**.

## Solução Imediata

### Passo 1: Acessar Templates de Email

1. Acesse: https://app.supabase.com/
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates**
4. Clique na aba **Reset Password** (ou "Recovery")

### Passo 2: Substituir o Template Atual

**DELETE TODO O CONTEÚDO ATUAL** e substitua por:

```html
<h2>Redefinir sua senha</h2>

<p>Olá,</p>

<p>Recebemos uma solicitação para redefinir a senha da sua conta no EQServices.</p>

<p>Clique no link abaixo para redefinir sua senha:</p>

<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>

<p>Se você não solicitou esta redefinição, ignore este email.</p>

<p><strong>Importante:</strong><br>
• Este link expira em 1 hora<br>
• Só pode ser usado uma vez</p>

<p>Obrigado,<br>
Equipa EQServices</p>
```

### Passo 3: Verificar Configuração

1. **Site URL** deve estar: `https://www.eqservices.pt` (sem barra no final)
2. **Redirect URLs** deve conter: `https://www.eqservices.pt/reset-password`
3. O template **DEVE** usar `{{ .ConfirmationURL }}` (não construir manualmente)

### Passo 4: Testar

1. Solicite um novo reset de senha
2. Verifique o email
3. O link deve ser algo como:
   ```
   https://www.eqservices.pt/reset-password#access_token=...&type=recovery
   ```
   OU
   ```
   https://qeswqwhccqfbdtmywzkz.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://www.eqservices.pt/reset-password
   ```

## ⚠️ IMPORTANTE

- **NÃO** use `{{ .SiteURL }}/reset-password` - isso não inclui o token!
- **USE** `{{ .ConfirmationURL }}` - isso já inclui o token e a URL correta automaticamente
- O Supabase substitui `{{ .ConfirmationURL }}` pela URL completa com token

## Por que isso acontece?

O Supabase gera o link de duas formas:

1. **Formato correto** (quando usa `{{ .ConfirmationURL }}`):
   - `https://www.eqservices.pt/reset-password#access_token=...&type=recovery`

2. **Formato incorreto** (quando constrói manualmente):
   - `https://supabase.co/auth/v1/verify?token=...&redirect_to=https://www.eqservices.pt/`
   - Neste caso, o `redirect_to` usa o Site URL padrão (`/`) em vez do `redirectTo` do código

## Solução Temporária (Já Implementada)

Mesmo que o link redirecione para `/`, a aplicação agora:
1. Detecta o token nos query parameters
2. Processa o token automaticamente
3. Redireciona para `/reset-password`

Mas **é melhor corrigir o template** para evitar essa etapa extra.

