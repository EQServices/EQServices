import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Banner, Text } from 'react-native-paper';
import { useNetwork } from '../hooks/useNetwork';
import { formatNetworkType } from '../services/network';
import { colors } from '../theme/colors';

interface NetworkStatusProps {
  showWhenOnline?: boolean;
  position?: 'top' | 'bottom';
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  showWhenOnline = false,
  position = 'top',
}) => {
  const { isConnected, networkState, loading } = useNetwork();

  if (loading || !networkState) {
    return null;
  }

  // Mostrar apenas quando offline (ou quando online se showWhenOnline=true)
  if (!showWhenOnline && isConnected) {
    return null;
  }

  if (showWhenOnline && !isConnected) {
    return null;
  }

  const networkType = networkState.type
    ? formatNetworkType(networkState.type)
    : 'Desconhecido';

  return (
    <Banner
      visible={true}
      actions={[]}
      icon={isConnected ? 'wifi' : 'wifi-off'}
      style={[
        styles.banner,
        position === 'top' ? styles.bannerTop : styles.bannerBottom,
      ]}
      contentStyle={styles.bannerContent}
    >
      <View style={styles.content}>
        <Text style={styles.text}>
          {isConnected
            ? `Conectado via ${networkType}`
            : 'Sem conexão com a internet'}
        </Text>
        {!isConnected && (
          <Text style={styles.subtext}>
            Algumas funcionalidades podem estar limitadas. Os dados serão sincronizados quando a conexão for restabelecida.
          </Text>
        )}
      </View>
    </Banner>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.surface,
    zIndex: 1000,
  },
  bannerTop: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
  },
  bannerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

