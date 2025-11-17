import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  details: NetInfoState['details'];
}

/**
 * Verifica se o dispositivo está online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Erro ao verificar conexão:', error);
    return false;
  }
};

/**
 * Obtém o estado completo da rede
 */
export const getNetworkState = async (): Promise<NetworkState> => {
  try {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? null,
      type: state.type,
      details: state.details,
    };
  } catch (error) {
    console.error('Erro ao obter estado da rede:', error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: NetInfoStateType.unknown,
      details: null,
    };
  }
};

/**
 * Obtém o tipo de conexão (WiFi, 4G, etc.)
 */
export const getNetworkType = async (): Promise<string> => {
  try {
    const state = await NetInfo.fetch();
    return state.type || 'unknown';
  } catch (error) {
    console.error('Erro ao obter tipo de rede:', error);
    return 'unknown';
  }
};

/**
 * Formata o tipo de conexão para exibição
 */
export const formatNetworkType = (type: NetInfoStateType): string => {
  switch (type) {
    case NetInfoStateType.wifi:
      return 'WiFi';
    case NetInfoStateType.cellular:
      return 'Dados móveis';
    case NetInfoStateType.ethernet:
      return 'Ethernet';
    case NetInfoStateType.bluetooth:
      return 'Bluetooth';
    case NetInfoStateType.wimax:
      return 'WiMAX';
    case NetInfoStateType.none:
      return 'Sem conexão';
    case NetInfoStateType.unknown:
    default:
      return 'Desconhecido';
  }
};

/**
 * Escuta mudanças no estado da rede
 */
export const subscribeToNetworkChanges = (
  callback: (state: NetworkState) => void,
): () => void => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    callback({
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? null,
      type: state.type,
      details: state.details,
    });
  });

  return unsubscribe;
};

/**
 * Verifica se está usando dados móveis (pode ser caro)
 */
export const isUsingMobileData = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.type === NetInfoStateType.cellular;
  } catch (error) {
    return false;
  }
};

/**
 * Verifica se está usando WiFi
 */
export const isUsingWiFi = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.type === NetInfoStateType.wifi;
  } catch (error) {
    return false;
  }
};

