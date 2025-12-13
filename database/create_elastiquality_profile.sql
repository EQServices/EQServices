-- Script para criar perfil profissional Elastiquality
-- Este perfil terá acesso a TODAS as oportunidades em Portugal
-- Email: elastiquality@elastiquality.pt
-- Senha: Empresa2025!

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- NOTA: A senha será definida através do Supabase Auth Dashboard ou API

-- Passo 1: Criar usuário no auth.users (via Supabase Dashboard ou API)
-- Vá em Authentication > Users > Add User
-- Email: elastiquality@elastiquality.pt
-- Password: Empresa2025!
-- Copie o UUID gerado e substitua abaixo em 'USER_ID_AQUI'

-- Passo 2: Inserir dados na tabela users
INSERT INTO public.users (
  id,
  email,
  name,
  first_name,
  last_name,
  phone,
  user_type,
  location_label,
  created_at,
  updated_at
) VALUES (
  'USER_ID_AQUI'::uuid, -- SUBSTITUA pelo UUID do usuário criado no auth.users
  'elastiquality@elastiquality.pt',
  'Elastiquality',
  'Elastiquality',
  'Portugal',
  '+351000000000',
  'professional',
  'Portugal',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  user_type = EXCLUDED.user_type,
  updated_at = NOW();

-- Passo 3: Inserir dados na tabela professionals com TODAS as categorias
INSERT INTO public.professionals (
  id,
  categories,
  regions,
  credits,
  rating,
  review_count,
  description,
  created_at,
  updated_at
) VALUES (
  'USER_ID_AQUI'::uuid, -- SUBSTITUA pelo mesmo UUID
  ARRAY[
    -- Serviços de Construção e Remodelação
    'Eletricista', 'Canalizador', 'Pintor', 'Gesseiro', 'Azulejista', 'Carpinteiro',
    -- Serviços Domésticos
    'Engomadeira', 'Cozinheira', 'Ama (Babysitter)', 'Cuidador de idosos', 'Lavanderia',
    -- Serviços de Limpeza
    'Limpeza Residencial', 'Limpeza Pós-obra', 'Limpeza Comercial', 'Limpeza de Vidros',
    -- Serviços de Tecnologia e Informática
    'Suporte Técnico', 'Formatação', 'Instalação de Redes', 'Desenvolvimento de Sites',
    -- Serviço Automóvel
    'Mecânica', 'Eletricista Auto', 'Chapa e Pintura', 'Mudança de Óleo',
    -- Beleza e Estética
    'Cabeleireiro', 'Maquiador(a)', 'Manicure e Pedicure', 'Massagens',
    -- Serviços de Saúde e Bem-Estar
    'Fisioterapia', 'Nutricionista', 'Personal Trainer', 'Psicólogo',
    -- Serviços de Transporte e Logística
    'Transporte e Mudanças', 'Serviço de Entregas', 'Transporte Executivo', 'Aluguer de Viaturas',
    -- Educação
    'Aulas Particulares', 'Reforço Escolar', 'Tradução',
    -- Eventos e Festas
    'Buffet', 'Empregado de Mesa', 'DJ', 'Fotógrafo', 'Decoração',
    -- Serviços Administrativos e Financeiros
    'Consultoria Contábil', 'Declaração de IRS', 'Consultoria Jurídica', 'Planejamento Financeiro',
    -- Serviços Criativos e Design
    'Design Gráfico', 'Criação de Conteúdo', 'Edição de Vídeo', 'Fotografia Profissional',
    -- Serviços de Costura/Alfaiataria/Modista
    'Fazer Bainhas', 'Apertar/Alargar Peças', 'Encurtar/Alongar Mangas', 'Reparação de Fechos'
  ],
  ARRAY[
    -- Todos os distritos de Portugal
    'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra',
    'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre',
    'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu',
    -- Regiões Autónomas
    'Açores', 'Madeira'
  ],
  10000, -- Créditos iniciais (10.000 para garantir acesso a todas as oportunidades)
  5.0,   -- Rating máximo
  0,     -- Sem avaliações ainda
  'Perfil oficial Elastiquality - Acesso a todas as oportunidades em Portugal para monitoramento e suporte.',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  categories = EXCLUDED.categories,
  regions = EXCLUDED.regions,
  credits = EXCLUDED.credits,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Verificar se foi criado com sucesso
SELECT 
  u.id,
  u.email,
  u.name,
  u.user_type,
  p.credits,
  array_length(p.categories, 1) as total_categorias,
  array_length(p.regions, 1) as total_regioes
FROM public.users u
LEFT JOIN public.professionals p ON u.id = p.id
WHERE u.email = 'elastiquality@elastiquality.pt';

