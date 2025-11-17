import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  getSyncQueueStats,
  processSyncAction,
} from '../syncQueue';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('syncQueue', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('addToSyncQueue', () => {
    it('deve adicionar ação à fila', async () => {
      const actionId = await addToSyncQueue('CREATE_SERVICE_REQUEST', { title: 'Test' }, 2);

      expect(actionId).toBeTruthy();

      const queue = await getSyncQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].type).toBe('CREATE_SERVICE_REQUEST');
      expect(queue[0].payload).toEqual({ title: 'Test' });
      expect(queue[0].priority).toBe(2);
    });

    it('deve ordenar por prioridade', async () => {
      await addToSyncQueue('ACTION_1', {}, 1);
      await addToSyncQueue('ACTION_2', {}, 3);
      await addToSyncQueue('ACTION_3', {}, 2);

      const queue = await getSyncQueue();
      expect(queue[0].priority).toBe(3); // Maior prioridade primeiro
      expect(queue[1].priority).toBe(2);
      expect(queue[2].priority).toBe(1);
    });
  });

  describe('getSyncQueue', () => {
    it('deve retornar fila vazia quando não há ações', async () => {
      const queue = await getSyncQueue();
      expect(queue).toEqual([]);
    });

    it('deve retornar todas as ações', async () => {
      await addToSyncQueue('ACTION_1', {});
      await addToSyncQueue('ACTION_2', {});

      const queue = await getSyncQueue();
      expect(queue.length).toBe(2);
    });
  });

  describe('removeFromSyncQueue', () => {
    it('deve remover ação da fila', async () => {
      const actionId = await addToSyncQueue('ACTION_1', {});

      const removed = await removeFromSyncQueue(actionId);
      expect(removed).toBe(true);

      const queue = await getSyncQueue();
      expect(queue.length).toBe(0);
    });

    it('deve retornar false quando ação não existe', async () => {
      const removed = await removeFromSyncQueue('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('clearSyncQueue', () => {
    it('deve limpar toda a fila', async () => {
      await addToSyncQueue('ACTION_1', {});
      await addToSyncQueue('ACTION_2', {});

      const cleared = await clearSyncQueue();
      expect(cleared).toBe(true);

      const queue = await getSyncQueue();
      expect(queue.length).toBe(0);
    });
  });

  describe('getSyncQueueStats', () => {
    it('deve retornar estatísticas corretas', async () => {
      await addToSyncQueue('ACTION_1', {}, 1);
      await addToSyncQueue('ACTION_2', {}, 2);
      await addToSyncQueue('ACTION_3', {}, 2);

      const stats = await getSyncQueueStats();

      expect(stats.total).toBe(3);
      expect(stats.byPriority[1]).toBe(1);
      expect(stats.byPriority[2]).toBe(2);
    });

    it('deve retornar stats vazias quando fila está vazia', async () => {
      const stats = await getSyncQueueStats();

      expect(stats.total).toBe(0);
      expect(stats.oldest).toBeNull();
    });
  });

  describe('processSyncAction', () => {
    it('deve processar ação com sucesso', async () => {
      const actionId = await addToSyncQueue('TEST_ACTION', { data: 'test' });

      const queue = await getSyncQueue();
      const action = queue[0];

      const handler = jest.fn().mockResolvedValue(undefined);

      const success = await processSyncAction(action, handler);

      expect(success).toBe(true);
      expect(handler).toHaveBeenCalledWith('TEST_ACTION', { data: 'test' });

      const updatedQueue = await getSyncQueue();
      expect(updatedQueue.find((a) => a.id === actionId)).toBeUndefined();
    });

    it('deve incrementar retries em caso de falha', async () => {
      const actionId = await addToSyncQueue('TEST_ACTION', { data: 'test' });

      const queue = await getSyncQueue();
      const action = queue[0];

      const handler = jest.fn().mockRejectedValue(new Error('Handler error'));

      const success = await processSyncAction(action, handler, { maxRetries: 3 });

      expect(success).toBe(false);
      expect(handler).toHaveBeenCalled();

      const updatedQueue = await getSyncQueue();
      const updatedAction = updatedQueue.find((a) => a.id === actionId);
      expect(updatedAction?.retries).toBe(1);
    });

    it('deve remover ação após maxRetries', async () => {
      const actionId = await addToSyncQueue('TEST_ACTION', { data: 'test' });

      const queue = await getSyncQueue();
      let action = queue[0];

      const handler = jest.fn().mockRejectedValue(new Error('Handler error'));

      // Processar até maxRetries
      for (let i = 0; i < 3; i++) {
        await processSyncAction(action, handler, { maxRetries: 3 });
        const updatedQueue = await getSyncQueue();
        action = updatedQueue.find((a) => a.id === actionId);
        if (!action) break;
      }

      const finalQueue = await getSyncQueue();
      expect(finalQueue.find((a) => a.id === actionId)).toBeUndefined();
    });
  });
});

