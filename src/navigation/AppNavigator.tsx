import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { ActivityIndicator, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useTheme } from 'react-native-paper';
import { useThemeMode } from '../contexts/ThemeContext';
import { useDeepLinking } from '../hooks/useDeepLinking';

// Auth Screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/TermsOfServiceScreen';

// Public Screens
import { PublicServiceRequestScreen } from '../screens/public/PublicServiceRequestScreen';

// Client Screens
import { ClientHomeScreen } from '../screens/client/ClientHomeScreen';
import { NewServiceRequestScreen } from '../screens/client/NewServiceRequestScreen';
import { ServiceRequestDetailScreen } from '../screens/client/ServiceRequestDetailScreen';
import { ReviewScreen } from '../screens/client/ReviewScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ClientDashboardScreen } from '../screens/client/ClientDashboardScreen';
import { OrderHistoryScreen } from '../screens/client/OrderHistoryScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Professional Screens
import { ProfessionalHomeScreen } from '../screens/professional/ProfessionalHomeScreen';
import { BuyCreditsScreen } from '../screens/professional/BuyCreditsScreen';
import { LeadDetailScreen } from '../screens/professional/LeadDetailScreen';
import { SendProposalScreen } from '../screens/professional/SendProposalScreen';
import { ManageProfileScreen } from '../screens/professional/ManageProfileScreen';
import { ManageCategoriesScreen } from '../screens/professional/ManageCategoriesScreen';
import { ManageRegionsScreen } from '../screens/professional/ManageRegionsScreen';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ChatConversationScreen } from '../screens/chat/ChatConversationScreen';
import { CheckoutStatusScreen } from '../screens/professional/CheckoutStatusScreen';
import { TransactionHistoryScreen } from '../screens/professional/TransactionHistoryScreen';
import { ProfileScreen } from '../screens/professional/ProfileScreen';
import { ProfessionalDashboardScreen } from '../screens/professional/ProfessionalDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

const defaultClientStackOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textLight,
  headerTitleAlign: 'center' as const,
  contentStyle: { backgroundColor: colors.background },
  animation: 'fade_from_bottom' as const,
};

const defaultProfessionalStackOptions = {
  headerStyle: { backgroundColor: colors.professional },
  headerTintColor: colors.textLight,
  headerTitleAlign: 'center' as const,
  contentStyle: { backgroundColor: colors.background },
  animation: 'fade_from_bottom' as const,
};

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      ...defaultClientStackOptions,
      animation: 'slide_from_right',
    }}
  >
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Criar Conta' }}
    />
    <Stack.Screen
      name="PrivacyPolicy"
      component={PrivacyPolicyScreen}
      options={{ title: 'Política de Privacidade' }}
    />
    <Stack.Screen
      name="TermsOfService"
      component={TermsOfServiceScreen}
      options={{ title: 'Termos de Uso' }}
    />
    <Stack.Screen
      name="PublicServiceRequest"
      component={PublicServiceRequestScreen}
      options={{ title: 'Pedido de Serviço' }}
    />
  </Stack.Navigator>
);

const ClientStack = () => (
  <Stack.Navigator screenOptions={defaultClientStackOptions}>
    <Stack.Screen
      name="ClientHome"
      component={ClientHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ClientDashboard"
      component={ClientDashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Stack.Screen
      name="ClientOrderHistory"
      component={OrderHistoryScreen}
      options={{ title: 'Histórico de Pedidos' }}
    />
    <Stack.Screen
      name="NewServiceRequest"
      component={NewServiceRequestScreen}
      options={{ title: 'Novo Pedido' }}
    />
    <Stack.Screen
      name="ServiceRequestDetail"
      component={ServiceRequestDetailScreen}
      options={{ title: 'Detalhes do Pedido' }}
    />
    <Stack.Screen
      name="Review"
      component={ReviewScreen}
      options={{ title: 'Avaliar Profissional' }}
    />
    <Stack.Screen
      name="ProfessionalProfile"
      component={ProfileScreen}
      options={{ title: 'Perfil do Profissional' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notificações' }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Editar Perfil' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Configurações' }}
    />
    <Stack.Screen
      name="PrivacyPolicy"
      component={PrivacyPolicyScreen}
      options={{ title: 'Política de Privacidade' }}
    />
    <Stack.Screen
      name="TermsOfService"
      component={TermsOfServiceScreen}
      options={{ title: 'Termos de Uso' }}
    />
  </Stack.Navigator>
);

const ClientChatStack = () => (
  <ChatStack.Navigator screenOptions={defaultClientStackOptions}>
    <ChatStack.Screen
      name="ChatList"
      component={ChatListScreen}
      options={{ title: 'Mensagens' }}
      initialParams={{ conversationRoute: 'ChatConversation' }}
    />
    <ChatStack.Screen
      name="ChatConversation"
      component={ChatConversationScreen}
      options={{ title: 'Conversa' }}
    />
  </ChatStack.Navigator>
);

const ClientTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: colors.textLight,
      headerTitleAlign: 'center',
      tabBarStyle: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        height: 68,
        paddingBottom: 8,
      },
      tabBarLabelStyle: {
        fontWeight: '600',
      },
      animation: 'fade',
    }}
  >
    <Tab.Screen
      name="ClientStack"
      component={ClientStack}
      options={{
        title: 'Início',
        tabBarLabel: 'Início',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="ClientChat"
      component={ClientChatStack}
      options={{
        title: 'Mensagens',
        tabBarLabel: 'Mensagens',
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

const ProfessionalStack = () => (
  <Stack.Navigator screenOptions={defaultProfessionalStackOptions}>
    <Stack.Screen
      name="ProfessionalHome"
      component={ProfessionalHomeScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="BuyCredits"
      component={BuyCreditsScreen}
      options={{ title: 'Comprar Créditos' }}
    />
    <Stack.Screen
      name="LeadDetail"
      component={LeadDetailScreen}
      options={{ title: 'Detalhes do Lead' }}
    />
    <Stack.Screen
      name="SendProposal"
      component={SendProposalScreen}
      options={{ title: 'Enviar Proposta' }}
    />
    <Stack.Screen
      name="ProfessionalDashboard"
      component={ProfessionalDashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <Stack.Screen
      name="ManageProfile"
      component={ManageProfileScreen}
      options={{ title: 'Gerir Perfil' }}
    />
    <Stack.Screen
      name="ManageCategories"
      component={ManageCategoriesScreen}
      options={{ title: 'Categorias de Atuação' }}
    />
    <Stack.Screen
      name="ManageRegions"
      component={ManageRegionsScreen}
      options={{ title: 'Zonas de Atendimento' }}
    />
    <Stack.Screen
      name="ProfessionalProfile"
      component={ProfileScreen}
      options={{ title: 'Meu Perfil Público' }}
    />
    <Stack.Screen
      name="TransactionHistory"
      component={TransactionHistoryScreen}
      options={{ title: 'Histórico de Créditos' }}
    />
    <Stack.Screen
      name="CheckoutStatus"
      component={CheckoutStatusScreen}
      options={{ title: 'Compra de Créditos' }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'Notificações' }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Editar Perfil' }}
    />
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Configurações' }}
    />
    <Stack.Screen
      name="PrivacyPolicy"
      component={PrivacyPolicyScreen}
      options={{ title: 'Política de Privacidade' }}
    />
    <Stack.Screen
      name="TermsOfService"
      component={TermsOfServiceScreen}
      options={{ title: 'Termos de Uso' }}
    />
  </Stack.Navigator>
);

const ProfessionalChatStack = () => (
  <ChatStack.Navigator screenOptions={defaultProfessionalStackOptions}>
    <ChatStack.Screen
      name="ProChatList"
      component={ChatListScreen}
      options={{ title: 'Mensagens' }}
      initialParams={{ conversationRoute: 'ProChatConversation' }}
    />
    <ChatStack.Screen
      name="ProChatConversation"
      component={ChatConversationScreen}
      options={{ title: 'Conversa' }}
    />
  </ChatStack.Navigator>
);

const ProfessionalTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.professional,
      tabBarInactiveTintColor: colors.textSecondary,
      headerStyle: { backgroundColor: colors.professional },
      headerTintColor: colors.textLight,
    }}
  >
    <Tab.Screen
      name="ProfessionalStack"
      component={ProfessionalStack}
      options={{
        title: 'Oportunidades',
        tabBarLabel: 'Oportunidades',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="ProfessionalChat"
      component={ProfessionalChatStack}
      options={{
        title: 'Mensagens',
        tabBarLabel: 'Mensagens',
        headerShown: false,
      }}
    />
  </Tab.Navigator>
);

const linking = {
  prefixes: [
    'elastiquality://',
    'https://elastiquality.pt',
    Linking.createURL('/'),
  ],
  config: {
    screens: {
      AuthStack: {
        screens: {
          Login: 'login',
          Register: 'register',
          PublicServiceRequest: 'service/:serviceRequestId',
          PrivacyPolicy: 'privacy',
          TermsOfService: 'terms',
        },
      },
      ClientStack: {
        screens: {
          ClientHome: 'home',
          ServiceRequestDetail: 'service/:requestId',
          NewServiceRequest: 'new-service',
          Review: 'review/:serviceRequestId',
          ProfessionalProfile: 'profile/:professionalId',
        },
      },
      ClientChat: {
        screens: {
          ChatList: 'client-messages',
          ChatConversation: 'client-chat/:conversationId',
        },
      },
      ProfessionalStack: {
        screens: {
          ProfessionalHome: 'opportunities',
          LeadDetail: 'lead/:leadId',
          SendProposal: 'proposal/:serviceRequestId',
          CheckoutStatus: 'checkout/:status',
        },
      },
      ProfessionalChat: {
        screens: {
          ProChatList: 'professional-messages',
          ProChatConversation: 'professional-chat/:conversationId',
        },
      },
    },
  },
};

export const AppNavigator = () => {
  const { user, loading } = useAuth();
  const paperTheme = useTheme();
  const { navigationTheme } = useThemeMode();
  const navigationRef = React.useRef<any>(null);

  // Configurar deep linking - DEVE ser chamado antes de qualquer return condicional
  useDeepLinking(
    {
      navigate: (screen: string, params?: any) => {
        navigationRef.current?.navigate(screen, params);
      },
      canGoBack: () => navigationRef.current?.canGoBack() ?? false,
      goBack: () => navigationRef.current?.goBack(),
      getParent: () => navigationRef.current?.getParent(),
    },
    !!user,
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: paperTheme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={paperTheme.colors.primary} />
      </View>
    );
  }

  // Validação de segurança: garantir que o userType está correto
  // Se o usuário não tiver um tipo válido, mostrar tela de login
  if (user && user.userType !== 'client' && user.userType !== 'professional') {
    console.warn('Tipo de usuário inválido:', user.userType);
    return (
      <NavigationContainer ref={navigationRef} linking={linking} theme={navigationTheme}>
        <AuthStack />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linking} theme={navigationTheme}>
      {!user ? (
        <AuthStack />
      ) : user.userType === 'client' ? (
        <ClientTabs />
      ) : user.userType === 'professional' ? (
        <ProfessionalTabs />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

