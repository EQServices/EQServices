/**
 * Serviço de Analytics usando Firebase Analytics
 * 
 * Este serviço fornece uma interface unificada para rastrear eventos,
 * telas e métricas de negócio.
 */

import { Platform } from 'react-native';

// Mock do Firebase Analytics para desenvolvimento
let analyticsEnabled = false;
let firebaseAnalytics: any = null;

// Tentar inicializar Firebase Analytics
try {
  if (Platform.OS !== 'web') {
    // Firebase Analytics só funciona em iOS/Android nativo
    // Para Expo, precisamos usar expo-firebase-analytics ou similar
    // Por enquanto, vamos usar um sistema de logging que pode ser conectado depois
    analyticsEnabled = process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true';
  }
} catch (error) {
  console.warn('Firebase Analytics não disponível:', error);
}

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export interface ScreenView {
  screenName: string;
  screenClass?: string;
}

/**
 * Inicializa o serviço de analytics
 */
export const initializeAnalytics = async (): Promise<void> => {
  if (!analyticsEnabled) {
    console.log('[Analytics] Desabilitado');
    return;
  }

  try {
    // Aqui você pode inicializar Firebase Analytics quando necessário
    // Por exemplo: await analytics().setAnalyticsCollectionEnabled(true);
    console.log('[Analytics] Inicializado');
  } catch (error) {
    console.error('[Analytics] Erro ao inicializar:', error);
  }
};

/**
 * Registra um evento customizado
 */
export const logEvent = (eventName: string, parameters?: Record<string, any>): void => {
  if (!analyticsEnabled) {
    console.log(`[Analytics Event] ${eventName}`, parameters);
    return;
  }

  try {
    // Firebase Analytics
    // analytics().logEvent(eventName, parameters);
    
    // Log local para desenvolvimento
    console.log(`[Analytics Event] ${eventName}`, parameters);
    
    // Enviar para backend se necessário
    sendToBackend('event', { name: eventName, parameters });
  } catch (error) {
    console.error(`[Analytics] Erro ao registrar evento ${eventName}:`, error);
  }
};

/**
 * Registra visualização de tela
 */
export const logScreenView = (screenName: string, screenClass?: string): void => {
  if (!analyticsEnabled) {
    console.log(`[Analytics Screen] ${screenName}`);
    return;
  }

  try {
    // Firebase Analytics
    // analytics().logScreenView({ screen_name: screenName, screen_class: screenClass });
    
    console.log(`[Analytics Screen] ${screenName}`, screenClass ? `(${screenClass})` : '');
    
    sendToBackend('screen_view', { screenName, screenClass });
  } catch (error) {
    console.error(`[Analytics] Erro ao registrar tela ${screenName}:`, error);
  }
};

/**
 * Define propriedades do usuário
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!analyticsEnabled) return;

  try {
    // Firebase Analytics
    // Object.entries(properties).forEach(([key, value]) => {
    //   analytics().setUserProperty(key, String(value));
    // });
    
    console.log('[Analytics] User Properties:', properties);
    sendToBackend('user_properties', properties);
  } catch (error) {
    console.error('[Analytics] Erro ao definir propriedades do usuário:', error);
  }
};

/**
 * Define ID do usuário
 */
export const setUserId = (userId: string | null): void => {
  if (!analyticsEnabled) return;

  try {
    // Firebase Analytics
    // analytics().setUserId(userId);
    
    console.log('[Analytics] User ID:', userId);
    sendToBackend('user_id', { userId });
  } catch (error) {
    console.error('[Analytics] Erro ao definir ID do usuário:', error);
  }
};

/**
 * Eventos de negócio pré-definidos
 */
export const AnalyticsEvents = {
  // Autenticação
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',
  PASSWORD_RESET: 'password_reset',
  
  // Pedidos de Serviço
  SERVICE_REQUEST_CREATED: 'service_request_created',
  SERVICE_REQUEST_VIEWED: 'service_request_viewed',
  SERVICE_REQUEST_COMPLETED: 'service_request_completed',
  
  // Propostas
  PROPOSAL_SENT: 'proposal_sent',
  PROPOSAL_ACCEPTED: 'proposal_accepted',
  PROPOSAL_REJECTED: 'proposal_rejected',
  
  // Leads
  LEAD_UNLOCKED: 'lead_unlocked',
  LEAD_VIEWED: 'lead_viewed',
  
  // Créditos
  CREDITS_PURCHASED: 'credits_purchased',
  CREDITS_USED: 'credits_used',
  
  // Chat
  MESSAGE_SENT: 'message_sent',
  CONVERSATION_STARTED: 'conversation_started',
  
  // Avaliações
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_VIEWED: 'review_viewed',
  
  // Perfil
  PROFILE_UPDATED: 'profile_updated',
  PORTFOLIO_UPLOADED: 'portfolio_uploaded',
  
  // Compartilhamento
  CONTENT_SHARED: 'content_shared',
  
  // Busca
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
};

/**
 * Envia dados para backend (opcional)
 */
const sendToBackend = async (type: string, data: any): Promise<void> => {
  // Implementar envio para backend se necessário
  // Por exemplo, salvar em Supabase ou enviar para API própria
  try {
    // Exemplo: await supabase.from('analytics_events').insert({ type, data, timestamp: new Date() });
  } catch (error) {
    // Silenciosamente falhar - analytics não deve quebrar a aplicação
    console.warn('[Analytics] Erro ao enviar para backend:', error);
  }
};

/**
 * Habilita/desabilita analytics
 */
export const setAnalyticsEnabled = (enabled: boolean): void => {
  analyticsEnabled = enabled;
};

/**
 * Verifica se analytics está habilitado
 */
export const isAnalyticsEnabled = (): boolean => {
  return analyticsEnabled;
};

