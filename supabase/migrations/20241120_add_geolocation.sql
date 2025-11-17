-- Adicionar campos de geolocalização (latitude e longitude)
-- Para permitir busca de profissionais próximos e pedidos por localização

-- Adicionar campos na tabela users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Adicionar campos na tabela service_requests
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Adicionar índices para melhorar performance de buscas por localização
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_requests_location ON public.service_requests(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Criar função para calcular distância entre duas coordenadas (fórmula de Haversine)
-- Retorna distância em quilômetros
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  R DECIMAL := 6371; -- Raio da Terra em quilômetros
  d_lat DECIMAL;
  d_lon DECIMAL;
  a DECIMAL;
  c DECIMAL;
BEGIN
  -- Converter para radianos
  d_lat := radians(lat2 - lat1);
  d_lon := radians(lon2 - lon1);
  
  -- Fórmula de Haversine
  a := sin(d_lat / 2) * sin(d_lat / 2) +
       cos(radians(lat1)) * cos(radians(lat2)) *
       sin(d_lon / 2) * sin(d_lon / 2);
  
  c := 2 * atan2(sqrt(a), sqrt(1 - a));
  
  RETURN ROUND(R * c, 2); -- Retorna distância em km com 2 casas decimais
END;
$$;

-- Criar função para buscar profissionais próximos
-- Parâmetros: latitude, longitude do ponto de referência, raio em km
CREATE OR REPLACE FUNCTION find_nearby_professionals(
  ref_latitude DECIMAL,
  ref_longitude DECIMAL,
  radius_km DECIMAL DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  categories TEXT[],
  rating DECIMAL,
  review_count INTEGER,
  distance_km DECIMAL
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.email,
    p.categories,
    p.rating,
    p.review_count,
    calculate_distance_km(ref_latitude, ref_longitude, u.latitude, u.longitude) AS distance_km
  FROM public.users u
  INNER JOIN public.professionals p ON p.id = u.id
  WHERE
    u.user_type = 'professional'
    AND u.latitude IS NOT NULL
    AND u.longitude IS NOT NULL
    AND calculate_distance_km(ref_latitude, ref_longitude, u.latitude, u.longitude) <= radius_km
  ORDER BY distance_km ASC;
END;
$$;

-- Criar função para buscar pedidos próximos
CREATE OR REPLACE FUNCTION find_nearby_service_requests(
  ref_latitude DECIMAL,
  ref_longitude DECIMAL,
  radius_km DECIMAL DEFAULT 50,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  description TEXT,
  location TEXT,
  budget DECIMAL,
  status TEXT,
  distance_km DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.title,
    sr.category,
    sr.description,
    sr.location,
    sr.budget,
    sr.status,
    calculate_distance_km(ref_latitude, ref_longitude, sr.latitude, sr.longitude) AS distance_km,
    sr.created_at
  FROM public.service_requests sr
  WHERE
    sr.status IN ('pending', 'active')
    AND sr.latitude IS NOT NULL
    AND sr.longitude IS NOT NULL
    AND calculate_distance_km(ref_latitude, ref_longitude, sr.latitude, sr.longitude) <= radius_km
    AND (category_filter IS NULL OR sr.category = category_filter)
  ORDER BY distance_km ASC, sr.created_at DESC;
END;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION calculate_distance_km IS 'Calcula distância entre duas coordenadas usando fórmula de Haversine. Retorna distância em quilômetros.';
COMMENT ON FUNCTION find_nearby_professionals IS 'Busca profissionais dentro de um raio especificado. Retorna profissionais ordenados por proximidade.';
COMMENT ON FUNCTION find_nearby_service_requests IS 'Busca pedidos de serviço dentro de um raio especificado. Opcionalmente filtra por categoria.';

