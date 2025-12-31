import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserType, User } from '../types';
import { useNavigation } from '@react-navigation/native';

interface UseRequireUserTypeReturn {
  user: User | null;
  isValid: boolean;
}

export const useRequireUserType = (requiredType: UserType): UseRequireUserTypeReturn => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  const isValid = !loading && user !== null && user.userType === requiredType;

  useEffect(() => {
    if (!loading && (!user || user.userType !== requiredType)) {
      // Redirecionar para login se o tipo de usuário não corresponder
      // ou se não houver usuário autenticado
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        });
      }
    }
  }, [user, requiredType, loading, navigation]);

  return {
    user: isValid ? user : null,
    isValid,
  };
};

