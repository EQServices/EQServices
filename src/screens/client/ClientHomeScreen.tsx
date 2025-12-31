import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { Text, Card, FAB, Chip, Button, Avatar, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';
import { AppLogo } from '../../components/AppLogo';
import { SkeletonCardList } from '../../components/SkeletonCard';
import { withCache, CacheStrategy } from '../../services/offlineCache';

const CONFIRM_LOGOUT_MESSAGE =
  'Tem a certeza de que pretende terminar sessão? Poderá voltar a entrar quando quiser.';

export const ClientHomeScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Na web, usar confirm do navegador
      const confirmed = (globalThis as any).window?.confirm(CONFIRM_LOGOUT_MESSAGE);
      if (!confirmed) return;
      await performLogout();
    } else {
      // No mobile, usar Alert
      Alert.alert('Terminar sessão', CONFIRM_LOGOUT_MESSAGE, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Terminar sessão',
          style: 'destructive',
          onPress: async () => {
            await performLogout();
          },
        },
      ]);
    }
  };

  const performLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Erro ao terminar sessão:', err);
      const errorMessage = 'Não foi possível terminar a sessão. Tente novamente.';
      if (Platform.OS === 'web') {
        (globalThis as any).window?.alert(errorMessage);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    }
  };

  const mapServiceRequest = useCallback((row: any): ServiceRequest => {
    return {
      id: row.id,
      clientId: row.client_id,
      categories: row.categories || (row.category ? [row.category] : []),
      category: row.categories?.[0] || row.category,
      title: row.title,
      description: row.description,
      location: row.location,
      budget: row.budget ?? undefined,
      photos: row.photos ?? undefined,
      status: row.status,
      completedAt: row.completed_at ?? null,
      createdAt: row.created_at,
      referenceNumber: row.reference_number ?? undefined,
    };
  }, []);

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const cachedRequests = await withCache<ServiceRequest[]>(
        `client_requests_${user.id}`,
        async () => {
          const { data, error } = await supabase
            .from('service_requests')
            .select('*')
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          return (data || []).map(mapServiceRequest);
        },
        CacheStrategy.NETWORK_FIRST,
        2 * 60 * 1000, // Cache por 2 minutos
      );
      
      setRequests(cachedRequests);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [mapServiceRequest, user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Recarregar quando voltar para esta tela (após excluir pedido, por exemplo)
  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Buscar service_requests do cliente primeiro
      const { data: serviceRequests } = await supabase
        .from('service_requests')
        .select('id')
        .eq('client_id', user.id);

      if (!serviceRequests || serviceRequests.length === 0) {
        setUnreadCount(0);
        return;
      }

      const serviceRequestIds = serviceRequests.map((sr) => sr.id);

      // Contar propostas pendentes não visualizadas
      const { count: proposalsCount } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .in('service_request_id', serviceRequestIds)
        .eq('status', 'pending');

      // Contar mensagens não lidas em conversas do cliente
      const { data: conversations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
        .eq('role', 'client');

      let messagesCount = 0;
      if (conversations && conversations.length > 0) {
        const conversationIds = conversations.map((c) => c.conversation_id);
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', user.id)
          .not('read_by', 'cs', `{${user.id}}`);

        messagesCount = count || 0;
      }

      setUnreadCount((proposalsCount || 0) + messagesCount);
    } catch (error) {
      console.error('Erro ao carregar contagem de não lidas:', error);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadRequests();
      loadUnreadCount();
    }, [loadRequests, loadUnreadCount])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'active':
        return colors.info;
      case 'completed':
        return colors.success;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('client.requestDetail.status.pending');
      case 'active':
        return t('client.requestDetail.status.active');
      case 'completed':
        return t('client.requestDetail.status.completed');
      case 'cancelled':
        return t('client.requestDetail.status.cancelled');
      default:
        return status;
    }
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('ServiceRequestDetail', { requestId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.referenceNumber && (
              <Chip mode="outlined" style={styles.referenceChip} textStyle={styles.referenceChipText}>
                {item.referenceNumber}
              </Chip>
            )}
          </View>
          <Chip
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: colors.textLight }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('pt-PT')}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopBar}>
          <View style={styles.logoWrapper}>
            <AppLogo size={150} withBackground />
          </View>
          <View style={styles.headerRightButtons}>
            <View style={styles.notificationButtonContainer}>
              <IconButton
                icon="bell"
                iconColor={colors.textLight}
                size={24}
                onPress={() => navigation.navigate('Notifications')}
                style={styles.notificationButton}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </View>
            <IconButton
              icon="logout"
              iconColor={colors.textLight}
              size={24}
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
        </View>
        <View style={styles.headerTop}>
          {user?.avatarUrl ? (
            <Avatar.Image size={64} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Icon size={64} icon="account" />
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.welcomeText}>{t('common.hello')}, {user?.name}!</Text>
            <Text style={styles.subtitle}>{t('client.home.title')}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ClientDashboard')}
            textColor={colors.textLight}
            style={styles.headerButton}
          >
            Ver dashboard
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Help')}
            textColor={colors.textLight}
            style={styles.headerButton}
            icon="help-circle"
          >
            Ajuda
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ClientOrderHistory')}
            textColor={colors.textLight}
            style={styles.headerButton}
          >
            Histórico de pedidos
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditProfile')}
            textColor={colors.textLight}
            style={styles.headerButton}
          >
            Editar perfil
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Notifications')}
            textColor={colors.textLight}
            style={styles.headerButton}
          >
            Preferências de notificações
          </Button>
        </View>
      </View>

      {loading ? (
        <SkeletonCardList />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Avatar.Icon size={72} icon="clipboard-text-outline" style={styles.emptyIcon} />
          <Text style={styles.emptyText}>{t('client.home.empty')}</Text>
          <Text style={styles.emptySubtext}>
            {t('client.home.emptySubtext')}
          </Text>
          <Button mode="contained" icon="plus" onPress={() => navigation.navigate('NewServiceRequest')}>
            {t('client.home.createRequest')}
          </Button>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor={colors.primary} />
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewServiceRequest')}
        color={colors.textLight}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoWrapper: {
    alignItems: 'flex-start',
    flex: 1,
    maxWidth: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  referenceChip: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  referenceChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    backgroundColor: colors.secondary,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  actionButtons: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerButton: {
    borderColor: colors.textLight,
  },
  logoutButton: {
    margin: 0,
  },
});

