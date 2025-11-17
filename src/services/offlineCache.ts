import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@elastiquality_cache_';
const CACHE_METADATA_KEY = '@elastiquality_cache_metadata';

export interface CacheMetadata {
  key: string;
  timestamp: number;
  ttl?: number; // Time to live em milissegundos
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl?: number;
}

/**
 * Gera chave de cache
 */
const getCacheKey = (key: string): string => {
  return `${CACHE_PREFIX}${key}`;
};

/**
 * Obtém metadados do cache
 */
const getCacheMetadata = async (): Promise<Record<string, CacheMetadata>> => {
  try {
    const metadataJson = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    return metadataJson ? JSON.parse(metadataJson) : {};
  } catch (error) {
    console.error('Erro ao obter metadados do cache:', error);
    return {};
  }
};

/**
 * Atualiza metadados do cache
 */
const updateCacheMetadata = async (key: string, ttl?: number): Promise<void> => {
  try {
    const metadata = await getCacheMetadata();
    metadata[key] = {
      key,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Erro ao atualizar metadados do cache:', error);
  }
};

/**
 * Verifica se uma entrada de cache está expirada
 */
const isCacheExpired = (entry: CacheEntry<any>): boolean => {
  if (!entry.ttl) {
    return false; // Sem TTL = nunca expira
  }

  const age = Date.now() - entry.timestamp;
  return age > entry.ttl;
};

/**
 * Salva dados no cache
 */
export const setCache = async <T>(key: string, data: T, ttl?: number): Promise<boolean> => {
  try {
    const cacheKey = getCacheKey(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    await updateCacheMetadata(key, ttl);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar cache para ${key}:`, error);
    return false;
  }
};

/**
 * Obtém dados do cache
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const cacheKey = getCacheKey(key);
    const entryJson = await AsyncStorage.getItem(cacheKey);

    if (!entryJson) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(entryJson);

    // Verificar se expirou
    if (isCacheExpired(entry)) {
      await removeCache(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error(`Erro ao obter cache para ${key}:`, error);
    return null;
  }
};

/**
 * Remove entrada do cache
 */
export const removeCache = async (key: string): Promise<boolean> => {
  try {
    const cacheKey = getCacheKey(key);
    await AsyncStorage.removeItem(cacheKey);

    // Atualizar metadados
    const metadata = await getCacheMetadata();
    delete metadata[key];
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));

    return true;
  } catch (error) {
    console.error(`Erro ao remover cache para ${key}:`, error);
    return false;
  }
};

/**
 * Limpa todo o cache
 */
export const clearAllCache = async (): Promise<boolean> => {
  try {
    const metadata = await getCacheMetadata();
    const keys = Object.keys(metadata);

    // Remover todas as entradas
    await Promise.all(keys.map((key) => removeCache(key)));

    // Remover metadados
    await AsyncStorage.removeItem(CACHE_METADATA_KEY);

    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return false;
  }
};

/**
 * Limpa cache expirado
 */
export const clearExpiredCache = async (): Promise<number> => {
  try {
    const metadata = await getCacheMetadata();
    let clearedCount = 0;

    for (const key of Object.keys(metadata)) {
      const entry = await getCache(key);
      if (entry === null) {
        // Entrada expirada ou não existe
        clearedCount++;
      }
    }

    return clearedCount;
  } catch (error) {
    console.error('Erro ao limpar cache expirado:', error);
    return 0;
  }
};

/**
 * Obtém tamanho aproximado do cache em bytes
 */
export const getCacheSize = async (): Promise<number> => {
  try {
    const metadata = await getCacheMetadata();
    let totalSize = 0;

    for (const key of Object.keys(metadata)) {
      const cacheKey = getCacheKey(key);
      const value = await AsyncStorage.getItem(cacheKey);
      if (value) {
        totalSize += value.length;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Erro ao calcular tamanho do cache:', error);
    return 0;
  }
};

/**
 * Estratégias de cache
 */
export enum CacheStrategy {
  CACHE_FIRST = 'cache_first', // Usa cache primeiro, depois rede
  NETWORK_FIRST = 'network_first', // Usa rede primeiro, fallback para cache
  CACHE_ONLY = 'cache_only', // Apenas cache
  NETWORK_ONLY = 'network_only', // Apenas rede
}

/**
 * Executa função com estratégia de cache
 */
export const withCache = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  strategy: CacheStrategy = CacheStrategy.NETWORK_FIRST,
  ttl?: number,
): Promise<T> => {
  const cached = await getCache<T>(key);

  switch (strategy) {
    case CacheStrategy.CACHE_ONLY:
      if (cached) {
        return cached;
      }
      throw new Error('Dados não encontrados no cache');

    case CacheStrategy.NETWORK_ONLY:
      const networkData = await fetchFn();
      await setCache(key, networkData, ttl);
      return networkData;

    case CacheStrategy.CACHE_FIRST:
      if (cached) {
        // Tentar atualizar em background
        fetchFn()
          .then((data) => setCache(key, data, ttl))
          .catch(() => {
            // Ignorar erros de atualização em background
          });
        return cached;
      }
      const freshData = await fetchFn();
      await setCache(key, freshData, ttl);
      return freshData;

    case CacheStrategy.NETWORK_FIRST:
    default:
      try {
        const networkData = await fetchFn();
        await setCache(key, networkData, ttl);
        return networkData;
      } catch (error) {
        if (cached) {
          return cached;
        }
        throw error;
      }
  }
};

