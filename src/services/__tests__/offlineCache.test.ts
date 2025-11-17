import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  getCacheSize,
  withCache,
  CacheStrategy,
} from '../offlineCache';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('offlineCache', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('setCache', () => {
    it('deve salvar dados no cache', async () => {
      const result = await setCache('test-key', { data: 'test' }, 60000);
      expect(result).toBe(true);

      const cached = await AsyncStorage.getItem('@elastiquality_cache_test-key');
      expect(cached).toBeTruthy();
    });

    it('deve salvar dados sem TTL', async () => {
      const result = await setCache('test-key', { data: 'test' });
      expect(result).toBe(true);
    });
  });

  describe('getCache', () => {
    it('deve recuperar dados do cache', async () => {
      await setCache('test-key', { data: 'test' }, 60000);
      const cached = await getCache('test-key');

      expect(cached).toEqual({ data: 'test' });
    });

    it('deve retornar null para chave inexistente', async () => {
      const cached = await getCache('non-existent');
      expect(cached).toBeNull();
    });

    it('deve retornar null para cache expirado', async () => {
      // Criar cache com TTL muito curto
      await setCache('expired-key', { data: 'test' }, 1);
      
      // Aguardar expiração
      await new Promise((resolve) => setTimeout(resolve, 10));
      
      const cached = await getCache('expired-key');
      expect(cached).toBeNull();
    });
  });

  describe('removeCache', () => {
    it('deve remover entrada do cache', async () => {
      await setCache('test-key', { data: 'test' });
      const removed = await removeCache('test-key');
      
      expect(removed).toBe(true);
      
      const cached = await getCache('test-key');
      expect(cached).toBeNull();
    });
  });

  describe('clearAllCache', () => {
    it('deve limpar todo o cache', async () => {
      await setCache('key1', { data: 'test1' });
      await setCache('key2', { data: 'test2' });
      
      const cleared = await clearAllCache();
      expect(cleared).toBe(true);
      
      const cached1 = await getCache('key1');
      const cached2 = await getCache('key2');
      
      expect(cached1).toBeNull();
      expect(cached2).toBeNull();
    });
  });

  describe('getCacheSize', () => {
    it('deve calcular tamanho do cache', async () => {
      await setCache('key1', { data: 'test1' });
      await setCache('key2', { data: 'test2' });
      
      const size = await getCacheSize();
      expect(size).toBeGreaterThan(0);
    });

    it('deve retornar 0 para cache vazio', async () => {
      await clearAllCache();
      const size = await getCacheSize();
      expect(size).toBe(0);
    });
  });

  describe('withCache', () => {
    const mockFetcher = jest.fn();

    beforeEach(() => {
      mockFetcher.mockClear();
    });

    describe('CacheStrategy.NETWORK_FIRST', () => {
      it('deve usar dados da rede quando disponível', async () => {
        mockFetcher.mockResolvedValue({ data: 'network' });

        const result = await withCache(
          'test-key',
          mockFetcher,
          CacheStrategy.NETWORK_FIRST,
          60000,
        );

        expect(result).toEqual({ data: 'network' });
        expect(mockFetcher).toHaveBeenCalledTimes(1);
      });

      it('deve usar cache quando rede falha', async () => {
        // Primeiro, salvar no cache
        await setCache('test-key', { data: 'cached' }, 60000);

        mockFetcher.mockRejectedValue(new Error('Network error'));

        const result = await withCache(
          'test-key',
          mockFetcher,
          CacheStrategy.NETWORK_FIRST,
          60000,
        );

        expect(result).toEqual({ data: 'cached' });
      });
    });

    describe('CacheStrategy.CACHE_FIRST', () => {
      it('deve usar cache quando disponível', async () => {
        await setCache('test-key', { data: 'cached' }, 60000);

        mockFetcher.mockResolvedValue({ data: 'network' });

        const result = await withCache(
          'test-key',
          mockFetcher,
          CacheStrategy.CACHE_FIRST,
          60000,
        );

        expect(result).toEqual({ data: 'cached' });
        // Fetcher ainda deve ser chamado em background
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(mockFetcher).toHaveBeenCalled();
      });

      it('deve usar rede quando cache não existe', async () => {
        mockFetcher.mockResolvedValue({ data: 'network' });

        const result = await withCache(
          'test-key',
          mockFetcher,
          CacheStrategy.CACHE_FIRST,
          60000,
        );

        expect(result).toEqual({ data: 'network' });
        expect(mockFetcher).toHaveBeenCalledTimes(1);
      });
    });

    describe('CacheStrategy.CACHE_ONLY', () => {
      it('deve retornar dados do cache', async () => {
        await setCache('test-key', { data: 'cached' }, 60000);

        const result = await withCache(
          'test-key',
          mockFetcher,
          CacheStrategy.CACHE_ONLY,
          60000,
        );

        expect(result).toEqual({ data: 'cached' });
        expect(mockFetcher).not.toHaveBeenCalled();
      });

      it('deve lançar erro quando cache não existe', async () => {
        await expect(
          withCache('non-existent', mockFetcher, CacheStrategy.CACHE_ONLY, 60000),
        ).rejects.toThrow();

        expect(mockFetcher).not.toHaveBeenCalled();
      });
    });

    describe('CacheStrategy.NETWORK_ONLY', () => {
      it('deve usar apenas rede', async () => {
        await setCache('test-key', { data: 'cached' }, 60000);

        mockFetcher.mockResolvedValue({ data: 'network' });

        const result = await withCache(
          'test-key',
          mockFetcher,
          CacheStrategy.NETWORK_ONLY,
          60000,
        );

        expect(result).toEqual({ data: 'network' });
        expect(mockFetcher).toHaveBeenCalledTimes(1);
      });

      it('deve lançar erro quando rede falha', async () => {
        mockFetcher.mockRejectedValue(new Error('Network error'));

        await expect(
          withCache('test-key', mockFetcher, CacheStrategy.NETWORK_ONLY, 60000),
        ).rejects.toThrow();
      });
    });
  });
});

