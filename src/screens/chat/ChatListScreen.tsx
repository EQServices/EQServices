import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { List, Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation } from '../../types';
import { fetchConversations } from '../../services/chat';
import { colors } from '../../theme/colors';

interface ChatListScreenProps {
  navigation: any;
  route: {
    params?: {
      conversationRoute?: string;
    };
  };
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const conversationRouteName = route.params?.conversationRoute ?? 'ChatConversation';

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await fetchConversations(user.id);
      setConversations(result);
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
    const otherParticipant = item.participants.find((participant) => participant.userId !== user?.id);
    const title = otherParticipant?.displayName ?? 'Conversa';
    const lastMessagePreview = item.lastMessage
      ? item.lastMessage.content?.trim()
          ? item.lastMessage.content.trim()
          : item.lastMessage.mediaUrl
            ? '📷 Foto'
            : 'Nova mensagem'
      : null;
    const prefix = item.lastMessage ? (item.lastMessage.senderId === user?.id ? 'Você:' : 'Eles:') : '';
    const subtitle = lastMessagePreview ? `${prefix} ${lastMessagePreview}` : 'Sem mensagens';

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
        <Text style={styles.emptyTitle}>Sem conversas ainda</Text>
        <Text style={styles.emptySubtitle}>Aceite uma proposta ou inicie uma nova conversa a partir de um pedido.</Text>
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


