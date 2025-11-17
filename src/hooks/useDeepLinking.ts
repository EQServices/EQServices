import { useEffect, useRef } from 'react';
import { Linking, Platform } from 'react-native';
import * as LinkingExpo from 'expo-linking';
import { parseDeepLink, ParsedDeepLink } from '../services/deepLinking';

export interface DeepLinkNavigation {
  navigate: (screen: string, params?: any) => void;
  canGoBack: () => boolean;
  goBack: () => void;
  getParent?: () => any;
}

/**
 * Hook para gerenciar deep linking
 */
export const useDeepLinking = (navigation: DeepLinkNavigation, isAuthenticated: boolean) => {
  const initialUrlProcessed = useRef(false);

  const handleDeepLink = (parsedLink: ParsedDeepLink | null) => {
    if (!parsedLink || !parsedLink.id) {
      return;
    }

    // Se não estiver autenticado, redirecionar para login primeiro
    if (!isAuthenticated) {
      navigation.navigate('Login', {
        redirectTo: parsedLink.type,
        redirectParams: { id: parsedLink.id, ...parsedLink.params },
      });
      return;
    }

    // Navegar baseado no tipo de link
    switch (parsedLink.type) {
      case 'service':
        // Navegar para detalhes do pedido
        navigation.navigate('ServiceRequestDetail', {
          requestId: parsedLink.id,
          ...parsedLink.params,
        });
        break;

      case 'profile':
        // Navegar para perfil do profissional
        navigation.navigate('ProfessionalProfile', {
          professionalId: parsedLink.id,
          ...parsedLink.params,
        });
        break;

      case 'chat':
        // Navegar para conversa
        const tabNavigator = (navigation as any).getParent?.();
        if (tabNavigator) {
          // Tentar navegar via tab navigator
          tabNavigator.navigate('ClientChat', {
            screen: 'ChatConversation',
            params: {
              conversationId: parsedLink.id,
              ...parsedLink.params,
            },
          });
        } else {
          navigation.navigate('ChatConversation', {
            conversationId: parsedLink.id,
            ...parsedLink.params,
          });
        }
        break;

      case 'proposal':
        // Navegar para detalhes da proposta (via pedido)
        // Assumindo que temos o serviceRequestId nos params
        if (parsedLink.params?.serviceRequestId) {
          navigation.navigate('ServiceRequestDetail', {
            requestId: parsedLink.params.serviceRequestId,
            proposalId: parsedLink.id,
          });
        }
        break;

      default:
        console.warn('Tipo de deep link desconhecido:', parsedLink.type);
    }
  };

  useEffect(() => {
    // Processar URL inicial quando app abre
    const processInitialURL = async () => {
      if (initialUrlProcessed.current) return;
      initialUrlProcessed.current = true;

      try {
        const initialUrl = await LinkingExpo.getInitialURLAsync();
        if (initialUrl) {
          const parsed = parseDeepLink(initialUrl);
          if (parsed) {
            // Aguardar um pouco para garantir que navegação está pronta
            setTimeout(() => {
              handleDeepLink(parsed);
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Erro ao processar URL inicial:', error);
      }
    };

    processInitialURL();

    // Escutar mudanças de URL quando app está aberto
    const subscription = Linking.addEventListener('url', (event) => {
      const parsed = parseDeepLink(event.url);
      if (parsed) {
        handleDeepLink(parsed);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  return {
    handleDeepLink,
  };
};

