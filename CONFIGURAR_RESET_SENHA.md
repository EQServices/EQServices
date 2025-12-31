# Configuração do Reset de Senha

## Problema
O link de reset de senha enviado pelo Supabase não funciona porque a URL de redirecionamento não está configurada corretamente.

## Solução Implementada

### 1. Tela de Reset de Senha
Foi criada a tela `ResetPasswordScreen` que processa o token do link de reset e permite ao usuário definir uma nova senha.

### 2. URL de Redirecionamento
A URL de redirecionamento foi atualizada para usar `https://www.eqservices.pt/reset-password`.

### 3. Configuração do Supabase

**IMPORTANTE**: Você precisa configurar duas coisas no Supabase:

#### 3.1. URL Configuration

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **URL Configuration**
4. Em **Redirect URLs**, adicione:
   ```
   https://www.eqservices.pt/reset-password
   https://www.eqservices.pt/**
   ```
5. Em **Site URL**, certifique-se de que está configurado como:
   ```
   https://www.eqservices.pt
   ```
6. Clique em **Save**

#### 3.2. Email Template (CRÍTICO)

**O link não funcionará se o template não estiver configurado corretamente!**

1. No Supabase, vá em **Authentication** → **Email Templates**
2. Clique na aba **Reset Password** (ou "Recovery")
3. **IMPORTANTE**: O template DEVE usar `{{ .ConfirmationURL }}` que já inclui o token automaticamente
4. Exemplo de template:
   ```html
   <h2>Redefinir sua senha</h2>
   <p>Clique no link abaixo para redefinir sua senha:</p>
   <p><a href="{{ .ConfirmationURL }}">Redefinir Senha</a></p>
   ```
5. **NÃO** construa a URL manualmente - use `{{ .ConfirmationURL }}`
6. Clique em **Save**

📖 **Veja o arquivo `CONFIGURAR_TEMPLATE_EMAIL_RESET.md` para template completo e detalhado.**

### 4. Como Funciona

1. Usuário solicita reset de senha na tela de login
2. Supabase envia email com link contendo token
3. Usuário clica no link e é redirecionado para `https://www.eqservices.pt/reset-password#access_token=...&type=recovery`
4. A aplicação detecta o token na URL e processa automaticamente
5. Usuário define nova senha
6. Após sucesso, usuário é redirecionado para login

### 5. Teste

1. Acesse a tela de login
2. Clique em "Esqueceu sua senha?"
3. Digite um email válido
4. Verifique o email recebido
5. Clique no link do email
6. Você deve ser redirecionado para a tela de reset de senha
7. Defina uma nova senha
8. Faça login com a nova senha

## Notas Técnicas

- O Supabase processa automaticamente o token quando `detectSessionInUrl: true` está configurado
- A URL de redirecionamento deve estar na lista de URLs permitidas no Supabase
- O token expira após 1 hora por padrão
- O link só pode ser usado uma vez

