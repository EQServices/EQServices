import { supabase } from '../config/supabase';
import { Professional } from '../types';
import { calculateDistance, formatDistance } from './geolocation';

export interface ProfessionalSearchFilters {
  categories?: string[];
  regions?: string[];
  minRating?: number;
  nearby?: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  };
}

export interface ProfessionalWithDistance extends Professional {
  distanceKm?: number;
  distanceFormatted?: string;
}

/**
 * Busca profissionais com filtros opcionais
 */
export const searchProfessionals = async (
  filters?: ProfessionalSearchFilters,
): Promise<ProfessionalWithDistance[]> => {
  try {
    let query = supabase
      .from('users')
      .select(
        `
        id,
        name,
        email,
        user_type,
        location_label,
        latitude,
        longitude,
        professionals (
          categories,
          regions,
          credits,
          rating,
          review_count,
          portfolio,
          description,
          avatar_url
        )
      `,
      )
      .eq('user_type', 'professional');

    // Se há filtro de proximidade, usar função SQL
    if (filters?.nearby) {
      const { data, error } = await supabase.rpc('find_nearby_professionals', {
        ref_latitude: filters.nearby.latitude,
        ref_longitude: filters.nearby.longitude,
        radius_km: filters.nearby.radiusKm || 50,
      });

      if (error) throw error;

      // Mapear resultados e aplicar outros filtros
      const professionals = (data || [])
        .map((row: any) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          userType: 'professional' as const,
          categories: row.categories || [],
          regions: [], // Será preenchido depois se necessário
          credits: 0,
          rating: parseFloat(row.rating) || 0,
          reviewCount: row.review_count || 0,
          portfolio: [],
          distanceKm: parseFloat(row.distance_km) || undefined,
          distanceFormatted: row.distance_km ? formatDistance(parseFloat(row.distance_km)) : undefined,
        }))
        .filter((prof: ProfessionalWithDistance) => {
          // Aplicar filtros adicionais
          if (filters?.categories && filters.categories.length > 0) {
            const hasCategory = prof.categories.some((cat) => filters.categories!.includes(cat));
            if (!hasCategory) return false;
          }

          if (filters?.minRating && prof.rating < filters.minRating) {
            return false;
          }

          return true;
        });

      return professionals;
    }

    // Busca normal sem filtro de proximidade
    const { data, error } = await query;

    if (error) throw error;

    const professionals: ProfessionalWithDistance[] = (data || [])
      .map((row: any) => {
        const prof = row.professionals;
        return {
          id: row.id,
          name: row.name,
          email: row.email,
          userType: 'professional' as const,
          categories: prof?.categories || [],
          regions: prof?.regions || [],
          credits: prof?.credits || 0,
          rating: parseFloat(prof?.rating) || 0,
          reviewCount: prof?.review_count || 0,
          portfolio: prof?.portfolio || [],
          description: prof?.description,
          locationLabel: row.location_label,
          latitude: row.latitude,
          longitude: row.longitude,
          avatarUrl: prof?.avatar_url || row.avatar_url,
        };
      })
      .filter((prof: ProfessionalWithDistance) => {
        // Aplicar filtros
        if (filters?.categories && filters.categories.length > 0) {
          const hasCategory = prof.categories.some((cat) => filters.categories!.includes(cat));
          if (!hasCategory) return false;
        }

        if (filters?.regions && filters.regions.length > 0) {
          const hasRegion = prof.regions.some((reg) => filters.regions!.includes(reg));
          if (!hasRegion) return false;
        }

        if (filters?.minRating && prof.rating < filters.minRating) {
          return false;
        }

        return true;
      });

    // Se há coordenadas de referência mas não foi usado filtro de proximidade SQL,
    // calcular distâncias manualmente
    if (filters?.nearby) {
      professionals.forEach((prof) => {
        if (prof.latitude && prof.longitude) {
          const distance = calculateDistance(
            filters.nearby!.latitude,
            filters.nearby!.longitude,
            prof.latitude,
            prof.longitude,
          );
          prof.distanceKm = distance;
          prof.distanceFormatted = formatDistance(distance);
        }
      });

      // Ordenar por distância
      professionals.sort((a, b) => {
        const distA = a.distanceKm ?? Infinity;
        const distB = b.distanceKm ?? Infinity;
        return distA - distB;
      });
    }

    return professionals;
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    throw error;
  }
};

/**
 * Busca profissionais próximos usando função SQL do banco
 */
export const searchNearbyProfessionals = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  filters?: Omit<ProfessionalSearchFilters, 'nearby'>,
): Promise<ProfessionalWithDistance[]> => {
  return searchProfessionals({
    ...filters,
    nearby: {
      latitude,
      longitude,
      radiusKm,
    },
  });
};

/**
 * Obtém um profissional por ID
 */
export const getProfessionalById = async (id: string): Promise<Professional | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        id,
        name,
        email,
        user_type,
        location_label,
        latitude,
        longitude,
        professionals (
          categories,
          regions,
          credits,
          rating,
          review_count,
          portfolio,
          description,
          avatar_url
        )
      `,
      )
      .eq('id', id)
      .eq('user_type', 'professional')
      .single();

    if (error) throw error;
    if (!data) return null;

    const prof = data.professionals;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      userType: 'professional',
      categories: prof?.categories || [],
      regions: prof?.regions || [],
      credits: prof?.credits || 0,
      rating: parseFloat(prof?.rating) || 0,
      reviewCount: prof?.review_count || 0,
      portfolio: prof?.portfolio || [],
      description: prof?.description,
      locationLabel: data.location_label,
      latitude: data.latitude,
      longitude: data.longitude,
      avatarUrl: prof?.avatar_url,
    };
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    return null;
  }
};

