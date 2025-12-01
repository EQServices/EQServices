import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock do AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock do Expo modules
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  Accuracy: {
    Balanced: 'balanced',
    High: 'high',
    Low: 'low',
  },
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FACIAL_RECOGNITION: 1,
    FINGERPRINT: 2,
    IRIS: 3,
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
  NetInfoStateType: {
    wifi: 'wifi',
    cellular: 'cellular',
    ethernet: 'ethernet',
    bluetooth: 'bluetooth',
    vpn: 'vpn',
    none: 'none',
    unknown: 'unknown',
  },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `elastiquality://${path}`),
  parse: jest.fn(),
  getInitialURLAsync: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  if (RN && RN.Alert) {
    RN.Alert.alert = jest.fn();
  }
  if (RN && RN.Platform) {
    RN.Platform.OS = 'ios';
  }
  return RN;
});

// Mock do Supabase
jest.mock('./src/config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(),
          limit: jest.fn(),
        })),
        in: jest.fn(),
        not: jest.fn(),
        contains: jest.fn(),
        order: jest.fn(),
        limit: jest.fn(),
      })),
      insert: jest.fn(),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      delete: jest.fn(),
      rpc: jest.fn(),
    })),
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn(),
      })),
    },
  },
}));

// Silence console warnings/errors in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

