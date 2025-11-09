import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { colors } from '../../theme/colors';

type CheckoutStatus = 'success' | 'cancelled' | 'unknown';

interface CheckoutStatusScreenProps {
  navigation: any;
  route: {
    params?: {
      status?: CheckoutStatus;
      session_id?: string;
    };
  };
}

export const CheckoutStatusScreen: React.FC<CheckoutStatusScreenProps> = ({ navigation, route }) => {
  const rawStatus = (route.params?.status || route.params?.result || route.params?.Status || '').toString().toLowerCase();
  const statusFromParams: CheckoutStatus =
    rawStatus === 'success' || rawStatus === 'sucesso'
      ? 'success'
      : rawStatus === 'cancelled' || rawStatus === 'cancelado'
        ? 'cancelled'
        : 'unknown';

  const { title, description, primaryLabel, primaryAction } = useMemo(() => {
    switch (statusFromParams) {
      case 'success':
        return {
          title: 'Pagamento concluído!',
          description:
            'Seu pagamento foi confirmado. Os créditos serão atualizados automaticamente em instantes.',
          primaryLabel: 'Ver histórico de compras',
          primaryAction: () => navigation.replace('TransactionHistory'),
        };
      case 'cancelled':
        return {
          title: 'Pagamento cancelado',
          description: 'A compra foi cancelada. Pode tentar novamente a qualquer momento.',
          primaryLabel: 'Voltar para comprar créditos',
          primaryAction: () => navigation.replace('ProfessionalHome'),
        };
      default:
        return {
          title: 'Estado desconhecido',
          description: 'Não foi possível confirmar o estado do pagamento.',
          primaryLabel: 'Voltar',
          primaryAction: () => navigation.goBack(),
        };
    }
  }, [navigation, statusFromParams]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {route.params?.session_id ? (
            <Text style={styles.sessionId}>ID da sessão: {route.params.session_id}</Text>
          ) : null}

          <Button mode="contained" onPress={primaryAction} style={styles.button} buttonColor={colors.professional}>
            {primaryLabel}
          </Button>
          {statusFromParams === 'success' ? (
            <Button mode="text" onPress={() => navigation.replace('ProfessionalHome')} textColor={colors.professional}>
              Voltar para o painel
            </Button>
          ) : null}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    borderRadius: 16,
    elevation: 3,
  },
  cardContent: {
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sessionId: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
});

export default CheckoutStatusScreen;

