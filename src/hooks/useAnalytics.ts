/**
 * Hook para usar Analytics
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { logScreenView, setUserId, setUserProperties } from '../services/analytics';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para rastrear visualizações de tela automaticamente
 */
export const useScreenTracking = (screenName: string): void => {
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      logScreenView(screenName);
    });

    return unsubscribe;
  }, [navigation, screenName]);
};

/**
 * Hook para configurar analytics com contexto do usuário
 */
export const useAnalyticsSetup = (): void => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      setUserProperties({
        user_type: user.userType,
        email: user.email,
      });
    } else {
      setUserId(null);
    }
  }, [user]);
};

