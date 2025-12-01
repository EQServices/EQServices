# 🔒 Guia: Segurança do Git

## ⚠️ Problema Identificado

O token de acesso pessoal (PAT) do GitHub estava exposto no remote URL, o que representa um risco de segurança.

## ✅ Solução Aplicada

### 1. Configuração do Git Credential Manager

O Git Credential Manager foi configurado para armazenar credenciais de forma segura:

```bash
git config --global credential.helper manager-core
```

### 2. Remoção do Token do Remote URL

O remote foi atualizado para não incluir o token:

**Antes** (inseguro):
```
https://SuporteElastiquality:TOKEN@github.com/SuporteElastiquality/APP.git
```

**Depois** (seguro):
```
https://github.com/SuporteElastiquality/APP.git
```

---

## 🔐 Como Funciona Agora

### Primeira Vez
Quando você fizer `git push` ou `git pull` pela primeira vez:
1. O Git pedirá suas credenciais
2. Use seu **username** do GitHub: `SuporteElastiquality`
3. Use um **Personal Access Token (PAT)** como senha
4. O Git Credential Manager salvará as credenciais de forma segura no Windows Credential Manager

### Próximas Vezes
- As credenciais serão usadas automaticamente
- Não será necessário inserir novamente
- As credenciais ficam armazenadas de forma criptografada

---

## 📝 Como Criar/Usar Personal Access Token

### 1. Criar Token no GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome descritivo (ex: "Elastiquality Development")
4. Selecione as permissões necessárias:
   - ✅ `repo` (acesso completo aos repositórios)
   - ✅ `workflow` (para GitHub Actions)
5. Clique em **"Generate token"**
6. **COPIE O TOKEN** (só aparece uma vez!)

### 2. Usar o Token

Quando o Git pedir credenciais:
- **Username**: `SuporteElastiquality`
- **Password**: Cole o token que você copiou

---

## 🔄 Alternativa: SSH (Mais Seguro)

Se preferir usar SSH em vez de HTTPS:

### 1. Gerar Chave SSH

```powershell
ssh-keygen -t ed25519 -C "elastiqualyt@example.com"
```

### 2. Adicionar Chave ao GitHub

1. Copie a chave pública:
```powershell
cat ~/.ssh/id_ed25519.pub
```

2. Acesse: https://github.com/settings/keys
3. Clique em **"New SSH key"**
4. Cole a chave pública
5. Salve

### 3. Alterar Remote para SSH

```powershell
git remote set-url origin git@github.com:SuporteElastiquality/APP.git
```

---

## ✅ Verificação

Para verificar se está tudo configurado corretamente:

```powershell
# Ver remote URL (não deve ter token)
git remote -v

# Verificar credential helper
git config --global credential.helper

# Testar push (pedirá credenciais na primeira vez)
git push
```

---

## 🛡️ Boas Práticas

1. ✅ **Nunca** commite tokens ou senhas no código
2. ✅ Use `.gitignore` para arquivos sensíveis
3. ✅ Use variáveis de ambiente para secrets
4. ✅ Revise tokens periodicamente no GitHub
5. ✅ Use tokens com permissões mínimas necessárias
6. ✅ Revogue tokens antigos não utilizados

---

## 🔍 Verificar Tokens Ativos

1. Acesse: https://github.com/settings/tokens
2. Revise todos os tokens ativos
3. Revogue tokens não utilizados ou suspeitos

---

## 📚 Recursos

- [Git Credential Manager](https://github.com/git-ecosystem/git-credential-manager)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

**Última atualização**: 15/01/2025

