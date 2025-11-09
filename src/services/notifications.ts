import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { supabase } from '../config/supabase';

export interface NotifyMessagePayload {
  conversationId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  contentPreview: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async (userId: string) => {
  if (Platform.OS === 'web') {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão de notificações não concedida.');
    return null;
  }

  const pushToken = (await Notifications.getExpoPushTokenAsync()).data;

  const { error } = await supabase
    .from('device_tokens')
    .upsert(
      {
        user_id: userId,
        token: pushToken,
        platform: Platform.OS,
      },
      {
        onConflict: 'user_id,token',
      },
    );

  if (error) {
    console.warn('Não foi possível registar o token de push:', error);
  }

  return pushToken;
};

export const notifyMessage = async (payload: NotifyMessagePayload) => {
  try {
    const { error } = await supabase.functions.invoke('notify-message', {
      body: {
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        senderName: payload.senderName,
        recipientId: payload.recipientId,
        contentPreview: payload.contentPreview,
      },
    });

    if (error) {
      console.warn('Erro ao solicitar notificação:', error);
    }
  } catch (err) {
    console.warn('Não foi possível invocar notify-message:', err);
  }
};

