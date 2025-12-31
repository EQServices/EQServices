import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

interface ProtectedScreenProps {
  children: React.ReactNode;
  requiredUserType: 'client' | 'professional';
}

/**
 * Componente que protege telas baseado no tipo de usuário
 * Redireciona automaticamente se o usuário não tiver o tipo correto
 */
export const ProtectedScreen: React.FC<ProtectedScreenProps> = ({ children, requiredUserType }) => {
  const { user, loading } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!loading && user) {
      if (user.userType !== requiredUserType) {
        // Redirecionar para a tela apropriada baseado no tipo de usuário
        if (user.userType === 'client') {
          navigation.navigate('ClientStack' as never, { screen: 'ClientHome' } as never);
        } else if (user.userType === 'professional') {
          navigation.navigate('ProfessionalStack' as never, { screen: 'ProfessionalHome' } as never);
        } else {
          // Se não tiver tipo válido, fazer logout
          navigation.navigate('Login' as never);
        }
      }
    }
  }, [user, loading, requiredUserType, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.error }}>Acesso negado. Faça login para continuar.</Text>
      </View>
    );
  }

  if (user.userType !== requiredUserType) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>Redirecionando...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

