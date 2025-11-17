import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const RATE_LIMIT_PREFIX = 'rate_limit_';
const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const DEFAULT_MAX_ATTEMPTS = 5;

/**
 * Verifica se uma ação excedeu o limite de tentativas
 */
export const checkRateLimit = async (
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS,
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  const storageKey = `${RATE_LIMIT_PREFIX}${key}`;
  
  try {
    const stored = await AsyncStorage.getItem(storageKey);
    const now = Date.now();
    
    if (!stored) {
      // Primeira tentativa
      const entry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: entry.resetTime,
      };
    }
    
    const entry: RateLimitEntry = JSON.parse(stored);
    
    // Se a janela de tempo expirou, resetar
    if (now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(newEntry));
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: newEntry.resetTime,
      };
    }
    
    // Verificar se excedeu o limite
    if (entry.count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    // Incrementar contador
    entry.count += 1;
    await AsyncStorage.setItem(storageKey, JSON.stringify(entry));
    
    return {
      allowed: true,
      remaining: maxAttempts - entry.count,
      resetTime: entry.resetTime,
    };
  } catch (error) {
    console.error('Erro ao verificar rate limit:', error);
    // Em caso de erro, permitir a ação (fail open)
    return {
      allowed: true,
      remaining: maxAttempts,
      resetTime: Date.now() + windowMs,
    };
  }
};

/**
 * Reseta o rate limit para uma chave específica
 */
export const resetRateLimit = async (key: string): Promise<void> => {
  const storageKey = `${RATE_LIMIT_PREFIX}${key}`;
  try {
    await AsyncStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Erro ao resetar rate limit:', error);
  }
};

/**
 * Limpa todos os rate limits expirados
 */
export const cleanupExpiredRateLimits = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const rateLimitKeys = keys.filter((key) => key.startsWith(RATE_LIMIT_PREFIX));
    const now = Date.now();
    
    for (const key of rateLimitKeys) {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const entry: RateLimitEntry = JSON.parse(stored);
        if (now > entry.resetTime) {
          await AsyncStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao limpar rate limits expirados:', error);
  }
};

/**
 * Rate limits específicos para diferentes ações
 */
export const RateLimitKeys = {
  LOGIN: 'login',
  REGISTER: 'register',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  PHONE_VERIFICATION: 'phone_verification',
} as const;

/**
 * Configurações de rate limit por ação
 */
export const RateLimitConfig = {
  [RateLimitKeys.LOGIN]: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 tentativas em 15 minutos
  [RateLimitKeys.REGISTER]: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 tentativas em 1 hora
  [RateLimitKeys.PASSWORD_RESET]: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 tentativas em 1 hora
  [RateLimitKeys.EMAIL_VERIFICATION]: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 tentativas em 15 minutos
  [RateLimitKeys.PHONE_VERIFICATION]: { maxAttempts: 3, windowMs: 15 * 60 * 1000 }, // 3 tentativas em 15 minutos
} as const;

