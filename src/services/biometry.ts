import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';

export interface BiometryType {
  available: boolean;
  type: LocalAuthentication.AuthenticationType | null;
  name: string;
}

export interface SavedCredentials {
  email: string;
  password: string;
}

const CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRY_ENABLED_KEY = 'biometry_enabled';

/**
 * Verifica se a biometria está disponível no dispositivo
 */
export const isBiometryAvailable = async (): Promise<boolean> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      return false;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade de biometria:', error);
    return false;
  }
};

/**
 * Obtém o tipo de biometria disponível
 */
export const getBiometryType = async (): Promise<BiometryType> => {
  try {
    const available = await isBiometryAvailable();
    if (!available) {
      return {
        available: false,
        type: null,
        name: 'Não disponível',
      };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    let typeName = 'Biometria';
    let authType: LocalAuthentication.AuthenticationType | null = null;

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      typeName = Platform.OS === 'ios' ? 'Face ID' : 'Reconhecimento Facial';
      authType = LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      typeName = Platform.OS === 'ios' ? 'Touch ID' : 'Impressão Digital';
      authType = LocalAuthentication.AuthenticationType.FINGERPRINT;
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      typeName = 'Íris';
      authType = LocalAuthentication.AuthenticationType.IRIS;
    }

    return {
      available: true,
      type: authType,
      name: typeName,
    };
  } catch (error) {
    console.error('Erro ao obter tipo de biometria:', error);
    return {
      available: false,
      type: null,
      name: 'Não disponível',
    };
  }
};

/**
 * Solicita autenticação biométrica
 */
export const authenticateWithBiometry = async (
  reason: string = 'Autentique-se para continuar',
): Promise<boolean> => {
  try {
    const available = await isBiometryAvailable();
    if (!available) {
      Alert.alert(
        'Biometria não disponível',
        'A autenticação biométrica não está disponível neste dispositivo ou não está configurada.',
      );
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
      fallbackLabel: 'Usar senha',
    });

    return result.success;
  } catch (error: any) {
    console.error('Erro na autenticação biométrica:', error);
    
    if (error.code === 'USER_CANCEL') {
      return false;
    }

    Alert.alert('Erro', 'Não foi possível autenticar. Tente novamente.');
    return false;
  }
};

/**
 * Salva credenciais de forma segura
 */
export const saveCredentialsSecurely = async (
  email: string,
  password: string,
): Promise<boolean> => {
  try {
    // Criptografar credenciais antes de salvar
    const credentials: SavedCredentials = {
      email,
      password,
    };

    const credentialsJson = JSON.stringify(credentials);
    await SecureStore.setItemAsync(CREDENTIALS_KEY, credentialsJson);
    return true;
  } catch (error) {
    console.error('Erro ao salvar credenciais:', error);
    return false;
  }
};

/**
 * Recupera credenciais salvas
 */
export const getSavedCredentials = async (): Promise<SavedCredentials | null> => {
  try {
    const credentialsJson = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    if (!credentialsJson) {
      return null;
    }

    const credentials: SavedCredentials = JSON.parse(credentialsJson);
    return credentials;
  } catch (error) {
    console.error('Erro ao recuperar credenciais:', error);
    return null;
  }
};

/**
 * Remove credenciais salvas
 */
export const clearSavedCredentials = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao remover credenciais:', error);
    return false;
  }
};

/**
 * Verifica se há credenciais salvas
 */
export const hasSavedCredentials = async (): Promise<boolean> => {
  try {
    const credentials = await getSavedCredentials();
    return credentials !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Habilita ou desabilita biometria
 */
export const setBiometryEnabled = async (enabled: boolean): Promise<boolean> => {
  try {
    await SecureStore.setItemAsync(BIOMETRY_ENABLED_KEY, enabled ? 'true' : 'false');
    return true;
  } catch (error) {
    console.error('Erro ao configurar biometria:', error);
    return false;
  }
};

/**
 * Verifica se biometria está habilitada
 */
export const isBiometryEnabled = async (): Promise<boolean> => {
  try {
    const value = await SecureStore.getItemAsync(BIOMETRY_ENABLED_KEY);
    return value === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Login completo com biometria
 * Autentica com biometria e retorna as credenciais salvas
 */
export const loginWithBiometry = async (
  reason: string = 'Autentique-se para fazer login',
): Promise<SavedCredentials | null> => {
  try {
    // Verificar se há credenciais salvas
    const hasCredentials = await hasSavedCredentials();
    if (!hasCredentials) {
      Alert.alert('Sem credenciais', 'Nenhuma credencial salva encontrada. Faça login normalmente primeiro.');
      return null;
    }

    // Verificar se biometria está habilitada
    const enabled = await isBiometryEnabled();
    if (!enabled) {
      return null;
    }

    // Autenticar com biometria
    const authenticated = await authenticateWithBiometry(reason);
    if (!authenticated) {
      return null;
    }

    // Recuperar credenciais
    const credentials = await getSavedCredentials();
    return credentials;
  } catch (error) {
    console.error('Erro no login biométrico:', error);
    return null;
  }
};

