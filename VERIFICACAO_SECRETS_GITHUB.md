# ✅ Verificação de Secrets do GitHub

## 📋 Status da Verificação

**Data**: 15 de Janeiro de 2025

---

## 🔍 Como Verificar Manualmente

### 1. Via GitHub Web Interface

1. Acesse: https://github.com/SuporteElastiquality/APP/settings/secrets/actions
2. Verifique se os seguintes secrets existem:
   - ✅ `SUPABASE_ACCESS_TOKEN`
   - ✅ `SUPABASE_PROJECT_REF`

### 2. Testar o Workflow

1. Acesse: https://github.com/SuporteElastiquality/APP/actions
2. Procure pelo workflow **"Database Backup"**
3. Clique em **"Run workflow"** → **"Run workflow"**
4. Aguarde a execução
5. Verifique se:
   - ✅ O workflow inicia sem erros
   - ✅ Consegue fazer login no Supabase
   - ✅ Consegue fazer o dump do banco
   - ✅ Upload do artifact funciona

---

## 📊 Checklist de Verificação

- [ ] Secrets configurados no GitHub
- [ ] Workflow pode ser executado manualmente
- [ ] Workflow executa com sucesso
- [ ] Backup é gerado corretamente
- [ ] Artifact é criado e pode ser baixado

---

## 🔧 Secrets Necessários

### `SUPABASE_ACCESS_TOKEN`
- **Onde obter**: https://supabase.com/dashboard/account/tokens
- **Como gerar**: 
  1. Acesse o link acima
  2. Clique em "Generate new token"
  3. Dê um nome descritivo
  4. Copie o token (só aparece uma vez!)

### `SUPABASE_PROJECT_REF`
- **Valor**: `qeswqwhccqfbdtmywzkz`
- **Onde encontrar**: No URL do projeto Supabase ou no dashboard

---

## 🧪 Teste Rápido

Execute o script de verificação:

```powershell
.\scripts\verificar-secrets-github.ps1
.\scripts\testar-workflow-backup.ps1
```

---

## ✅ Se Tudo Estiver Configurado

O workflow deve:
1. Executar automaticamente **diariamente às 2h UTC**
2. Criar um backup do banco de dados
3. Salvar como artifact no GitHub (retido por 30 dias)
4. Estar disponível para download em: Actions → Artifacts

---

**Última verificação**: Aguardando confirmação do usuário

