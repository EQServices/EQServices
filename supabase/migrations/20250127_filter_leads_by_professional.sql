-- Função para filtrar leads por categoria e região do profissional
-- Retorna apenas leads que correspondem às categorias e regiões do profissional

CREATE OR REPLACE FUNCTION public.get_filtered_leads(
  professional_id_param UUID,
  limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  service_request_id UUID,
  category TEXT,
  cost INTEGER,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  professional_categories TEXT[];
  professional_regions TEXT[];
BEGIN
  -- Buscar categorias e regiões do profissional
  SELECT categories, regions
  INTO professional_categories, professional_regions
  FROM public.professionals
  WHERE id = professional_id_param;

  -- Se não encontrou o profissional ou não tem categorias/regiões configuradas, retornar vazio
  IF professional_categories IS NULL OR array_length(professional_categories, 1) IS NULL THEN
    RETURN;
  END IF;

  -- Retornar leads filtrados por categoria e região
  RETURN QUERY
  SELECT 
    l.id,
    l.service_request_id,
    l.category,
    l.cost,
    l.location,
    l.description,
    l.created_at
  FROM public.leads l
  WHERE 
    -- Filtrar por categoria: a categoria do lead deve estar no array de categorias do profissional
    l.category = ANY(professional_categories)
    -- Filtrar por região: a localização do lead deve conter alguma das regiões do profissional
    AND (
      professional_regions IS NULL 
      OR array_length(professional_regions, 1) IS NULL
      OR EXISTS (
        SELECT 1 
        FROM unnest(professional_regions) AS region
        WHERE l.location ILIKE '%' || region || '%'
      )
    )
    -- Excluir leads já desbloqueados por este profissional
    AND NOT EXISTS (
      SELECT 1 
      FROM public.unlocked_leads ul
      WHERE ul.lead_id = l.id 
      AND ul.professional_id = professional_id_param
    )
  ORDER BY l.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Comentário na função
COMMENT ON FUNCTION public.get_filtered_leads IS 'Retorna leads filtrados por categoria e região do profissional, excluindo leads já desbloqueados';

