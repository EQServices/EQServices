    -- Migration: Permitir múltiplas categorias em pedidos de serviço
    -- Data: 2025-01-27

    -- PASSO 1: Dropar a view que depende da coluna category
    DROP VIEW IF EXISTS public.admin_orders_summary CASCADE;

    -- PASSO 2: Alterar coluna category de TEXT para TEXT[] em service_requests
    -- Primeiro, criar uma nova coluna temporária
    ALTER TABLE public.service_requests 
    ADD COLUMN IF NOT EXISTS categories_temp TEXT[];

    -- PASSO 3: Migrar dados existentes: converter categoria única em array
    UPDATE public.service_requests 
    SET categories_temp = ARRAY[category] 
    WHERE category IS NOT NULL;

    -- PASSO 4: Remover a coluna antiga (agora sem dependências)
    ALTER TABLE public.service_requests 
    DROP COLUMN IF EXISTS category;

    -- PASSO 5: Renomear a nova coluna
    ALTER TABLE public.service_requests 
    RENAME COLUMN categories_temp TO categories;

    -- PASSO 6: Adicionar constraint para garantir que há pelo menos uma categoria
    ALTER TABLE public.service_requests 
    ADD CONSTRAINT service_requests_categories_not_empty 
    CHECK (array_length(categories, 1) > 0);

    -- PASSO 7: Criar índice para busca eficiente
    CREATE INDEX IF NOT EXISTS idx_service_requests_categories ON public.service_requests USING GIN (categories);

    -- PASSO 8: Recriar a view admin_orders_summary com a nova estrutura
    -- Usando categories[1] para obter a primeira categoria (compatibilidade com código existente)
    CREATE OR REPLACE VIEW public.admin_orders_summary AS
    SELECT 
    sr.id,
    sr.title,
    sr.categories[1] AS category, -- Primeira categoria para compatibilidade
    sr.status,
    sr.budget,
    sr.created_at,
    sr.completed_at,
    u.email as cliente_email,
    u.first_name || ' ' || u.last_name as cliente_nome,
    COUNT(DISTINCT p.id) as total_propostas,
    COUNT(DISTINCT ul.id) as total_desbloqueios,
    COUNT(DISTINCT r.id) as total_avaliacoes
    FROM public.service_requests sr
    LEFT JOIN public.users u ON sr.client_id = u.id
    LEFT JOIN public.proposals p ON sr.id = p.service_request_id
    LEFT JOIN public.leads l ON sr.id = l.service_request_id
    LEFT JOIN public.unlocked_leads ul ON l.id = ul.lead_id
    LEFT JOIN public.reviews r ON sr.id = r.service_request_id
    GROUP BY sr.id, sr.title, sr.categories, sr.status, sr.budget, sr.created_at, sr.completed_at, u.email, u.first_name, u.last_name
    ORDER BY sr.created_at DESC;

    ALTER VIEW public.admin_orders_summary OWNER TO postgres;

    COMMENT ON VIEW public.admin_orders_summary IS 'Resumo de todos os pedidos para dashboard admin (atualizado para suportar múltiplas categorias)';

    -- Nota: A tabela leads mantém category como TEXT porque cada lead representa uma categoria específica
    -- Quando um pedido tem múltiplas categorias, múltiplos leads serão criados (um por categoria)

