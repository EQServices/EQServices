import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

/**
 * Solicita permissão de localização ao usuário
 * @returns Status da permissão
 */
export const requestLocationPermission = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    return {
      granted: status === Location.PermissionStatus.GRANTED,
      canAskAgain: canAskAgain ?? true,
      status,
    };
  } catch (error) {
    console.error('Erro ao solicitar permissão de localização:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
};

/**
 * Verifica se a permissão de localização foi concedida
 */
export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === Location.PermissionStatus.GRANTED;
  } catch (error) {
    console.error('Erro ao verificar permissão de localização:', error);
    return false;
  }
};

/**
 * Verifica se os serviços de localização estão habilitados
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    return enabled;
  } catch (error) {
    console.error('Erro ao verificar se localização está habilitada:', error);
    return false;
  }
};

/**
 * Obtém a localização atual do dispositivo
 * @param options Opções de precisão e timeout
 * @returns Coordenadas ou null se não conseguir obter
 */
export const getCurrentLocation = async (
  options?: {
    accuracy?: Location.Accuracy;
    timeout?: number;
  },
): Promise<Coordinates | null> => {
  try {
    // Verificar se tem permissão
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const permissionResult = await requestLocationPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permissão Necessária',
          'Precisamos da sua localização para encontrar profissionais próximos. Por favor, ative a permissão nas configurações.',
        );
        return null;
      }
    }

    // Verificar se serviços de localização estão habilitados
    const servicesEnabled = await isLocationEnabled();
    if (!servicesEnabled) {
      Alert.alert(
        'Localização Desativada',
        'Por favor, ative os serviços de localização nas configurações do dispositivo para usar esta funcionalidade.',
      );
      return null;
    }

    // Obter localização
    const location = await Location.getCurrentPositionAsync({
      accuracy: options?.accuracy ?? Location.Accuracy.Balanced,
      timeout: options?.timeout ?? 10000,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error: any) {
    console.error('Erro ao obter localização:', error);
    
    if (error.code === 'E_LOCATION_TIMEOUT') {
      Alert.alert('Timeout', 'Não foi possível obter sua localização. Tente novamente.');
    } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
      Alert.alert('Indisponível', 'Os serviços de localização estão indisponíveis no momento.');
    } else {
      Alert.alert('Erro', 'Não foi possível obter sua localização. Verifique as configurações do dispositivo.');
    }
    
    return null;
  }
};

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param lat1 Latitude do primeiro ponto
 * @param lon1 Longitude do primeiro ponto
 * @param lat2 Latitude do segundo ponto
 * @param lon2 Longitude do segundo ponto
 * @returns Distância em quilômetros
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
};

/**
 * Converte graus para radianos
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Formata a distância para exibição
 * @param distanceKm Distância em quilômetros
 * @returns String formatada (ex: "2.5 km" ou "500 m")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Obtém coordenadas aproximadas de uma freguesia/distrito usando geocodificação reversa
 * Nota: Esta função requer uma API de geocodificação (ex: Google Maps, OpenStreetMap)
 * Por enquanto, retorna null - pode ser implementada depois
 */
export const getCoordinatesFromLocation = async (
  locationLabel: string,
): Promise<Coordinates | null> => {
  // TODO: Implementar geocodificação usando uma API externa
  // Por enquanto, retorna null
  console.warn('Geocodificação não implementada ainda');
  return null;
};

