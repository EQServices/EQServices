import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          title: t('checkout.success.title'),
          description: t('checkout.success.description'),
          primaryLabel: t('checkout.success.primaryLabel'),
          primaryAction: () => navigation.replace('TransactionHistory'),
        };
      case 'cancelled':
        return {
          title: t('checkout.cancelled.title'),
          description: t('checkout.cancelled.description'),
          primaryLabel: t('checkout.cancelled.primaryLabel'),
          primaryAction: () => navigation.replace('ProfessionalHome'),
        };
      default:
        return {
          title: t('checkout.unknown.title'),
          description: t('checkout.unknown.description'),
          primaryLabel: t('common.back'),
          primaryAction: () => navigation.goBack(),
        };
    }
  }, [navigation, statusFromParams, t]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {route.params?.session_id ? (
            <Text style={styles.sessionId}>{t('checkout.sessionId')}: {route.params.session_id}</Text>
          ) : null}

          <Button mode="contained" onPress={primaryAction} style={styles.button} buttonColor={colors.professional}>
            {primaryLabel}
          </Button>
          {statusFromParams === 'success' ? (
            <Button mode="text" onPress={() => navigation.replace('ProfessionalHome')} textColor={colors.professional}>
              {t('checkout.success.backToDashboard')}
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

