import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { CreditTransaction, listCreditTransactions } from '../../services/stripe';

export const TransactionHistoryScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await listCreditTransactions(user.id);
      setTransactions(data);
    } catch (err) {
      console.error('Erro ao carregar histórico de créditos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: CreditTransaction }) => {
    const isAddition = item.amount >= 0;
    const amountLabel = `${isAddition ? '+' : ''}${item.amount} moedas`;
    const timestamp = new Date(item.created_at).toLocaleString('pt-PT');

    return (
      <List.Item
        title={item.description || 'Movimentação de créditos'}
        description={`Saldo após operação: ${item.balance_after} moedas\n${timestamp}`}
        left={(props) => <List.Icon {...props} icon={isAddition ? 'arrow-up-bold' : 'arrow-down-bold'} />}
        right={() => <Text style={isAddition ? styles.amountPositive : styles.amountNegative}>{amountLabel}</Text>}
      />
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={colors.professional} />
        <Text style={styles.loaderText}>A carregar histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Histórico de créditos</Text>
          <Text style={styles.subtitle}>
            Veja todas as compras e movimentos de débito/crédito associados à sua conta profissional.
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.professional} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum movimento registado</Text>
            <Text style={styles.emptySubtitle}>As compras e consumos de créditos aparecerão aqui.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    margin: 16,
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loaderText: {
    color: colors.textSecondary,
  },
  amountPositive: {
    color: colors.success,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  amountNegative: {
    color: colors.error,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

export default TransactionHistoryScreen;

