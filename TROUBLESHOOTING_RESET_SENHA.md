# Troubleshooting - Reset de Senha

## Problemas Comuns e Soluções

### 1. Link não funciona / Redireciona para login

**Sintomas**: Ao clicar no link do email, o usuário é redirecionado para a tela de login em vez da tela de reset.

**Possíveis causas**:
- URL de redirecionamento não está configurada no Supabase
- Token expirado (válido por 1 hora)
- Link já foi usado (só pode ser usado uma vez)

**Solução**:
1. Verifique no Supabase: **Authentication** → **URL Configuration**
2. Certifique-se de que `https://www.eqservices.pt/reset-password` está na lista de **Redirect URLs**
3. Solicite um novo link de reset (links expiram após 1 hora)

### 2. Erro "Link de reset inválido ou expirado"

**Sintomas**: A tela de reset aparece mas mostra mensagem de erro.

**Possíveis causas**:
- Token expirado
- Token já foi usado
- Hash da URL não está sendo processado corretamente

**Solução**:
1. Solicite um novo link de reset
2. Certifique-se de clicar no link completo (não copiar/colar parcialmente)
3. Verifique se o link contém `#access_token=...&type=recovery` no final

### 3. Tela de reset não aparece

**Sintomas**: Ao clicar no link, nada acontece ou aparece tela de login.

**Possíveis causas**:
- Deep linking não está funcionando
- Navegação não está detectando a URL

**Solução**:
1. Verifique se a URL completa é: `https://www.eqservices.pt/reset-password#access_token=...&type=recovery`
2. Abra o console do navegador (F12) e verifique se há erros
3. Tente acessar diretamente: `https://www.eqservices.pt/reset-password` (sem token) - deve mostrar erro mas confirmar que a rota existe

### 4. Token não é processado

**Sintomas**: Tela de reset aparece mas fica em "Processando link de reset..." indefinidamente.

**Possíveis causas**:
- `detectSessionInUrl` não está habilitado
- Hash da URL não está sendo lido corretamente

**Solução**:
1. Verifique em `src/config/supabase.ts` se `detectSessionInUrl: true` está configurado
2. Abra o console do navegador e verifique se há logs de "Token de recovery detectado"
3. Verifique se o hash da URL está presente: `window.location.hash`

## Como Testar

1. **Solicitar reset**:
   - Acesse a tela de login
   - Clique em "Esqueceu sua senha?"
   - Digite um email válido
   - Clique em "Enviar"

2. **Verificar email**:
   - Abra o email recebido
   - Verifique se o link começa com `https://www.eqservices.pt/reset-password`
   - O link deve conter `#access_token=...&type=recovery` no final

3. **Clicar no link**:
   - Clique no link completo (não copie/cole)
   - Você deve ser redirecionado para a tela de reset de senha
   - Se aparecer erro, verifique os logs do console (F12)

4. **Definir nova senha**:
   - Digite a nova senha (mínimo 6 caracteres)
   - Confirme a senha
   - Clique em "Alterar senha"
   - Você deve ser redirecionado para login

## Verificação de Configuração

### No Supabase Dashboard:

1. **Authentication** → **URL Configuration**
   - **Site URL**: `https://www.eqservices.pt` (sem barra no final)
   - **Redirect URLs** deve conter:
     - `https://www.eqservices.pt/reset-password`
     - `https://www.eqservices.pt` (opcional, mas recomendado)

2. **Authentication** → **Email Templates**
   - Verifique se o template de "Reset Password" está configurado
   - O link deve usar `{{ .ConfirmationURL }}`

### No Código:

1. **src/config/supabase.ts**:
   ```typescript
   detectSessionInUrl: true  // Deve estar true
   ```

2. **src/services/emailVerification.ts**:
   ```typescript
   redirectTo: `${baseUrl}/reset-password`  // Deve usar www.eqservices.pt
   ```

3. **src/navigation/AppNavigator.tsx**:
   - Rota `ResetPassword: 'reset-password'` deve estar no linking config
   - Prefixo `https://www.eqservices.pt` deve estar na lista de prefixes

## Logs Úteis

Abra o console do navegador (F12) e procure por:

- `Token de recovery detectado na URL` - Token foi encontrado
- `Auth state changed: PASSWORD_RECOVERY` - Token foi processado
- `Token de reset processado com sucesso` - Tudo funcionou
- Erros em vermelho - Indica problema específico

## Se Nada Funcionar

1. Limpe o cache do navegador
2. Tente em modo anônimo/privado
3. Verifique se as URLs no Supabase estão exatamente como mostrado acima
4. Solicite um novo link de reset
5. Verifique os logs do console para erros específicos

