import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useNetwork } from '../hooks/useNetwork';
import { NetworkStatus } from './NetworkStatus';
import { initializeSync, startAutoSync, stopAutoSync } from '../services/sync';
import { addToSyncQueue } from '../services/syncQueue';
import { supabase } from '../config/supabase';

interface AppWithOfflineProps {
  children: React.ReactNode;
}

/**
 * Componente wrapper que gerencia funcionalidades offline
 */
export const AppWithOffline: React.FC<AppWithOfflineProps> = ({ children }) => {
  const { isConnected } = useNetwork();

  useEffect(() => {
    // Inicializar handlers de sincronização
    initializeSync({
      // Handler para criar pedido de serviço
      CREATE_SERVICE_REQUEST: async (payload: any) => {
        const { client_id, title, category, description, location, budget, photos, latitude, longitude } = payload;
        const { error } = await supabase.from('service_requests').insert({
          client_id,
          title,
          category,
          description,
          location,
          budget,
          photos,
          latitude,
          longitude,
          status: 'pending',
        });
        if (error) throw error;
      },

      // Handler para enviar mensagem
      SEND_MESSAGE: async (payload: any) => {
        const { conversationId, senderId, content, mediaUrl, mediaType } = payload;
        const { error } = await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          media_url: mediaUrl,
          media_type: mediaType,
        });
        if (error) throw error;
      },

      // Handler para criar proposta
      CREATE_PROPOSAL: async (payload: any) => {
        const { serviceRequestId, professionalId, price, description, estimatedDuration } = payload;
        const { error } = await supabase.from('proposals').insert({
          service_request_id: serviceRequestId,
          professional_id: professionalId,
          price,
          description,
          estimated_duration: estimatedDuration,
          status: 'pending',
        });
        if (error) throw error;
      },

      // Handler para atualizar perfil
      UPDATE_PROFILE: async (payload: any) => {
        const { userId, updates } = payload;
        const { error } = await supabase.from('users').update(updates).eq('id', userId);
        if (error) throw error;
      },
    });

    // Iniciar sincronização automática quando online
    if (isConnected) {
      startAutoSync(30000); // Sincronizar a cada 30 segundos
    } else {
      stopAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [isConnected]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      <NetworkStatus position="top" />
    </View>
  );
};

/**
 * Helper para adicionar ação à fila de sincronização quando offline
 */
export const queueActionIfOffline = async (
  type: string,
  payload: any,
  forceOffline: boolean = false,
  priority: number = 1,
): Promise<string | null> => {
  const online = forceOffline ? false : await isOnline();
  if (!online) {
    return addToSyncQueue(type, payload, priority);
  }
  return null;
};

