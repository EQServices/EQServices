import { supabase } from '../config/supabase';
import { Review } from '../types';

export interface ReviewSummary {
  average: number;
  count: number;
}

export interface SubmitReviewPayload {
  serviceRequestId: string;
  professionalId: string;
  clientId: string;
  rating: number;
  comment?: string;
}

export interface ProfessionalReview extends Review {
  client?: {
    name?: string;
  };
}

const mapReview = (row: any): Review => ({
  id: row.id,
  serviceRequestId: row.service_request_id,
  professionalId: row.professional_id,
  clientId: row.client_id,
  rating: row.rating,
  comment: row.comment ?? null,
  createdAt: row.created_at,
  client: row.client ? { name: row.client.name ?? undefined } : undefined,
});

export const getProfessionalReviewSummary = async (professionalId: string): Promise<ReviewSummary> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating', { count: 'exact' })
    .eq('professional_id', professionalId);

  if (error) {
    throw error;
  }

  const ratings = data?.map((row) => Number(row.rating)) ?? [];
  const count = ratings.length;
  const average = count > 0 ? ratings.reduce((sum, value) => sum + value, 0) / count : 0;

  return {
    average,
    count,
  };
};

const updateProfessionalAggregates = async (professionalId: string) => {
  const summary = await getProfessionalReviewSummary(professionalId);
  const { error } = await supabase
    .from('professionals')
    .update({
      rating: summary.average,
      review_count: summary.count,
    })
    .eq('id', professionalId);

  if (error) {
    throw error;
  }

  return summary;
};

export const submitReview = async ({ serviceRequestId, professionalId, clientId, rating, comment }: SubmitReviewPayload) => {
  const payload = {
    service_request_id: serviceRequestId,
    professional_id: professionalId,
    client_id: clientId,
    rating,
    comment: comment?.trim() ? comment.trim() : null,
  };

  const { error } = await supabase.from('reviews').insert(payload);

  if (error) {
    throw error;
  }

  return updateProfessionalAggregates(professionalId);
};

export const listProfessionalReviews = async (professionalId: string): Promise<ProfessionalReview[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, client:client_id(name)')
    .eq('professional_id', professionalId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((row) => mapReview(row) as ProfessionalReview);
};

export const getClientReviewForRequest = async (serviceRequestId: string, clientId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('service_request_id', serviceRequestId)
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapReview(data) : null;
};

