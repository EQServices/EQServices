import * as Location from 'expo-location';
import { Alert } from 'react-native';
import {
  calculateDistance,
  formatDistance,
  requestLocationPermission,
  checkLocationPermission,
  isLocationEnabled,
  getCurrentLocation,
} from '../geolocation';

// Mock dos módulos
jest.mock('expo-location');
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('geolocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDistance', () => {
    it('deve calcular distância corretamente entre duas coordenadas', () => {
      // Lisboa para Porto (aproximadamente 313 km)
      const lisboa = { lat: 38.7223, lon: -9.1393 };
      const porto = { lat: 41.1579, lon: -8.6291 };

      const distance = calculateDistance(lisboa.lat, lisboa.lon, porto.lat, porto.lon);
      
      // Deve estar próximo de 313 km (com margem de erro de 10%)
      expect(distance).toBeGreaterThan(280);
      expect(distance).toBeLessThan(350);
    });

    it('deve retornar 0 para coordenadas idênticas', () => {
      const distance = calculateDistance(38.7223, -9.1393, 38.7223, -9.1393);
      expect(distance).toBe(0);
    });

    it('deve calcular distância pequena corretamente', () => {
      // Distância pequena (menos de 1 km)
      const distance = calculateDistance(38.7223, -9.1393, 38.7233, -9.1393);
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(1);
    });
  });

  describe('formatDistance', () => {
    it('deve formatar distância menor que 1 km em metros', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.1)).toBe('100 m');
    });

    it('deve formatar distância maior que 1 km em quilômetros', () => {
      expect(formatDistance(2.5)).toBe('2.5 km');
      expect(formatDistance(10)).toBe('10.0 km');
      expect(formatDistance(100.7)).toBe('100.7 km');
    });
  });

  describe('requestLocationPermission', () => {
    it('deve retornar granted quando permissão é concedida', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
        canAskAgain: true,
      });

      const result = await requestLocationPermission();

      expect(result.granted).toBe(true);
      expect(result.status).toBe(Location.PermissionStatus.GRANTED);
    });

    it('deve retornar denied quando permissão é negada', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
        canAskAgain: false,
      });

      const result = await requestLocationPermission();

      expect(result.granted).toBe(false);
      expect(result.status).toBe(Location.PermissionStatus.DENIED);
    });

    it('deve tratar erros corretamente', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error'),
      );

      const result = await requestLocationPermission();

      expect(result.granted).toBe(false);
      expect(result.status).toBe(Location.PermissionStatus.DENIED);
    });
  });

  describe('checkLocationPermission', () => {
    it('deve retornar true quando permissão está concedida', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      const result = await checkLocationPermission();
      expect(result).toBe(true);
    });

    it('deve retornar false quando permissão não está concedida', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
      });

      const result = await checkLocationPermission();
      expect(result).toBe(false);
    });
  });

  describe('isLocationEnabled', () => {
    it('deve retornar true quando serviços estão habilitados', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);

      const result = await isLocationEnabled();
      expect(result).toBe(true);
    });

    it('deve retornar false quando serviços estão desabilitados', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

      const result = await isLocationEnabled();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('deve retornar coordenadas quando tudo está ok', async () => {
      (checkLocationPermission as any) = jest.fn().mockResolvedValue(true);
      (isLocationEnabled as any) = jest.fn().mockResolvedValue(true);
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: 38.7223,
          longitude: -9.1393,
        },
      });

      const result = await getCurrentLocation();

      expect(result).toEqual({
        latitude: 38.7223,
        longitude: -9.1393,
      });
    });

    it('deve retornar null quando não tem permissão', async () => {
      (checkLocationPermission as any) = jest.fn().mockResolvedValue(false);
      (requestLocationPermission as any) = jest.fn().mockResolvedValue({
        granted: false,
      });

      const result = await getCurrentLocation();

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('deve retornar null quando serviços estão desabilitados', async () => {
      (checkLocationPermission as any) = jest.fn().mockResolvedValue(true);
      (isLocationEnabled as any) = jest.fn().mockResolvedValue(false);

      const result = await getCurrentLocation();

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('deve tratar timeout corretamente', async () => {
      (checkLocationPermission as any) = jest.fn().mockResolvedValue(true);
      (isLocationEnabled as any) = jest.fn().mockResolvedValue(true);
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue({
        code: 'E_LOCATION_TIMEOUT',
      });

      const result = await getCurrentLocation();

      expect(result).toBeNull();
      expect(Alert.alert).toHaveBeenCalledWith('Timeout', expect.any(String));
    });
  });
});

