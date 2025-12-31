# Executar Migration: Permitir Visualizar Dados de Profissionais

## Problema
Quando um cliente clica em "Ver perfil completo" de um profissional, o perfil não aparece porque a política RLS (Row Level Security) na tabela `users` só permite que usuários vejam seu próprio perfil.

## Solução
Esta migration adiciona uma política RLS que permite que qualquer usuário autenticado veja informações básicas (nome, avatar) de profissionais na tabela `users`.

## Como Executar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Clique em **New query**
5. Cole o conteúdo do arquivo `supabase/migrations/20250128_allow_view_professional_users.sql`
6. Clique em **Run** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### Opção 2: Via Supabase CLI

```bash
# Certifique-se de estar no diretório do projeto
cd d:\elastiquality

# Execute a migration
supabase db push
```

## Verificação

Após executar a migration, você pode verificar se a política foi criada:

```sql
-- Verificar políticas RLS na tabela users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;
```

Você deve ver duas políticas:
1. `Users can view own profile` - permite ver o próprio perfil
2. `Anyone can view professional user info` - permite ver perfis de profissionais

## Teste

Após executar a migration:

1. Faça login como cliente
2. Acesse um pedido que tenha uma proposta
3. Clique em "Ver perfil completo" do profissional
4. O perfil do profissional deve aparecer corretamente com:
   - Nome do profissional
   - Créditos disponíveis
   - Categorias
   - Regiões de atendimento
   - Avaliações

## Notas Importantes

- Esta política permite que qualquer usuário autenticado veja dados básicos de profissionais
- A política original "Users can view own profile" continua funcionando para ver o próprio perfil
- Se houver erro ao criar a política (por exemplo, se já existir), você pode usar `DROP POLICY IF EXISTS` antes de criar:

```sql
DROP POLICY IF EXISTS "Anyone can view professional user info" ON public.users;
```

Depois execute novamente o `CREATE POLICY`.

