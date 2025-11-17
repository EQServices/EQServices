import * as Sharing from 'expo-sharing';
import { Platform, Alert, Linking } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { generateUniversalLink } from './deepLinking';

export interface ShareOptions {
  title?: string;
  message: string;
  url?: string;
}

/**
 * Gera um link único para um pedido de serviço
 */
export const generateServiceRequestLink = (serviceRequestId: string): string => {
  // Usa universal link que funciona tanto na web quanto no app
  return generateUniversalLink('service', serviceRequestId);
};

/**
 * Compartilha conteúdo usando o sistema nativo de compartilhamento
 */
export const shareContent = async (options: ShareOptions): Promise<boolean> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      // Fallback: copiar para clipboard
      const textToShare = options.url 
        ? `${options.message}\n\n${options.url}`
        : options.message;
      
      Clipboard.setString(textToShare);
      Alert.alert('Copiado!', 'Conteúdo copiado para a área de transferência.');
      return true;
    }

    const shareMessage = options.url
      ? `${options.message}\n\n${options.url}`
      : options.message;

    await Sharing.shareAsync(shareMessage, {
      dialogTitle: options.title || 'Compartilhar',
      mimeType: 'text/plain',
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao compartilhar:', error);
    
    if (error.code !== 'ERR_USER_CANCELED') {
      Alert.alert('Erro', 'Não foi possível compartilhar. Tente novamente.');
    }
    
    return false;
  }
};

/**
 * Compartilha um pedido de serviço
 */
export const shareServiceRequest = async (
  serviceRequestId: string,
  title: string,
  category: string,
  location: string,
): Promise<boolean> => {
  const link = generateServiceRequestLink(serviceRequestId);
  const message = `Confira este pedido de serviço no Elastiquality:\n\n${title}\nCategoria: ${category}\nLocalização: ${location}\n\nVeja mais detalhes:`;

  return shareContent({
    title: 'Compartilhar Pedido',
    message,
    url: link,
  });
};

/**
 * Compartilha via WhatsApp (se disponível)
 */
export const shareViaWhatsApp = async (message: string, url?: string): Promise<boolean> => {
  try {
    const fullMessage = url ? `${message}\n\n${url}` : message;
    const encodedMessage = encodeURIComponent(fullMessage);
    const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;

    const canOpen = await Linking.canOpenURL(whatsappUrl);
    
    if (canOpen) {
      await Linking.openURL(whatsappUrl);
      return true;
    } else {
      // Fallback para web WhatsApp
      const webWhatsAppUrl = `https://wa.me/?text=${encodedMessage}`;
      await Linking.openURL(webWhatsAppUrl);
      return true;
    }
  } catch (error) {
    console.error('Erro ao compartilhar via WhatsApp:', error);
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.');
    return false;
  }
};

/**
 * Compartilha via Email
 */
export const shareViaEmail = async (
  subject: string,
  body: string,
  url?: string,
): Promise<boolean> => {
  try {
    const emailBody = url ? `${body}\n\n${url}` : body;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
      return true;
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
      return false;
    }
  } catch (error) {
    console.error('Erro ao compartilhar via email:', error);
    Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
    return false;
  }
};

/**
 * Copia link para a área de transferência
 */
export const copyLinkToClipboard = async (link: string): Promise<boolean> => {
  try {
    Clipboard.setString(link);
    Alert.alert('Copiado!', 'Link copiado para a área de transferência.');
    return true;
  } catch (error) {
    console.error('Erro ao copiar link:', error);
    Alert.alert('Erro', 'Não foi possível copiar o link.');
    return false;
  }
};

