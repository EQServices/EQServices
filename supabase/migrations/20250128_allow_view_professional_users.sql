-- Permitir que usuários autenticados vejam dados básicos de profissionais na tabela users
-- Isso é necessário para exibir o perfil do profissional quando um cliente clica em "Ver perfil completo"

-- Primeiro, remover a política se já existir (para evitar erro ao executar novamente)
DROP POLICY IF EXISTS "Anyone can view professional user info" ON public.users;

-- Política para permitir visualizar dados de profissionais
-- Esta política permite que qualquer usuário autenticado veja informações de usuários que são profissionais
CREATE POLICY "Anyone can view professional user info" ON public.users
  FOR SELECT 
  USING (
    -- Permitir se o usuário for do tipo 'professional'
    -- Isso permite que clientes vejam dados básicos de profissionais
    EXISTS (
      SELECT 1 FROM public.professionals
      WHERE professionals.id = users.id
    )
  );

-- Comentário explicativo
COMMENT ON POLICY "Anyone can view professional user info" ON public.users IS 
  'Permite que qualquer usuário autenticado veja informações básicas (nome, avatar) de profissionais, necessário para exibir perfis de profissionais na aplicação. A política "Users can view own profile" já cobre o caso de ver o próprio perfil.';

