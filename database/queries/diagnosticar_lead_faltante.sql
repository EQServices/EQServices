-- Script para diagnosticar por que um lead não aparece para um profissional
-- Substitua os valores abaixo pelos dados reais

-- 1. Verificar se o lead foi criado para o pedido
SELECT 
  l.id as lead_id,
  l.category as lead_category,
  l.location as lead_location,
  l.cost,
  l.created_at,
  sr.id as service_request_id,
  sr.title,
  sr.status,
  sr.created_at as request_created_at
FROM public.leads l
JOIN public.service_requests sr ON sr.id = l.service_request_id
WHERE sr.title ILIKE '%Reparação Fecho%' 
   OR sr.description ILIKE '%fechos%'
   OR l.category = 'Reparação de Fechos'
ORDER BY sr.created_at DESC
LIMIT 5;

-- 2. Verificar as categorias e regiões do profissional kmterra@gmail.com
SELECT 
  u.email,
  u.name,
  p.categories as professional_categories,
  p.regions as professional_regions,
  p.credits,
  u.location_label as user_location
FROM public.users u
LEFT JOIN public.professionals p ON p.id = u.id
WHERE u.email = 'kmterra@gmail.com';

-- 3. Verificar todos os leads disponíveis para o profissional (sem filtro)
SELECT 
  l.id,
  l.category,
  l.location,
  l.cost,
  l.created_at,
  CASE 
    WHEN l.category = ANY((SELECT categories FROM public.professionals WHERE id = (SELECT id FROM public.users WHERE email = 'kmterra@gmail.com'))) 
    THEN 'SIM - Categoria corresponde'
    ELSE 'NÃO - Categoria não corresponde'
  END as categoria_match,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM public.professionals p
      CROSS JOIN unnest(p.regions) as region
      WHERE p.id = (SELECT id FROM public.users WHERE email = 'kmterra@gmail.com')
      AND l.location ILIKE '%' || region || '%'
    ) OR (SELECT array_length(regions, 1) FROM public.professionals WHERE id = (SELECT id FROM public.users WHERE email = 'kmterra@gmail.com')) IS NULL
    THEN 'SIM - Região corresponde ou não configurada'
    ELSE 'NÃO - Região não corresponde'
  END as regiao_match,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.unlocked_leads ul
      WHERE ul.lead_id = l.id
      AND ul.professional_id = (SELECT id FROM public.users WHERE email = 'kmterra@gmail.com')
    )
    THEN 'SIM - Já desbloqueado'
    ELSE 'NÃO - Não desbloqueado'
  END as ja_desbloqueado
FROM public.leads l
ORDER BY l.created_at DESC
LIMIT 20;

-- 4. Verificar leads específicos da categoria "Reparação de Fechos"
SELECT 
  l.id,
  l.category,
  l.location,
  l.description,
  l.cost,
  l.created_at,
  sr.title as service_title
FROM public.leads l
JOIN public.service_requests sr ON sr.id = l.service_request_id
WHERE l.category = 'Reparação de Fechos'
ORDER BY l.created_at DESC;

