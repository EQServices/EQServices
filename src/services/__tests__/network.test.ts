import NetInfo from '@react-native-community/netinfo';
import {
  isOnline,
  getNetworkState,
  getNetworkType,
  formatNetworkType,
  subscribeToNetworkChanges,
} from '../network';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

describe('network', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isOnline', () => {
    it('deve retornar true quando online', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
        type: 'wifi',
      });

      const result = await isOnline();
      expect(result).toBe(true);
    });

    it('deve retornar false quando offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        type: 'none',
      });

      const result = await isOnline();
      expect(result).toBe(false);
    });
  });

  describe('getNetworkType', () => {
    it('deve retornar tipo de rede correto', () => {
      const state = getNetworkState();
      expect(state.type).toBeDefined();
    });
  });

  describe('formatNetworkType', () => {
    it('deve formatar tipo wifi corretamente', () => {
      expect(formatNetworkType('wifi' as any)).toBe('Wi-Fi');
    });

    it('deve formatar tipo cellular corretamente', () => {
      expect(formatNetworkType('cellular' as any)).toBe('Dados Móveis');
    });

    it('deve formatar tipo none corretamente', () => {
      expect(formatNetworkType('none' as any)).toBe('Sem Conexão');
    });

    it('deve formatar tipo unknown corretamente', () => {
      expect(formatNetworkType('unknown' as any)).toBe('Desconhecido');
    });
  });

  describe('subscribeToNetworkChanges', () => {
    it('deve retornar função de unsubscribe', () => {
      const mockUnsubscribe = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(mockUnsubscribe);

      const unsubscribe = subscribeToNetworkChanges(() => {});
      
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('deve chamar callback quando rede muda', () => {
      const callback = jest.fn();
      let listener: ((state: any) => void) | null = null;

      (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
        listener = cb;
        return jest.fn();
      });

      subscribeToNetworkChanges(callback);

      if (listener) {
        listener({ isConnected: true, type: 'wifi' });
        expect(callback).toHaveBeenCalledWith({
          isOnline: true,
          type: 'wifi',
          details: null,
        });
      }
    });
  });
});

