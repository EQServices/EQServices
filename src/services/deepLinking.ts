import { Linking } from 'react-native';
import * as LinkingExpo from 'expo-linking';

export interface DeepLinkParams {
  route: string;
  params?: Record<string, string>;
}

export interface ParsedDeepLink {
  type: 'service' | 'profile' | 'chat' | 'proposal' | 'unknown';
  id: string;
  params?: Record<string, string>;
}

/**
 * Parse de um URL de deep link
 * Suporta formatos:
 * - elastiquality://service/:id
 * - elastiquality://profile/:id
 * - elastiquality://chat/:id
 * - elastiquality://proposal/:id
 * - https://elastiquality.pt/service/:id
 * - https://elastiquality.pt/profile/:id
 * - https://elastiquality.pt/chat/:id
 */
export const parseDeepLink = (url: string): ParsedDeepLink | null => {
  try {
    // Remover espaços e caracteres inválidos
    const cleanUrl = url.trim();

    // Parse usando expo-linking
    const parsed = LinkingExpo.parse(cleanUrl);

    // Extrair path e query params
    const path = parsed.path || '';
    const queryParams = parsed.queryParams || {};

    // Verificar se é um link do app (scheme ou host)
    const isAppLink =
      parsed.scheme === 'elastiquality' ||
      parsed.host === 'elastiquality.pt' ||
      parsed.hostname === 'elastiquality.pt';

    if (!isAppLink) {
      return null;
    }

    // Parse do path
    const pathParts = path.split('/').filter((p) => p.length > 0);

    if (pathParts.length === 0) {
      return null;
    }

    const route = pathParts[0];
    const id = pathParts[1] || queryParams.id || '';

    switch (route) {
      case 'service':
        return {
          type: 'service',
          id,
          params: queryParams,
        };
      case 'profile':
        return {
          type: 'profile',
          id,
          params: queryParams,
        };
      case 'chat':
      case 'conversation':
        return {
          type: 'chat',
          id,
          params: queryParams,
        };
      case 'proposal':
        return {
          type: 'proposal',
          id,
          params: queryParams,
        };
      default:
        return {
          type: 'unknown',
          id: '',
          params: queryParams,
        };
    }
  } catch (error) {
    console.error('Erro ao fazer parse do deep link:', error);
    return null;
  }
};

/**
 * Gera um deep link para um pedido de serviço
 */
export const generateServiceRequestDeepLink = (serviceRequestId: string): string => {
  return `elastiquality://service/${serviceRequestId}`;
};

/**
 * Gera um deep link para um perfil de profissional
 */
export const generateProfileDeepLink = (professionalId: string): string => {
  return `elastiquality://profile/${professionalId}`;
};

/**
 * Gera um deep link para uma conversa
 */
export const generateChatDeepLink = (conversationId: string): string => {
  return `elastiquality://chat/${conversationId}`;
};

/**
 * Gera um deep link para uma proposta
 */
export const generateProposalDeepLink = (proposalId: string): string => {
  return `elastiquality://proposal/${proposalId}`;
};

/**
 * Gera um link universal (web + app)
 */
export const generateUniversalLink = (type: 'service' | 'profile' | 'chat' | 'proposal', id: string): string => {
  const webUrl = `https://elastiquality.pt/${type}/${id}`;
  const appUrl = `elastiquality://${type}/${id}`;
  
  // Em produção, você pode usar um serviço de universal links
  // Por enquanto, retornamos o link web que pode abrir o app se instalado
  return webUrl;
};

/**
 * Verifica se o app pode lidar com um URL
 */
export const canHandleURL = async (url: string): Promise<boolean> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    return canOpen;
  } catch (error) {
    console.error('Erro ao verificar URL:', error);
    return false;
  }
};

/**
 * Abre um URL (pode abrir app ou browser)
 */
export const openURL = async (url: string): Promise<boolean> => {
  try {
    const canOpen = await canHandleURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao abrir URL:', error);
    return false;
  }
};

