/**
 * Serviço de Error Tracking usando Sentry
 * 
 * Este serviço captura e reporta erros automaticamente,
 * incluindo stack traces, contexto do usuário e informações do dispositivo.
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

let sentryEnabled = false;
let sentryInitialized = false;

export interface ErrorContext {
  userId?: string;
  userEmail?: string;
  userType?: 'client' | 'professional';
  screen?: string;
  action?: string;
  [key: string]: any;
}

/**
 * Inicializa o Sentry
 */
export const initializeErrorTracking = (dsn?: string): void => {
  if (sentryInitialized) {
    console.warn('[Sentry] Já inicializado');
    return;
  }

  const sentryDsn = dsn || process.env.EXPO_PUBLIC_SENTRY_DSN;
  
  if (!sentryDsn) {
    console.warn('[Sentry] DSN não configurado. Error tracking desabilitado.');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      enableInExpoDevelopment: false, // Desabilitar em desenvolvimento
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: __DEV__ ? 1.0 : 0.1, // 100% em dev, 10% em produção
      beforeSend(event, hint) {
        // Filtrar eventos em desenvolvimento se necessário
        if (__DEV__ && process.env.EXPO_PUBLIC_SENTRY_ENABLED !== 'true') {
          return null;
        }
        return event;
      },
    });

    sentryEnabled = true;
    sentryInitialized = true;
    console.log('[Sentry] Inicializado');
  } catch (error) {
    console.error('[Sentry] Erro ao inicializar:', error);
    sentryEnabled = false;
  }
};

/**
 * Captura uma exceção
 */
export const captureException = (error: Error, context?: ErrorContext): void => {
  console.error('[Error Tracking]', error, context);

  if (!sentryEnabled) {
    return;
  }

  try {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, { value });
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  } catch (err) {
    console.error('[Sentry] Erro ao capturar exceção:', err);
  }
};

/**
 * Captura uma mensagem de erro
 */
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'error', context?: ErrorContext): void => {
  console.error(`[Error Tracking] ${level.toUpperCase()}:`, message, context);

  if (!sentryEnabled) {
    return;
  }

  try {
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, { value });
        });
        Sentry.captureMessage(message, level);
      });
    } else {
      Sentry.captureMessage(message, level);
    }
  } catch (err) {
    console.error('[Sentry] Erro ao capturar mensagem:', err);
  }
};

/**
 * Define contexto do usuário
 */
export const setUserContext = (user: {
  id: string;
  email?: string;
  username?: string;
  [key: string]: any;
}): void => {
  if (!sentryEnabled) return;

  try {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error('[Sentry] Erro ao definir contexto do usuário:', error);
  }
};

/**
 * Limpa contexto do usuário (logout)
 */
export const clearUserContext = (): void => {
  if (!sentryEnabled) return;

  try {
    Sentry.setUser(null);
  } catch (error) {
    console.error('[Sentry] Erro ao limpar contexto do usuário:', error);
  }
};

/**
 * Adiciona breadcrumb (rastro de ações)
 */
export const addBreadcrumb = (message: string, category?: string, level?: Sentry.SeverityLevel, data?: Record<string, any>): void => {
  if (!sentryEnabled) return;

  try {
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  } catch (error) {
    console.error('[Sentry] Erro ao adicionar breadcrumb:', error);
  }
};

/**
 * Define tags customizadas
 */
export const setTag = (key: string, value: string): void => {
  if (!sentryEnabled) return;

  try {
    Sentry.setTag(key, value);
  } catch (error) {
    console.error('[Sentry] Erro ao definir tag:', error);
  }
};

/**
 * Define contexto adicional
 */
export const setContext = (key: string, context: Record<string, any>): void => {
  if (!sentryEnabled) return;

  try {
    Sentry.setContext(key, context);
  } catch (error) {
    console.error('[Sentry] Erro ao definir contexto:', error);
  }
};

/**
 * Habilita/desabilita Sentry
 */
export const setErrorTrackingEnabled = (enabled: boolean): void => {
  sentryEnabled = enabled;
};

/**
 * Verifica se Sentry está habilitado
 */
export const isErrorTrackingEnabled = (): boolean => {
  return sentryEnabled;
};

