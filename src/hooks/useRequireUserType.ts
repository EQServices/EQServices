import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { UserType } from '../types';

/**
 * Hook que valida se o usuário tem o tipo correto
 * Redireciona automaticamente se não tiver
 */
export const useRequireUserType = (requiredType: UserType) => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigation.navigate('Login' as never);
      return;
    }

    if (user.userType !== requiredType) {
      console.warn(
        `Acesso negado: usuário é ${user.userType}, mas ${requiredType} é necessário`,
        { userId: user.id, email: user.email },
      );

      // Redirecionar para a tela apropriada
      if (user.userType === 'client') {
        navigation.navigate('ClientStack' as never, { screen: 'ClientHome' } as never);
      } else if (user.userType === 'professional') {
        navigation.navigate('ProfessionalStack' as never, { screen: 'ProfessionalHome' } as never);
      } else {
        navigation.navigate('Login' as never);
      }
    }
  }, [user, loading, requiredType, navigation]);

  return {
    user,
    loading,
    isValid: user?.userType === requiredType,
  };
};

