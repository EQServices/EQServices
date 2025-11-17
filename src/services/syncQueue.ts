import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_QUEUE_KEY = '@elastiquality_sync_queue';

export interface SyncAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
  priority: number; // 0 = baixa, 1 = média, 2 = alta
}

export interface SyncQueueOptions {
  maxRetries?: number;
  retryDelay?: number; // em milissegundos
}

const DEFAULT_OPTIONS: Required<SyncQueueOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
};

/**
 * Obtém fila de sincronização
 */
export const getSyncQueue = async (): Promise<SyncAction[]> => {
  try {
    const queueJson = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Erro ao obter fila de sincronização:', error);
    return [];
  }
};

/**
 * Salva fila de sincronização
 */
const saveSyncQueue = async (queue: SyncAction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Erro ao salvar fila de sincronização:', error);
  }
};

/**
 * Adiciona ação à fila de sincronização
 */
export const addToSyncQueue = async (
  type: string,
  payload: any,
  priority: number = 1,
): Promise<string> => {
  try {
    const queue = await getSyncQueue();
    const action: SyncAction = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
      priority,
    };

    queue.push(action);
    // Ordenar por prioridade (maior primeiro) e depois por timestamp
    queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });

    await saveSyncQueue(queue);
    return action.id;
  } catch (error) {
    console.error('Erro ao adicionar à fila de sincronização:', error);
    throw error;
  }
};

/**
 * Remove ação da fila
 */
export const removeFromSyncQueue = async (actionId: string): Promise<boolean> => {
  try {
    const queue = await getSyncQueue();
    const filtered = queue.filter((action) => action.id !== actionId);
    await saveSyncQueue(filtered);
    return true;
  } catch (error) {
    console.error('Erro ao remover da fila de sincronização:', error);
    return false;
  }
};

/**
 * Limpa toda a fila
 */
export const clearSyncQueue = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao limpar fila de sincronização:', error);
    return false;
  }
};

/**
 * Processa uma ação da fila
 */
export const processSyncAction = async (
  action: SyncAction,
  handler: (type: string, payload: any) => Promise<void>,
  options: SyncQueueOptions = {},
): Promise<boolean> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    await handler(action.type, action.payload);
    await removeFromSyncQueue(action.id);
    return true;
  } catch (error) {
    console.error(`Erro ao processar ação ${action.type}:`, error);

    // Incrementar tentativas
    const queue = await getSyncQueue();
    const updatedAction = queue.find((a) => a.id === action.id);
    if (updatedAction) {
      updatedAction.retries += 1;

      if (updatedAction.retries >= opts.maxRetries) {
        // Remover após muitas tentativas
        await removeFromSyncQueue(action.id);
        return false;
      }

      // Atualizar na fila
      const index = queue.findIndex((a) => a.id === action.id);
      if (index !== -1) {
        queue[index] = updatedAction;
        await saveSyncQueue(queue);
      }
    }

    return false;
  }
};

/**
 * Processa toda a fila de sincronização
 */
export const processSyncQueue = async (
  handler: (type: string, payload: any) => Promise<void>,
  options: SyncQueueOptions = {},
): Promise<{ processed: number; failed: number }> => {
  const queue = await getSyncQueue();
  let processed = 0;
  let failed = 0;

  for (const action of queue) {
    const success = await processSyncAction(action, handler, options);
    if (success) {
      processed++;
    } else {
      failed++;
    }

    // Pequeno delay entre ações para não sobrecarregar
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { processed, failed };
};

/**
 * Obtém estatísticas da fila
 */
export const getSyncQueueStats = async (): Promise<{
  total: number;
  byPriority: Record<number, number>;
  oldest: SyncAction | null;
}> => {
  const queue = await getSyncQueue();
  const byPriority: Record<number, number> = {};

  queue.forEach((action) => {
    byPriority[action.priority] = (byPriority[action.priority] || 0) + 1;
  });

  const oldest = queue.length > 0 ? queue[0] : null;

  return {
    total: queue.length,
    byPriority,
    oldest,
  };
};

