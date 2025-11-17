import { useState, useEffect } from 'react';
import { NetworkState, isOnline, getNetworkState, subscribeToNetworkChanges } from '../services/network';

export interface UseNetworkReturn {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  networkState: NetworkState | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook para gerenciar estado da rede
 */
export const useNetwork = (): UseNetworkReturn => {
  const [networkState, setNetworkState] = useState<NetworkState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const state = await getNetworkState();
      setNetworkState(state);
    } catch (error) {
      console.error('Erro ao atualizar estado da rede:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Obter estado inicial
    refresh();

    // Escutar mudanças
    const unsubscribe = subscribeToNetworkChanges((state) => {
      setNetworkState(state);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected: networkState?.isConnected ?? false,
    isInternetReachable: networkState?.isInternetReachable ?? null,
    networkState,
    loading,
    refresh,
  };
};

