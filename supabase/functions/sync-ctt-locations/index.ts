import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const syncApiKey = Deno.env.get('LOCATION_SYNC_API_KEY');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials for sync-ctt-locations function.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CttLocation = {
  code: string;
  name: string;
};

const GEOAPI_BASE_URL = 'https://json.geoapi.pt';

const normaliseName = (value: unknown) => {
  if (!value) return '';
  return String(value).trim();
};

const normaliseCode = (value: unknown) => {
  if (!value && value !== 0) return '';
  return String(value).trim();
};

const extractName = (item: any) =>
  normaliseName(
    item?.freguesia ??
      item?.Freguesia ??
      item?.nome ??
      item?.Nome ??
      item?.Des_Simpli ??
      item?.municipio ??
      item?.Municipio ??
      item?.concelho ??
      item?.Concelho ??
      item?.distrito ??
      item?.Distrito ??
      item?.label,
  );

const extractCode = (item: any) =>
  normaliseCode(item?.codigoine ?? item?.CodigoINE ?? item?.Dicofre ?? item?.DICOFRE ?? item?.dtmn ?? item?.dtmnfr ?? item?.id ?? item?.code);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async <T>(url: string, attempt = 1): Promise<T> => {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Elastiquality/1.0 (https://elastiquality.pt)',
      Accept: 'application/json',
    },
  });

  if (res.status === 429 || res.status === 503) {
    if (attempt <= 5) {
      const retryAfterHeader = res.headers.get('retry-after');
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 500 * attempt;
      await sleep(retryAfterMs || 500);
      return fetchJson<T>(url, attempt + 1);
    }
  }

  if (!res.ok) {
    throw new Error(`Pedido para ${url} falhou com status ${res.status}`);
  }

  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Resposta inválida da GeoAPI para ${url} (content-type: ${contentType ?? 'desconhecido'})`);
  }

  return (await res.json()) as T;
};

const fetchDistricts = async () => {
  const data = await fetchJson<any[]>(`${GEOAPI_BASE_URL}/distritos`);
  return (data || [])
    .map((item) => {
      const name = extractName(item);
      const code = extractCode(item);
      if (!name) return null;
      return { name, code } as CttLocation;
    })
    .filter(Boolean) as CttLocation[];
};

const fetchMunicipalities = async (districtName: string) => {
  const detail = await fetchJson<any>(`${GEOAPI_BASE_URL}/distrito/${encodeURIComponent(districtName)}`);
  const municipalities = Array.isArray(detail?.municipios) ? detail.municipios : [];
  return municipalities
    .map((item: any) => {
      const name = extractName(item);
      const code = extractCode(item);
      if (!name) return null;
      return { name, code } as CttLocation;
    })
    .filter(Boolean) as CttLocation[];
};

const fetchParishes = async (municipalityName: string) => {
  const detail = await fetchJson<any>(`${GEOAPI_BASE_URL}/municipio/${encodeURIComponent(municipalityName)}`);
  const features = Array.isArray(detail?.geojsons?.freguesias) ? detail.geojsons.freguesias : [];
  return features
    .map((feature: any) => {
      const properties = feature?.properties ?? feature;
      const name = extractName(properties);
      const code = extractCode(properties);
      if (!name) return null;
      return { name, code } as CttLocation;
    })
    .filter(Boolean) as CttLocation[];
};

const syncDistrict = async (district: CttLocation) => {
  const conflictTarget = district.code ? 'code' : 'name';

  const { data, error } = await supabaseAdmin
    .from('pt_districts')
    .upsert(
      {
        name: district.name,
        code: district.code || null,
      },
      {
        onConflict: conflictTarget,
      },
    )
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.id) {
    return data.id;
  }

  const { data: fallback, error: fallbackError } = await supabaseAdmin
    .from('pt_districts')
    .select('id')
    .eq('name', district.name)
    .maybeSingle();

  if (fallbackError) {
    throw fallbackError;
  }

  return fallback?.id ?? null;
};

const syncMunicipalities = async (districtId: string, municipalities: CttLocation[]) => {
  if (municipalities.length === 0) return [];

  const unique = new Map<string, CttLocation>();
  municipalities.forEach((item) => {
    const key = item.name.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  const deduped = Array.from(unique.values());

  const payload = deduped.map((item) => ({
    district_id: districtId,
    name: item.name,
    code: item.code || null,
  }));

  const conflictTarget = deduped.some((item) => item.code) ? 'code' : 'district_id,name';

  const { data, error } = await supabaseAdmin
    .from('pt_municipalities')
    .upsert(payload, {
      onConflict: conflictTarget,
    })
    .select('id, name, code');

  if (error) {
    throw error;
  }

  const map = new Map<string, { id: string; code: string | null }>();
  data?.forEach((row) => {
    if (row?.name && row?.id) {
      map.set(row.name, { id: row.id, code: row.code ?? null });
    }
  });

  return { map, items: deduped };
};

const syncParishes = async (municipalityId: string, parishes: CttLocation[]) => {
  if (parishes.length === 0) return 0;

  const unique = new Map<string, CttLocation>();
  parishes.forEach((item) => {
    const key = item.name.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  const deduped = Array.from(unique.values());

  const payload = deduped.map((item) => ({
    municipality_id: municipalityId,
    name: item.name,
    code: item.code || null,
  }));

  const conflictTarget = deduped.some((item) => item.code) ? 'code' : 'municipality_id,name';

  const { error } = await supabaseAdmin
    .from('pt_parishes')
    .upsert(payload, {
      onConflict: conflictTarget,
    });

  if (error) {
    throw error;
  }

  return deduped.length;
};

interface SyncPayload {
  districtCode?: string | null;
  force?: boolean;
}

const syncLocations = async (payload: SyncPayload = {}) => {
  const summary = {
    districts: 0,
    municipalities: 0,
    parishes: 0,
  };

  const districts = await fetchDistricts();
  if (districts.length === 0) {
    throw new Error('A resposta da GeoAPI não contém distritos.');
  }

  const target = payload.districtCode?.trim().toLowerCase();
  const filteredDistricts = target
    ? districts.filter((district) => {
        const code = (district.code || '').toLowerCase();
        const name = district.name.toLowerCase();
        return code === target || name === target;
      })
    : districts;

  if (filteredDistricts.length === 0) {
    throw new Error('Distrito solicitado não encontrado na listagem da GeoAPI.');
  }

  for (const district of filteredDistricts) {
    const districtId = await syncDistrict(district);
    if (!districtId) {
      throw new Error(`Não foi possível obter o identificador interno para o distrito ${district.name}.`);
    }

    summary.districts += 1;

    await sleep(200);
    const municipalities = await fetchMunicipalities(district.name);
    const { map: municipalityMap, items: dedupedMunicipalities } = await syncMunicipalities(districtId, municipalities);
    summary.municipalities += dedupedMunicipalities.length;

    for (const municipality of dedupedMunicipalities) {
      const municipalityEntry = municipalityMap.get(municipality.name);
      if (!municipalityEntry?.id) {
        console.warn(`Municipio ${municipality.name} do distrito ${district.name} não encontrado após upsert.`);
        continue;
      }

      await sleep(200);
      const parishes = await fetchParishes(municipality.name);
      const parishesCount = await syncParishes(municipalityEntry.id, parishes);
      summary.parishes += parishesCount;
    }
  }

  return summary;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const jwt = authHeader ? authHeader.replace('Bearer ', '') : null;
    let isServiceRole = false;
    let isApiKey = false;
    let userId: string | null = null;

    const headerApiKey = req.headers.get('x-location-sync-key');

    if (syncApiKey && headerApiKey === syncApiKey) {
      isApiKey = true;
    } else if (jwt && jwt === supabaseServiceRoleKey) {
      isServiceRole = true;
    } else if (jwt) {
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(jwt);

      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = user.id;
    } else {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json().catch(() => ({}))) as SyncPayload;

    const summary = await syncLocations(body);

    const actor = isServiceRole ? 'service_role' : userId ?? 'unknown';

    return new Response(JSON.stringify({ success: true, summary, actor }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('sync-ctt-locations error:', err);
    const errorMessage =
      err instanceof Error
        ? `${err.name ?? 'Error'}: ${err.message}`
        : typeof err === 'string'
          ? err
          : JSON.stringify(err);
    const stack = err instanceof Error && err.stack ? err.stack : undefined;
    return new Response(JSON.stringify({ error: errorMessage, stack }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

