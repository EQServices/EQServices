# Configurar Template de Email de Reset de Senha no Supabase

## Problema
O link no email não contém o token porque o template de email não está usando a variável correta do Supabase.

## Solução: Configurar o Template no Supabase

### Passo 1: Acessar Templates de Email

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Email Templates**
4. Clique na aba **Reset Password** (ou "Recovery")

### Passo 2: Configurar o Template

O template deve usar `{{ .ConfirmationURL }}` que já inclui o token automaticamente.

**Template HTML Recomendado:**

```html
<h2>Redefinir sua senha</h2>

<p>Olá,</p>

<p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>

<p>Clique no link abaixo para redefinir sua senha:</p>

<p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>

<p>Se você não solicitou esta redefinição, ignore este email.</p>

<p>Este link expira em 1 hora e só pode ser usado uma vez.</p>

<p>Obrigado,<br>Equipa EQServices</p>
```

**Template de Texto Simples (Alternativa):**

```
Redefinir sua senha

Olá,

Recebemos uma solicitação para redefinir a senha da sua conta.

Clique no link abaixo para redefinir sua senha:

{{ .ConfirmationURL }}

Se você não solicitou esta redefinição, ignore este email.

Este link expira em 1 hora e só pode ser usado uma vez.

Obrigado,
Equipa EQServices
```

### Passo 3: Variáveis Disponíveis

O Supabase fornece as seguintes variáveis para templates:

- `{{ .ConfirmationURL }}` - **USE ESTA** - URL completa com token incluído automaticamente
- `{{ .TokenHash }}` - Hash do token (se precisar construir a URL manualmente)
- `{{ .SiteURL }}` - URL base do site (configurada em URL Configuration)
- `{{ .Email }}` - Email do usuário
- `{{ .RedirectTo }}` - URL de redirecionamento especificada no código

### Passo 4: Verificar Configuração

1. **Site URL** deve estar configurado como: `https://www.eqservices.pt`
2. **Redirect URLs** deve conter: `https://www.eqservices.pt/reset-password`
3. O template deve usar `{{ .ConfirmationURL }}` (não construir a URL manualmente)

### Passo 5: Testar

1. Solicite um novo reset de senha
2. Verifique o email recebido
3. O link deve ser algo como:
   ```
   https://www.eqservices.pt/reset-password#access_token=eyJ...&type=recovery
   ```

## ⚠️ IMPORTANTE

- **NÃO** construa a URL manualmente usando `{{ .SiteURL }}/reset-password`
- **USE** `{{ .ConfirmationURL }}` que já inclui o token automaticamente
- O Supabase adiciona automaticamente o hash `#access_token=...&type=recovery` ao final da URL

## Exemplo de Template Completo

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #2f61a6; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">EQServices</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; margin-top: 20px;">
    <h2 style="color: #2f61a6;">Redefinir sua senha</h2>
    
    <p>Olá,</p>
    
    <p>Recebemos uma solicitação para redefinir a senha da sua conta no EQServices.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background-color: #2f61a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Redefinir Senha
      </a>
    </p>
    
    <p style="font-size: 14px; color: #666;">
      Ou copie e cole este link no seu navegador:<br>
      <span style="word-break: break-all;">{{ .ConfirmationURL }}</span>
    </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #999;">
      <strong>Importante:</strong><br>
      • Este link expira em 1 hora<br>
      • Só pode ser usado uma vez<br>
      • Se você não solicitou esta redefinição, ignore este email
    </p>
    
    <p style="margin-top: 30px;">
      Obrigado,<br>
      <strong>Equipa EQServices</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
    <p>EQServices - Conectando clientes a profissionais</p>
    <p>Suporte: <a href="mailto:suporte@eqservices.pt">suporte@eqservices.pt</a></p>
  </div>
</body>
</html>
```

## Verificação Final

Após configurar o template:

1. ✅ Template usa `{{ .ConfirmationURL }}`
2. ✅ Site URL está como `https://www.eqservices.pt`
3. ✅ Redirect URL `https://www.eqservices.pt/reset-password` está na lista
4. ✅ Teste enviando um email de reset
5. ✅ Verifique se o link contém `#access_token=...&type=recovery`

Se o problema persistir, verifique também:
- Se o email está sendo enviado (verifique spam)
- Se há erros no console do navegador ao clicar no link
- Se a URL de redirecionamento está exatamente como configurada

