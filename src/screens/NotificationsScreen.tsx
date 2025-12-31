import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { ActivityIndicator, Card, List, Switch, Text, Chip, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { NotificationItem } from '../types';

type NotificationPreferences = {
  chat: boolean;
  leads: boolean;
  proposals: boolean;
};

const DEFAULT_PREFERENCES: NotificationPreferences = {
  chat: true,
  leads: true,
  proposals: true,
};

export const NotificationsScreen: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');

  const loadPreferences = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('notification_preferences')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data?.notification_preferences) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...data.notification_preferences,
        });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (err: any) {
      console.error('Erro ao carregar preferências de notificação:', err);
      setError(err.message || t('notifications.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  const persistPreferences = async (next: NotificationPreferences) => {
    if (!user?.id) return;
    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('users')
        .update({ notification_preferences: next })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPreferences(next);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao atualizar preferências de notificação:', err);
      setError(err.message || t('notifications.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    const next = { ...preferences, [key]: !preferences[key] };
    persistPreferences(next);
  };

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoadingNotifications(true);
      
      // Buscar notificações da tabela notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const allNotifications: NotificationItem[] = [];

      // Adicionar notificações da tabela
      if (!notificationsError && notificationsData) {
        const mapped = notificationsData.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          type: item.type || 'info',
          title: item.title || 'Notificação',
          body: item.body || 'Sem descrição',
          data: item.data || {},
          readAt: item.read_at ?? undefined,
          createdAt: item.created_at,
        }));
        allNotifications.push(...mapped);
      } else if (notificationsError && notificationsError.code !== '42P01') {
        console.error('Erro ao buscar notificações:', notificationsError);
      }

      // Se não houver notificações na tabela, criar notificações dinâmicas baseadas em propostas e mensagens
      if (allNotifications.length === 0) {
        // Buscar propostas pendentes
        const { data: serviceRequests } = await supabase
          .from('service_requests')
          .select('id, title')
          .eq('client_id', user.id);

        if (serviceRequests && serviceRequests.length > 0) {
          const serviceRequestIds = serviceRequests.map((sr) => sr.id);
          
          // Buscar propostas pendentes
          const { data: proposals } = await supabase
            .from('proposals')
            .select('id, service_request_id, price, created_at, professional_id, professionals!proposals_professional_id_fkey(id, name, users(name))')
            .in('service_request_id', serviceRequestIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(10);

          if (proposals && proposals.length > 0) {
            for (const proposal of proposals) {
              const serviceRequest = serviceRequests.find((sr) => sr.id === proposal.service_request_id);
              // Tentar diferentes caminhos para obter o nome do profissional
              const professionalName = 
                (proposal.professionals as any)?.users?.name ||
                (proposal.professionals as any)?.name ||
                'Profissional';
              
              allNotifications.push({
                id: `proposal_${proposal.id}`,
                userId: user.id,
                type: 'proposals',
                title: 'Nova proposta recebida',
                body: `${professionalName} enviou uma proposta de €${proposal.price?.toFixed(2) || '0.00'} para "${serviceRequest?.title || 'seu pedido'}"`,
                data: {
                  serviceRequestId: proposal.service_request_id,
                  proposalId: proposal.id,
                },
                readAt: undefined,
                createdAt: proposal.created_at,
              });
            }
          }

          // Buscar mensagens não lidas
          const { data: conversations } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id)
            .eq('role', 'client');

          if (conversations && conversations.length > 0) {
            const conversationIds = conversations.map((c) => c.conversation_id);
            
            const { data: unreadMessages } = await supabase
              .from('messages')
              .select('id, conversation_id, content, created_at, sender_id, sender:sender_id (id, name)')
              .in('conversation_id', conversationIds)
              .neq('sender_id', user.id)
              .not('read_by', 'cs', `{${user.id}}`)
              .order('created_at', { ascending: false })
              .limit(10);

            if (unreadMessages && unreadMessages.length > 0) {
              for (const message of unreadMessages) {
                const senderName = (message.sender as any)?.name || 'Alguém';
                const contentPreview = message.content 
                  ? (message.content.length > 50 ? message.content.substring(0, 50) + '...' : message.content)
                  : 'Nova mensagem';
                
                allNotifications.push({
                  id: `message_${message.id}`,
                  userId: user.id,
                  type: 'chat',
                  title: `Nova mensagem de ${senderName}`,
                  body: contentPreview,
                  data: {
                    conversationId: message.conversation_id,
                    messageId: message.id,
                  },
                  readAt: undefined,
                  createdAt: message.created_at,
                });
              }
            }
          }
        }
      }

      // Ordenar todas as notificações por data
      allNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(allNotifications);
      
      // Log para debug
      console.log(`Carregadas ${allNotifications.length} notificações (${notificationsData?.length || 0} da tabela + ${allNotifications.length - (notificationsData?.length || 0)} dinâmicas)`);
    } catch (err: any) {
      console.error('Erro ao carregar notificações:', err);
      setError(err.message || 'Erro ao carregar notificações');
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch (err: any) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      await markAsRead(notification.id);
    }

    // Navegar baseado no tipo de notificação
    if (notification.data) {
      if (notification.data.conversationId && navigation) {
        const parent = navigation.getParent();
        if (parent?.navigate) {
          if (user?.userType === 'client') {
            parent.navigate('ClientChat', {
              screen: 'ChatConversation',
              params: { conversationId: notification.data.conversationId },
            });
          } else {
            parent.navigate('ProfessionalChat', {
              screen: 'ProChatConversation',
              params: { conversationId: notification.data.conversationId },
            });
          }
        }
      } else if (notification.data.serviceRequestId && navigation) {
        navigation.navigate('ServiceRequestDetail', { requestId: notification.data.serviceRequestId });
      }
    }
  };

  useEffect(() => {
    loadPreferences();
    if (activeTab === 'notifications') {
      loadNotifications();
    }
  }, [user?.id, activeTab]);

  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'notifications') {
        loadNotifications();
      }
    }, [loadNotifications, activeTab]),
  );

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            {t('notifications.list.title', 'Notificações')}
          </Text>
          {unreadCount > 0 && (
            <Chip style={styles.badgeChip} textStyle={styles.badgeText}>
              {unreadCount}
            </Chip>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'preferences' && styles.activeTab]}
          onPress={() => setActiveTab('preferences')}
        >
          <Text style={[styles.tabText, activeTab === 'preferences' && styles.activeTabText]}>
            {t('notifications.preferences', 'Preferências')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          activeTab === 'notifications' ? (
            <RefreshControl refreshing={loadingNotifications} onRefresh={loadNotifications} tintColor={colors.primary} />
          ) : undefined
        }
      >
        {activeTab === 'notifications' ? (
          <>
            {loadingNotifications ? (
              <ActivityIndicator animating color={colors.primary} style={styles.loader} />
            ) : notifications.length === 0 ? (
              <Card style={styles.card}>
                <Card.Content style={styles.emptyContent}>
                  <Text style={styles.emptyText}>{t('notifications.list.empty', 'Nenhuma notificação ainda')}</Text>
                  <Text style={styles.emptySubtext}>
                    {t('notifications.list.emptySubtext', 'Suas notificações aparecerão aqui.')}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  onPress={() => handleNotificationPress(notification)}
                  activeOpacity={0.7}
                >
                  <Card style={[styles.notificationCard, !notification.readAt && styles.unreadCard]}>
                    <Card.Content>
                      <View style={styles.notificationHeader}>
                        <View style={styles.notificationTitleRow}>
                          <Text style={styles.notificationTitle} numberOfLines={2}>
                            {notification.title || 'Notificação'}
                          </Text>
                          {!notification.readAt && <View style={styles.unreadDot} />}
                        </View>
                        {notification.type && (
                          <Chip 
                            mode="outlined" 
                            style={styles.typeChip}
                            textStyle={styles.typeChipText}
                          >
                            {notification.type}
                          </Chip>
                        )}
                      </View>
                      <Text style={styles.notificationBody} numberOfLines={3}>
                        {notification.body || 'Sem descrição disponível'}
                      </Text>
                      {notification.data && Object.keys(notification.data).length > 0 && (
                        <View style={styles.dataContainer}>
                          <Text style={styles.dataLabel}>Detalhes:</Text>
                          <Text style={styles.dataText} numberOfLines={2}>
                            {JSON.stringify(notification.data, null, 2)}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.notificationDate}>
                        {new Date(notification.createdAt).toLocaleString('pt-PT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.title}>{t('notifications.title')}</Text>
              <Text style={styles.subtitle}>{t('notifications.subtitle')}</Text>

              {loading ? (
                <ActivityIndicator animating color={colors.primary} style={styles.loader} />
              ) : (
                <>
                  <List.Section>
                    <List.Item
                      title={t('notifications.messages')}
                      description={t('notifications.messagesDesc')}
                      right={() => (
                        <Switch
                          value={preferences.chat}
                          disabled={saving}
                          onValueChange={() => togglePreference('chat')}
                        />
                      )}
                    />
                    <List.Item
                      title={t('notifications.leads')}
                      description={t('notifications.leadsDesc')}
                      right={() => (
                        <Switch
                          value={preferences.leads}
                          disabled={saving}
                          onValueChange={() => togglePreference('leads')}
                        />
                      )}
                    />
                    <List.Item
                      title={t('notifications.proposals')}
                      description={t('notifications.proposalsDesc')}
                      right={() => (
                        <Switch
                          value={preferences.proposals}
                          disabled={saving}
                          onValueChange={() => togglePreference('proposals')}
                        />
                      )}
                    />
                  </List.Section>

                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  {saving ? <Text style={styles.saving}>{t('common.loading')}</Text> : null}
                </>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  badgeChip: {
    height: 20,
    minWidth: 20,
    backgroundColor: colors.error,
  },
  badgeText: {
    fontSize: 10,
    color: colors.textLight,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 12,
  },
  notificationCard: {
    borderRadius: 16,
    elevation: 2,
    marginBottom: 12,
  },
  unreadCard: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  typeChip: {
    height: 24,
    backgroundColor: colors.surface,
  },
  typeChipText: {
    fontSize: 10,
    color: colors.primary,
  },
  dataContainer: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dataText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  loader: {
    marginVertical: 24,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
  },
  saving: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NotificationsScreen;

