/**
 * Sistema de Métricas de Negócio
 * 
 * Rastreia KPIs e métricas importantes para o negócio,
 * como conversões, receita, engajamento, etc.
 */

import { supabase } from '../config/supabase';
import { logEvent, AnalyticsEvents } from './analytics';
import { logger } from './logger';

export interface BusinessMetric {
  name: string;
  value: number;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ConversionMetrics {
  serviceRequestsCreated: number;
  proposalsSent: number;
  proposalsAccepted: number;
  leadsUnlocked: number;
  creditsPurchased: number;
  reviewsSubmitted: number;
}

/**
 * Registra uma métrica de negócio
 */
export const trackMetric = async (
  name: string,
  value: number,
  metadata?: Record<string, any>,
  userId?: string,
): Promise<void> => {
  try {
    const metric: BusinessMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      userId,
      metadata,
    };

    // Log local
    logger.info(`Business Metric: ${name}`, { value, metadata, userId });

    // Enviar para analytics
    logEvent(`metric_${name}`, {
      value,
      ...metadata,
    });

    // Salvar no banco de dados (opcional)
    await saveMetricToDatabase(metric);
  } catch (error) {
    logger.error(`Erro ao rastrear métrica ${name}`, { error, metadata });
  }
};

/**
 * Salva métrica no banco de dados
 */
const saveMetricToDatabase = async (metric: BusinessMetric): Promise<void> => {
  try {
    // Criar tabela business_metrics se não existir
    // Por enquanto, apenas logamos
    // await supabase.from('business_metrics').insert(metric);
  } catch (error) {
    // Silenciosamente falhar
    logger.warn('Erro ao salvar métrica no banco', { error });
  }
};

/**
 * Métricas de Conversão
 */
export const trackConversion = async (
  type: keyof ConversionMetrics,
  userId?: string,
  metadata?: Record<string, any>,
): Promise<void> => {
  await trackMetric(`conversion_${type}`, 1, metadata, userId);

  // Eventos específicos de analytics
  switch (type) {
    case 'serviceRequestsCreated':
      logEvent(AnalyticsEvents.SERVICE_REQUEST_CREATED, metadata);
      break;
    case 'proposalsSent':
      logEvent(AnalyticsEvents.PROPOSAL_SENT, metadata);
      break;
    case 'proposalsAccepted':
      logEvent(AnalyticsEvents.PROPOSAL_ACCEPTED, metadata);
      break;
    case 'leadsUnlocked':
      logEvent(AnalyticsEvents.LEAD_UNLOCKED, metadata);
      break;
    case 'creditsPurchased':
      logEvent(AnalyticsEvents.CREDITS_PURCHASED, metadata);
      break;
    case 'reviewsSubmitted':
      logEvent(AnalyticsEvents.REVIEW_SUBMITTED, metadata);
      break;
  }
};

/**
 * Métricas de Receita
 */
export const trackRevenue = async (
  amount: number,
  currency: string = 'EUR',
  userId?: string,
  metadata?: Record<string, any>,
): Promise<void> => {
  await trackMetric('revenue', amount, {
    currency,
    ...metadata,
  }, userId);

  logEvent('purchase', {
    value: amount,
    currency,
    ...metadata,
  });
};

/**
 * Métricas de Engajamento
 */
export const trackEngagement = async (
  action: string,
  duration?: number,
  userId?: string,
  metadata?: Record<string, any>,
): Promise<void> => {
  await trackMetric('engagement', 1, {
    action,
    duration,
    ...metadata,
  }, userId);
};

/**
 * Calcula taxa de conversão
 */
export const calculateConversionRate = async (
  numerator: number,
  denominator: number,
): Promise<number> => {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
};

/**
 * Obtém métricas agregadas (exemplo)
 */
export const getAggregatedMetrics = async (
  startDate: Date,
  endDate: Date,
): Promise<{
  totalServiceRequests: number;
  totalProposals: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
}> => {
  try {
    // Implementar consultas ao banco de dados
    // Por enquanto, retornar valores mockados
    return {
      totalServiceRequests: 0,
      totalProposals: 0,
      totalRevenue: 0,
      averageRating: 0,
      conversionRate: 0,
    };
  } catch (error) {
    logger.error('Erro ao obter métricas agregadas', { error });
    throw error;
  }
};

/**
 * Métricas pré-definidas
 */
export const BusinessMetrics = {
  // Conversões
  SERVICE_REQUEST_CREATED: 'service_request_created',
  PROPOSAL_SENT: 'proposal_sent',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  LEAD_UNLOCKED: 'lead_unlocked',
  
  // Receita
  REVENUE: 'revenue',
  CREDITS_PURCHASED: 'credits_purchased',
  
  // Engajamento
  USER_LOGIN: 'user_login',
  USER_SESSION: 'user_session',
  SCREEN_VIEW: 'screen_view',
  
  // Qualidade
  REVIEW_SUBMITTED: 'review_submitted',
  RATING_AVERAGE: 'rating_average',
  
  // Performance
  RESPONSE_TIME: 'response_time',
  LOAD_TIME: 'load_time',
};

