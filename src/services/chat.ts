import { supabase } from '../config/supabase';
import { Conversation, Message } from '../types';
import { withCache, CacheStrategy } from './offlineCache';
import { queueActionIfOffline } from '../components/AppWithOffline';
import { isOnline } from './network';

export const ensureConversation = async (
  serviceRequestId: string,
  clientId: string,
  professionalId: string,
): Promise<string> => {
  const { data, error } = await supabase.rpc('ensure_conversation', {
    p_service_request_id: serviceRequestId,
    p_client_id: clientId,
    p_professional_id: professionalId,
  });

  if (error) throw error;
  if (!data) throw new Error('Não foi possível criar a conversa.');
  return data as string;
};

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(
      `
      conversation_id,
      role,
      display_name,
      conversations:conversation_id (
        id,
        service_request_id,
        created_at,
        service_requests:service_request_id (
          title
        ),
        messages!messages_conversation_id_fkey (
          id,
          content,
          media_url,
          media_type,
          sender_id,
          created_at
        ),
        conversation_participants (
          user_id,
          role,
          display_name
        )
      )
    `,
    )
    .eq('user_id', userId);

  if (error) throw error;

  // Mapear e ordenar após obter os dados (não podemos ordenar por campo de relacionamento diretamente)
  const mappedConversations = (data || []).map((row: any) => {
    const conversation = row.conversations;
    const participants =
      conversation?.conversation_participants?.map((participant: any) => ({
        conversationId: conversation.id,
        userId: participant.user_id,
        role: participant.role,
        displayName: participant.display_name ?? undefined,
      })) || [];

    const lastMessage = conversation?.messages?.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

    // service_requests pode ser um objeto ou array
    const serviceRequest = Array.isArray(conversation.service_requests) 
      ? conversation.service_requests[0] 
      : conversation.service_requests;

    return {
      id: conversation.id,
      serviceRequestId: conversation.service_request_id ?? undefined,
      serviceRequestTitle: serviceRequest?.title ?? undefined,
      createdAt: conversation.created_at,
      participants,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            conversationId: conversation.id,
            senderId: lastMessage.sender_id,
            content: lastMessage.content,
            mediaUrl: lastMessage.media_url ?? null,
            mediaType: lastMessage.media_type ?? null,
            createdAt: lastMessage.created_at,
            readBy: [],
          }
        : undefined,
    } as Conversation;
  });

  // Ordenar por data de criação (mais recente primeiro)
  return mappedConversations.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const fetchMessages = async (conversationId: string, limit = 50): Promise<Message[]> => {
  return withCache(
    `messages_${conversationId}_${limit}`,
    async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          id,
          conversation_id,
          sender_id,
          content,
          media_url,
          media_type,
          metadata,
          created_at,
          read_by,
          sender:sender_id (
            id,
            name
          )
        `,
        )
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        content: row.content,
        mediaUrl: row.media_url ?? null,
        mediaType: row.media_type ?? null,
        metadata: row.metadata ?? null,
        createdAt: row.created_at,
        readBy: row.read_by ?? [],
        sender: row.sender ? { id: row.sender.id, name: row.sender.name } : undefined,
      }));
    },
    CacheStrategy.NETWORK_FIRST,
    5 * 60 * 1000, // Cache por 5 minutos
  );
};

export const fetchConversation = async (conversationId: string): Promise<Conversation | null> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `
      id,
      service_request_id,
      created_at,
      service_requests:service_request_id (
        title
      ),
      conversation_participants (
        user_id,
        role,
        display_name
      )
    `,
    )
    .eq('id', conversationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const participants =
    data.conversation_participants?.map((participant: any) => ({
      conversationId: data.id,
      userId: participant.user_id,
      role: participant.role,
      displayName: participant.display_name ?? undefined,
    })) || [];

  // service_requests pode ser um objeto ou array dependendo da query
  const serviceRequest = Array.isArray(data.service_requests) 
    ? data.service_requests[0] 
    : data.service_requests;

  return {
    id: data.id,
    serviceRequestId: data.service_request_id ?? undefined,
    serviceRequestTitle: serviceRequest?.title ?? undefined,
    createdAt: data.created_at,
    participants,
  };
};

interface SendMessageParams {
  conversationId: string;
  senderId: string;
  content?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  metadata?: Record<string, any> | null;
}

export const sendMessage = async ({
  conversationId,
  senderId,
  content,
  mediaUrl,
  mediaType,
  metadata,
}: SendMessageParams) => {
  const trimmed = content?.trim() ?? '';

  if (!trimmed && !mediaUrl) {
    throw new Error('Mensagem vazia.');
  }

  const online = await isOnline();

  // Se offline, adicionar à fila de sincronização
  if (!online) {
    await queueActionIfOffline(
      'SEND_MESSAGE',
      {
        conversationId,
        senderId,
        content: trimmed || null,
        mediaUrl: mediaUrl ?? null,
        mediaType: mediaType ?? null,
      },
      false,
      2, // Alta prioridade
    );
    // Retornar sem erro - mensagem será sincronizada depois
    return;
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: trimmed || null,
    media_url: mediaUrl ?? null,
    media_type: mediaType ?? null,
    metadata: metadata ?? null,
  });

  if (error) throw error;
};

export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  const { error } = await supabase.rpc('mark_messages_as_read', {
    p_conversation_id: conversationId,
    p_user_id: userId,
  });

  if (error) {
    console.warn('Não foi possível marcar mensagens como lidas:', error);
  }
};

export const subscribeToMessages = (
  conversationId: string,
  callback: (payload: { new: any }) => void,
) => {
  const channelName = `conversation:${conversationId}`;
  
  // Nota: Não podemos verificar canais existentes diretamente, mas o Supabase gerencia isso automaticamente
  
  const channel = supabase
    .channel(channelName, {
      config: {
        broadcast: { self: true },
      },
    })
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Buscar informações do sender para a nova mensagem
        if (payload.new?.sender_id) {
          try {
            const { data: senderData } = await supabase
              .from('users')
              .select('id, name')
              .eq('id', payload.new.sender_id)
              .single();
            
            if (senderData) {
              payload.new.sender = { id: senderData.id, name: senderData.name };
            }
          } catch (err) {
            console.warn('Erro ao buscar sender da mensagem:', err);
          }
        }
        callback(payload);
      },
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Chat] Subscribed to channel: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Chat] Error subscribing to channel: ${channelName}`, status);
      } else if (status === 'TIMED_OUT') {
        console.warn(`[Chat] Subscription timed out for channel: ${channelName}`);
      } else if (status === 'CLOSED') {
        console.warn(`[Chat] Channel closed: ${channelName}`);
      } else {
        console.log(`[Chat] Channel status: ${status} for ${channelName}`);
      }
    });

  return () => {
    console.log(`[Chat] Unsubscribing from channel: ${channelName}`);
    try {
      supabase.removeChannel(channel);
    } catch (err) {
      console.warn('Erro ao remover canal:', err);
    }
  };
};

