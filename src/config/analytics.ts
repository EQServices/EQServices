/**
 * Configuração centralizada de Analytics e Monitoramento
 */

import { initializeAnalytics } from '../services/analytics';
import { initializeErrorTracking } from '../services/errorTracking';
import { logger } from '../services/logger';

/**
 * Inicializa todos os serviços de analytics e monitoramento
 */
export const initializeMonitoring = async (): Promise<void> => {
  try {
    // Configurar logger
    logger.configure({
      enabled: true,
      logLevel: __DEV__ ? 'debug' : 'info',
    });

    logger.info('Inicializando serviços de monitoramento...');

    // Inicializar Analytics
    await initializeAnalytics();

    // Inicializar Error Tracking (Sentry)
    const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
    if (sentryDsn) {
      initializeErrorTracking(sentryDsn);
    } else {
      logger.warn('Sentry DSN não configurado');
    }

    logger.info('Serviços de monitoramento inicializados');
  } catch (error) {
    logger.error('Erro ao inicializar monitoramento', { error });
  }
};

