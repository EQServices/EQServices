import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Text, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import {
  ensureConversation,
  fetchConversation,
  fetchMessages,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
} from '../../services/chat';
import { colors } from '../../theme/colors';
import { Message } from '../../types';
import { notifyMessage } from '../../services/notifications';
import { uploadChatImage } from '../../services/storage';

interface ChatConversationScreenProps {
  navigation: any;
  route: {
    params: {
      conversationId?: string;
      serviceRequestId?: string;
      clientId?: string;
      professionalId?: string;
      title?: string;
    };
  };
}

export const ChatConversationScreen: React.FC<ChatConversationScreenProps> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(route.params.conversationId ?? null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<RNTextInput>(null);

  useLayoutEffect(() => {
    if (route.params?.title) {
      navigation.setOptions({ title: route.params.title });
    }
  }, [navigation, route.params?.title]);

  useEffect(() => {
    const setupConversation = async () => {
      try {
        setLoading(true);

        if (!conversationId && route.params.serviceRequestId && route.params.clientId && route.params.professionalId) {
          const id = await ensureConversation(
            route.params.serviceRequestId,
            route.params.clientId,
            route.params.professionalId,
          );
          setConversationId(id);
        }
      } catch (err) {
        console.error('Erro ao garantir conversa:', err);
        alert('Não foi possível iniciar a conversa.');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    setupConversation();
  }, [
    conversationId,
    navigation,
    route.params.clientId,
    route.params.professionalId,
    route.params.serviceRequestId,
  ]);

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const load = async () => {
      try {
        setLoading(true);
        const [conversation, initialMessages] = await Promise.all([
          fetchConversation(conversationId),
          fetchMessages(conversationId),
        ]);

        if (conversation && !route.params.title) {
          const otherParticipant = conversation.participants.find((participant) => participant.userId !== user.id);
          navigation.setOptions({ title: otherParticipant?.displayName ?? 'Conversa' });
        }

        setMessages(initialMessages);
        await markMessagesAsRead(conversationId, user.id);

        unsubscribe = subscribeToMessages(conversationId, async (payload) => {
          const newMessageRow = payload.new;
          const newMessage: Message = {
            id: newMessageRow.id,
            conversationId: newMessageRow.conversation_id,
            senderId: newMessageRow.sender_id,
            content: newMessageRow.content,
            mediaUrl: newMessageRow.media_url ?? null,
            mediaType: newMessageRow.media_type ?? null,
            metadata: newMessageRow.metadata ?? null,
            createdAt: newMessageRow.created_at,
            readBy: newMessageRow.read_by ?? [],
          };

          setMessages((prev) => {
            if (prev.find((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });

          if (newMessage.senderId !== user.id) {
            await markMessagesAsRead(conversationId, user.id);
          }
        });
      } catch (err) {
        console.error('Erro ao carregar conversa:', err);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, navigation, route.params.title, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const notifyRecipient = useCallback(
    async (conversationIdParam: string, preview: string) => {
      if (!user?.id) return;
      try {
        const conversation = await fetchConversation(conversationIdParam);
        const recipient = conversation?.participants.find((participant) => participant.userId !== user.id);
        if (recipient?.userId) {
          await notifyMessage({
            conversationId: conversationIdParam,
            senderId: user.id,
            senderName: user.name,
            recipientId: recipient.userId,
            contentPreview: preview,
          });
        }
      } catch (err) {
        console.warn('Falhou ao notificar destinatário:', err);
      }
    },
    [user?.id, user?.name],
  );

  const handleSend = async () => {
    if (!conversationId || !user?.id || !input.trim()) return;

    try {
      setSending(true);
      const messageText = input.trim();
      await sendMessage({
        conversationId,
        senderId: user.id,
        content: messageText,
      });
      setInput('');
      inputRef.current?.focus();
      await notifyRecipient(conversationId, messageText.slice(0, 120) || 'Nova mensagem no chat');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      alert(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = useCallback(async () => {
    if (!conversationId || !user?.id) return;

    try {
      setUploadingImage(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos de acesso às suas fotos para enviar imagens no chat. Ative a permissão nas definições.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: false,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (result.canceled || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        throw new Error('Não foi possível obter o ficheiro selecionado.');
      }

      const upload = await uploadChatImage(conversationId, asset.uri);
      const messageText = input.trim();

      await sendMessage({
        conversationId,
        senderId: user.id,
        content: messageText || undefined,
        mediaUrl: upload.publicUrl,
        mediaType: upload.contentType,
      });

      setInput('');
      await notifyRecipient(conversationId, messageText || '📷 Nova foto enviada');
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      alert(err instanceof Error ? err.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploadingImage(false);
    }
  }, [conversationId, input, notifyRecipient, user?.id]);

  if (loading && messages.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView ref={scrollRef} contentContainerStyle={styles.messagesContainer}>
        {messages.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>Comece a conversa</Text>
            <Text style={styles.emptySubtitle}>Envie a primeira mensagem para alinhar detalhes do serviço.</Text>
          </View>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user?.id;
            return (
              <View key={message.id} style={[styles.messageWrapper, isMine ? styles.messageMine : styles.messageTheirs]}>
                <Card style={[styles.messageCard, isMine ? styles.cardMine : styles.cardTheirs]}>
                  <Card.Content>
                    {message.mediaUrl ? (
                      <Image source={{ uri: message.mediaUrl }} style={styles.messageImage} resizeMode="cover" />
                    ) : null}
                    {message.content ? (
                      <Text style={[styles.messageText, isMine ? styles.textMine : styles.textTheirs]}>
                        {message.content}
                      </Text>
                    ) : null}
                    <Text style={[styles.messageTimestamp, isMine ? styles.timestampMine : styles.timestampTheirs]}>
                      {new Date(message.createdAt).toLocaleTimeString('pt-PT', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <IconButton
          icon={uploadingImage ? 'progress-upload' : 'image-outline'}
          onPress={handlePickImage}
          disabled={uploadingImage || !conversationId}
          size={28}
          iconColor={colors.primary}
          style={styles.attachButton}
        />
        <TextInput
          ref={inputRef}
          mode="outlined"
          placeholder="Escreva uma mensagem"
          value={input}
          onChangeText={setInput}
          multiline
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSend}
          loading={sending}
          disabled={sending || !input.trim()}
        >
          Enviar
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesContainer: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
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
  messageWrapper: {
    flexDirection: 'row',
  },
  messageMine: {
    justifyContent: 'flex-end',
  },
  messageTheirs: {
    justifyContent: 'flex-start',
  },
  messageCard: {
    maxWidth: '80%',
    borderRadius: 16,
  },
  cardMine: {
    backgroundColor: colors.professional,
  },
  cardTheirs: {
    backgroundColor: colors.surface,
  },
  messageText: {
    fontSize: 16,
  },
  textMine: {
    color: colors.textLight,
  },
  textTheirs: {
    color: colors.text,
  },
  messageTimestamp: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  timestampMine: {
    color: colors.textLight,
  },
  timestampTheirs: {
    color: colors.textSecondary,
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  attachButton: {
    margin: 0,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 8,
  },
});


