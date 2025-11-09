-- Location hierarchy tables sourced from json.geoapi.pt

CREATE TABLE IF NOT EXISTS public.pt_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT
);

CREATE TABLE IF NOT EXISTS public.pt_municipalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES public.pt_districts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  UNIQUE (district_id, name)
);

CREATE TABLE IF NOT EXISTS public.pt_parishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id UUID NOT NULL REFERENCES public.pt_municipalities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  UNIQUE (municipality_id, name)
);

CREATE INDEX IF NOT EXISTS idx_pt_municipalities_district_id ON public.pt_municipalities(district_id);
CREATE INDEX IF NOT EXISTS idx_pt_parishes_municipality_id ON public.pt_parishes(municipality_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pt_districts_code ON public.pt_districts(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pt_municipalities_code ON public.pt_municipalities(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pt_parishes_code ON public.pt_parishes(code);

ALTER TABLE public.pt_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pt_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pt_parishes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can read pt_districts" ON public.pt_districts;
CREATE POLICY "anyone can read pt_districts" ON public.pt_districts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role manages pt_districts" ON public.pt_districts;
CREATE POLICY "service role manages pt_districts" ON public.pt_districts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "anyone can read pt_municipalities" ON public.pt_municipalities;
CREATE POLICY "anyone can read pt_municipalities" ON public.pt_municipalities
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role manages pt_municipalities" ON public.pt_municipalities;
CREATE POLICY "service role manages pt_municipalities" ON public.pt_municipalities
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "anyone can read pt_parishes" ON public.pt_parishes;
CREATE POLICY "anyone can read pt_parishes" ON public.pt_parishes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role manages pt_parishes" ON public.pt_parishes;
CREATE POLICY "service role manages pt_parishes" ON public.pt_parishes
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

