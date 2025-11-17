import { isOnline } from './network';
import { processSyncQueue, SyncAction } from './syncQueue';
import { clearExpiredCache } from './offlineCache';

export interface SyncHandler {
  [key: string]: (payload: any) => Promise<void>;
}

/**
 * Serviço de sincronização principal
 */
class SyncService {
  private handlers: SyncHandler = {};
  private isProcessing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  /**
   * Registra handler para um tipo de ação
   */
  registerHandler(type: string, handler: (payload: any) => Promise<void>): void {
    this.handlers[type] = handler;
  }

  /**
   * Remove handler
   */
  unregisterHandler(type: string): void {
    delete this.handlers[type];
  }

  /**
   * Processa fila de sincronização
   */
  async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing) {
      return { processed: 0, failed: 0 };
    }

    const online = await isOnline();
    if (!online) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;

    try {
      const handler = async (type: string, payload: any) => {
        const typeHandler = this.handlers[type];
        if (!typeHandler) {
          throw new Error(`Handler não encontrado para tipo: ${type}`);
        }
        await typeHandler(payload);
      };

      const result = await processSyncQueue(handler);
      
      // Limpar cache expirado após sincronização
      await clearExpiredCache();

      return result;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Inicia sincronização automática periódica
   */
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(() => {
      this.processQueue().catch((error) => {
        console.error('Erro na sincronização automática:', error);
      });
    }, intervalMs);
  }

  /**
   * Para sincronização automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Força sincronização imediata
   */
  async forceSync(): Promise<{ processed: number; failed: number }> {
    return this.processQueue();
  }
}

// Instância singleton
export const syncService = new SyncService();

/**
 * Inicializa sincronização com handlers padrão
 */
export const initializeSync = (handlers: SyncHandler): void => {
  Object.entries(handlers).forEach(([type, handler]) => {
    syncService.registerHandler(type, handler);
  });
};

/**
 * Inicia sincronização automática
 */
export const startAutoSync = (intervalMs?: number): void => {
  syncService.startAutoSync(intervalMs);
};

/**
 * Para sincronização automática
 */
export const stopAutoSync = (): void => {
  syncService.stopAutoSync();
};

/**
 * Força sincronização
 */
export const forceSync = async (): Promise<{ processed: number; failed: number }> => {
  return syncService.forceSync();
};

