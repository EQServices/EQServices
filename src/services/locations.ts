import { supabase } from '../config/supabase';

export interface LocationOption {
  id: string;
  name: string;
}

export interface LocationSelection {
  districtId?: string;
  districtName?: string;
  municipalityId?: string;
  municipalityName?: string;
  parishId?: string;
  parishName?: string;
}

export interface ParishSearchResult {
  parishId: string;
  parishName: string;
  municipalityId: string;
  municipalityName: string;
  districtId: string;
  districtName: string;
}

const sanitizeQuery = (query: string) => query.trim();

const applyQuery = (query: string | undefined) => {
  const trimmed = sanitizeQuery(query ?? '');
  return trimmed.length > 0 ? `%${trimmed}%` : undefined;
};

export const searchDistricts = async (query?: string, limit = 20): Promise<LocationOption[]> => {
  const ilike = applyQuery(query);

  const request = supabase
    .from('pt_districts')
    .select('id, name')
    .order('name', { ascending: true })
    .limit(limit);

  if (ilike) {
    request.ilike('name', ilike);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));
};

export const searchMunicipalities = async (
  districtId: string,
  query?: string,
  limit = 30,
): Promise<LocationOption[]> => {
  const ilike = applyQuery(query);

  const request = supabase
    .from('pt_municipalities')
    .select('id, name')
    .eq('district_id', districtId)
    .order('name', { ascending: true })
    .limit(limit);

  if (ilike) {
    request.ilike('name', ilike);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));
};

export const searchParishes = async (
  municipalityId: string,
  query?: string,
  limit = 40,
): Promise<LocationOption[]> => {
  const ilike = applyQuery(query);

  const request = supabase
    .from('pt_parishes')
    .select('id, name')
    .eq('municipality_id', municipalityId)
    .order('name', { ascending: true })
    .limit(limit);

  if (ilike) {
    request.ilike('name', ilike);
  }

  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
  }));
};

export const searchParishesWithParents = async (query: string, limit = 25): Promise<ParishSearchResult[]> => {
  const trimmed = sanitizeQuery(query);

  if (trimmed.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('pt_parishes')
    .select(
      `
      id,
      name,
      municipality:pt_municipalities (
        id,
        name,
        district:pt_districts (
          id,
          name
        )
      )
    `,
    )
    .ilike('name', applyQuery(query)!)
    .order('name', { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row: any) => ({
      parishId: row.id,
      parishName: row.name,
      municipalityId: row.municipality?.id,
      municipalityName: row.municipality?.name,
      districtId: row.municipality?.district?.id,
      districtName: row.municipality?.district?.name,
    }))
    .filter(
      (result: ParishSearchResult) =>
        Boolean(result.parishId) && Boolean(result.municipalityId) && Boolean(result.districtId),
    ) as ParishSearchResult[];
};

export const formatLocationSelection = (selection: LocationSelection) => {
  if (selection.parishName && selection.municipalityName && selection.districtName) {
    return `${selection.parishName}, ${selection.municipalityName}, ${selection.districtName}`;
  }

  if (selection.municipalityName && selection.districtName) {
    return `${selection.municipalityName}, ${selection.districtName}`;
  }

  if (selection.districtName) {
    return selection.districtName;
  }

  return '';
};

