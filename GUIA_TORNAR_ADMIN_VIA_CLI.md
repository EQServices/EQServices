# 🚀 Guia: Tornar Usuário Admin via CLI

Este guia mostra como tornar um usuário administrador usando a Service Role Key do Supabase via PowerShell.

## 📋 Pré-requisitos

1. **Service Role Key do Supabase**
   - Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/settings/api
   - Na seção **"Project API keys"**, copie a chave **`service_role`** (secret)
   - ⚠️ **IMPORTANTE**: Esta chave é muito sensível - não compartilhe!

## 🎯 Método 1: Via Script (Recomendado)

### Opção A: Usando função RPC `make_user_admin`

```powershell
.\scripts\tornar-admin-via-api.ps1 -ServiceRoleKey "sua-service-role-key-aqui"
```

### Opção B: Atualização direta (mais simples)

```powershell
.\scripts\tornar-admin-direto.ps1 -ServiceRoleKey "sua-service-role-key-aqui"
```

### Parâmetros opcionais:

```powershell
# Especificar email diferente
.\scripts\tornar-admin-direto.ps1 -ServiceRoleKey "sua-key" -UserEmail "outro@email.com"

# Especificar project ref diferente
.\scripts\tornar-admin-direto.ps1 -ServiceRoleKey "sua-key" -ProjectRef "outro-ref"
```

## 🔧 Método 2: Via SQL Editor (Alternativa)

Se os scripts não funcionarem, execute diretamente no SQL Editor do Supabase:

1. Acesse: https://supabase.com/dashboard/project/qeswqwhccqfbdtmywzkz/sql/new
2. Execute uma das queries abaixo:

### Usando função:
```sql
SELECT make_user_admin('elastiquality@elastiquality.pt');
```

### Ou atualização direta:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'elastiquality@elastiquality.pt';
```

### Verificar se funcionou:
```sql
SELECT id, email, is_admin 
FROM users 
WHERE email = 'elastiquality@elastiquality.pt';
```

## ✅ Verificação

Após tornar o usuário admin, verifique:

1. **No app**: Faça login com o email `elastiquality@elastiquality.pt`
2. **No código**: O campo `isAdmin` deve estar `true` no `AuthContext`
3. **No banco**: Execute a query de verificação acima

## 🔒 Segurança

- ⚠️ **NUNCA** commite a Service Role Key no Git
- ⚠️ **NUNCA** compartilhe a Service Role Key publicamente
- ✅ Use apenas para operações administrativas necessárias
- ✅ Considere rotacionar a chave periodicamente

## 🐛 Troubleshooting

### Erro: "Usuário não encontrado"
- Verifique se o email está correto
- Verifique se o usuário existe na tabela `users`

### Erro: "Service Role Key inválida"
- Verifique se copiou a chave completa (começa com `eyJ...`)
- Verifique se não há espaços extras
- Obtenha uma nova chave no dashboard se necessário

### Erro: "Função make_user_admin não existe"
- Execute primeiro a migration `004_admin_system.sql`
- Ou use o script `tornar-admin-direto.ps1` que não depende da função

## 📚 Scripts Disponíveis

- `scripts/tornar-admin-via-api.ps1` - Usa função RPC `make_user_admin`
- `scripts/tornar-admin-direto.ps1` - Atualiza diretamente a tabela `users`

## 💡 Dica

Para tornar múltiplos usuários admin, você pode modificar o script ou executar múltiplas vezes com emails diferentes.

