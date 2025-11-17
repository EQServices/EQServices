import { useState, useEffect } from 'react';
import {
  isBiometryAvailable,
  getBiometryType,
  BiometryType,
  hasSavedCredentials,
  isBiometryEnabled,
  loginWithBiometry,
  saveCredentialsSecurely,
  clearSavedCredentials,
  setBiometryEnabled,
  SavedCredentials,
} from '../services/biometry';

export interface UseBiometryReturn {
  available: boolean;
  biometryType: BiometryType;
  hasCredentials: boolean;
  enabled: boolean;
  loading: boolean;
  authenticate: (reason?: string) => Promise<SavedCredentials | null>;
  saveCredentials: (email: string, password: string) => Promise<boolean>;
  removeCredentials: () => Promise<boolean>;
  toggleBiometry: (enabled: boolean) => Promise<boolean>;
}

/**
 * Hook para gerenciar biometria
 */
export const useBiometry = (): UseBiometryReturn => {
  const [available, setAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>({
    available: false,
    type: null,
    name: 'Não disponível',
  });
  const [hasCredentials, setHasCredentials] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkBiometry = async () => {
      try {
        setLoading(true);

        const [isAvailable, type, hasCreds, isEnabled] = await Promise.all([
          isBiometryAvailable(),
          getBiometryType(),
          hasSavedCredentials(),
          isBiometryEnabled(),
        ]);

        setAvailable(isAvailable);
        setBiometryType(type);
        setHasCredentials(hasCreds);
        setEnabled(isEnabled);
      } catch (error) {
        console.error('Erro ao verificar biometria:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBiometry();
  }, []);

  const authenticate = async (reason?: string): Promise<SavedCredentials | null> => {
    const credentials = await loginWithBiometry(reason);
    if (credentials) {
      setHasCredentials(true);
    }
    return credentials;
  };

  const saveCredentials = async (email: string, password: string): Promise<boolean> => {
    const success = await saveCredentialsSecurely(email, password);
    if (success) {
      setHasCredentials(true);
      // Habilitar biometria automaticamente ao salvar credenciais
      await setBiometryEnabled(true);
      setEnabled(true);
    }
    return success;
  };

  const removeCredentials = async (): Promise<boolean> => {
    const success = await clearSavedCredentials();
    if (success) {
      setHasCredentials(false);
      await setBiometryEnabled(false);
      setEnabled(false);
    }
    return success;
  };

  const toggleBiometry = async (enabled: boolean): Promise<boolean> => {
    const success = await setBiometryEnabled(enabled);
    if (success) {
      setEnabled(enabled);
    }
    return success;
  };

  return {
    available,
    biometryType,
    hasCredentials,
    enabled,
    loading,
    authenticate,
    saveCredentials,
    removeCredentials,
    toggleBiometry,
  };
};

