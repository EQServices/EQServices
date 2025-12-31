import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { List, Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types';
import { fetchConversations } from '../../services/chat';
import { colors } from '../../theme/colors';
import { withCache, CacheStrategy } from '../../services/offlineCache';

interface ChatListScreenProps {
  navigation: any;
  route: {
    params?: {
      conversationRoute?: string;
    };
  };
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const conversationRouteName = route.params?.conversationRoute ?? 'ChatConversation';

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const cachedConversations = await withCache(
        `conversations_${user.id}`,
        async () => {
          return await fetchConversations(user.id);
        },
        CacheStrategy.NETWORK_FIRST,
        2 * 60 * 1000, // Cache por 2 minutos
      );
      setConversations(cachedConversations);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const renderItem = ({ item }: { item: Conversation }) => {
    // Priorizar título do pedido de serviço, depois nome do participante, depois "Conversa"
    const title = item.serviceRequestTitle 
      ?? item.participants.find((participant) => participant.userId !== user?.id)?.displayName 
      ?? t('chat.list.conversation');
    const lastMessagePreview = item.lastMessage
      ? item.lastMessage.content?.trim()
          ? item.lastMessage.content.trim()
          : item.lastMessage.mediaUrl
            ? t('chat.list.photo')
            : t('chat.list.newMessage')
      : null;
    const prefix = item.lastMessage ? (item.lastMessage.senderId === user?.id ? t('chat.list.you') : t('chat.list.them')) : '';
    const subtitle = lastMessagePreview ? `${prefix} ${lastMessagePreview}` : t('chat.list.noMessages');

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate(conversationRouteName, {
            conversationId: item.id,
            title,
          })
        }
      >
        <List.Item
          title={title}
          description={subtitle}
          left={(props) => <List.Icon {...props} icon="chat" />}
          right={(props) =>
            item.lastMessage ? (
              <Text style={styles.timestamp}>
                {new Date(item.lastMessage.createdAt).toLocaleTimeString('pt-PT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            ) : null
          }
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>{t('chat.list.empty')}</Text>
        <Text style={styles.emptySubtitle}>{t('chat.list.emptySubtext')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    alignSelf: 'center',
    marginRight: 12,
  },
});


