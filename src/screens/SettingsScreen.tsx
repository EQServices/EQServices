import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Platform, Alert } from 'react-native';
import { Card, Text, Switch, Button, Divider, List, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { useBiometry } from '../hooks/useBiometry';
import { useNetwork } from '../hooks/useNetwork';
import { clearAllCache, getCacheSize } from '../services/offlineCache';
import { getSyncQueueStats, clearSyncQueue } from '../services/syncQueue';
import { formatNetworkType } from '../services/network';

export const SettingsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const {
    available: biometryAvailable,
    biometryType,
    hasCredentials,
    enabled: biometryEnabled,
    loading: biometryLoading,
    toggleBiometry,
    removeCredentials,
  } = useBiometry();
  const { isConnected, networkState } = useNetwork();
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [syncQueueStats, setSyncQueueStats] = useState<{ total: number; byPriority: Record<number, number> } | null>(null);
  const [loadingCache, setLoadingCache] = useState(false);
  const [loadingSync, setLoadingSync] = useState(false);

  useEffect(() => {
    loadCacheInfo();
    loadSyncStats();
  }, []);

  const loadCacheInfo = async () => {
    try {
      setLoadingCache(true);
      const size = await getCacheSize();
      setCacheSize(size);
    } catch (error) {
      console.error('Erro ao carregar informações do cache:', error);
    } finally {
      setLoadingCache(false);
    }
  };

  const loadSyncStats = async () => {
    try {
      setLoadingSync(true);
      const stats = await getSyncQueueStats();
      setSyncQueueStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de sincronização:', error);
    } finally {
      setLoadingSync(false);
    }
  };

  const handleToggleBiometry = async (enabled: boolean) => {
    const success = await toggleBiometry(enabled);
    if (!success) {
      Alert.alert('Erro', 'Não foi possível alterar a configuração de biometria.');
    }
  };

  const handleRemoveCredentials = async () => {
    Alert.alert(
      'Remover credenciais',
      'Tem certeza que deseja remover suas credenciais salvas? Você precisará fazer login manualmente na próxima vez.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const success = await removeCredentials();
            if (success) {
              Alert.alert('Sucesso', 'Credenciais removidas com sucesso.');
            } else {
              Alert.alert('Erro', 'Não foi possível remover as credenciais.');
            }
          },
        },
      ],
    );
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Limpar cache',
      'Tem certeza que deseja limpar todo o cache? Isso pode melhorar o desempenho, mas você precisará baixar os dados novamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            const success = await clearAllCache();
            if (success) {
              Alert.alert('Sucesso', 'Cache limpo com sucesso.');
              await loadCacheInfo();
            } else {
              Alert.alert('Erro', 'Não foi possível limpar o cache.');
            }
          },
        },
      ],
    );
  };

  const handleClearSyncQueue = async () => {
    Alert.alert(
      'Limpar fila de sincronização',
      'Tem certeza que deseja limpar a fila de sincronização? Todas as ações pendentes serão perdidas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            const success = await clearSyncQueue();
            if (success) {
              Alert.alert('Sucesso', 'Fila de sincronização limpa.');
              await loadSyncStats();
            } else {
              Alert.alert('Erro', 'Não foi possível limpar a fila.');
            }
          },
        },
      ],
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Seção de Biometria */}
      {Platform.OS !== 'web' && biometryAvailable && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Autenticação Biométrica</Text>
            <Text style={styles.sectionSubtitle}>
              Use {biometryType.name} para fazer login rapidamente
            </Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Habilitar {biometryType.name}</Text>
                <Text style={styles.settingDescription}>
                  Permite login rápido usando {biometryType.name.toLowerCase()}
                </Text>
              </View>
              {biometryLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={biometryEnabled}
                  onValueChange={handleToggleBiometry}
                  color={colors.primary}
                />
              )}
            </View>

            {hasCredentials && (
              <>
                <Divider style={styles.divider} />
                <List.Item
                  title="Remover credenciais salvas"
                  description="Remove suas credenciais salvas do dispositivo"
                  left={(props) => <List.Icon {...props} icon="key-remove" />}
                  onPress={handleRemoveCredentials}
                  titleStyle={styles.dangerText}
                />
              </>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Suas credenciais são armazenadas de forma segura e criptografada no dispositivo.
                Apenas você pode acessá-las usando {biometryType.name.toLowerCase()}.
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Seção de Modo Offline */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Modo Offline</Text>
          <Text style={styles.sectionSubtitle}>
            Gerencie cache e sincronização de dados
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Status da conexão</Text>
              <Text style={styles.settingDescription}>
                {isConnected
                  ? `Conectado via ${networkState?.type ? formatNetworkType(networkState.type) : 'Internet'}`
                  : 'Sem conexão com a internet'}
              </Text>
            </View>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: isConnected ? colors.success : colors.error },
              ]}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Tamanho do cache</Text>
              <Text style={styles.settingDescription}>
                {loadingCache ? 'Carregando...' : formatBytes(cacheSize)}
              </Text>
            </View>
            <Button mode="outlined" onPress={handleClearCache} compact>
              Limpar
            </Button>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Ações pendentes</Text>
              <Text style={styles.settingDescription}>
                {loadingSync
                  ? 'Carregando...'
                  : syncQueueStats
                    ? `${syncQueueStats.total} ação(ões) aguardando sincronização`
                    : 'Nenhuma ação pendente'}
              </Text>
            </View>
            {syncQueueStats && syncQueueStats.total > 0 && (
              <Button mode="outlined" onPress={handleClearSyncQueue} compact textColor={colors.error}>
                Limpar
              </Button>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💾 O cache permite usar o app mesmo sem internet. Os dados são sincronizados automaticamente quando a conexão é restabelecida.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Seção de Informações */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Informações</Text>
          <List.Item
            title="Versão do app"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Tipo de conta"
            description={user?.userType === 'client' ? 'Cliente' : 'Profissional'}
            left={(props) => <List.Icon {...props} icon="account" />}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: 12,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dangerText: {
    color: colors.error,
  },
});

