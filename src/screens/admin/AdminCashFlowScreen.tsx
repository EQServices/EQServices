import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, DataTable } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';

interface CashFlow {
  tipo_transacao: string;
  quantidade: number;
  valor_total: number;
  creditos_total: number;
  primeira_transacao: string;
  ultima_transacao: string;
}

interface MonthlyFinancial {
  mes: string;
  compras_realizadas: number;
  receita_total: number;
  creditos_vendidos: number;
}

export const AdminCashFlowScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [monthlyFinancial, setMonthlyFinancial] = useState<MonthlyFinancial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigation.navigate('Login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar fluxo de caixa
      const { data: cashFlowData, error: cashFlowError } = await supabase.from('admin_cash_flow').select('*');

      if (cashFlowError) throw cashFlowError;
      setCashFlow(cashFlowData || []);

      // Buscar resumo mensal
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('admin_monthly_financial_summary')
        .select('*')
        .order('mes', { ascending: false })
        .limit(12);

      if (monthlyError) throw monthlyError;
      setMonthlyFinancial(monthlyData || []);
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const totalReceita = cashFlow.reduce((sum, item) => sum + item.valor_total, 0);
  const totalTransacoes = cashFlow.reduce((sum, item) => sum + item.quantidade, 0);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>A carregar dados financeiros...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      {/* Resumo Geral */}
      <Card style={styles.card}>
        <Card.Title title="Resumo Financeiro" titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Receita Total:</Text>
            <Text style={styles.summaryValue}>€{totalReceita.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de Transações:</Text>
            <Text style={styles.summaryValue}>{totalTransacoes}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Fluxo de Caixa Detalhado */}
      <Card style={styles.card}>
        <Card.Title title="Fluxo de Caixa Detalhado" titleStyle={styles.cardTitle} />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Tipo</DataTable.Title>
              <DataTable.Title numeric>Quantidade</DataTable.Title>
              <DataTable.Title numeric>Valor Total</DataTable.Title>
            </DataTable.Header>
            {cashFlow.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{item.tipo_transacao}</DataTable.Cell>
                <DataTable.Cell numeric>{item.quantidade}</DataTable.Cell>
                <DataTable.Cell numeric>€{item.valor_total.toFixed(2)}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      {/* Resumo Mensal */}
      <Card style={styles.card}>
        <Card.Title title="Resumo Mensal (Últimos 12 meses)" titleStyle={styles.cardTitle} />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Mês</DataTable.Title>
              <DataTable.Title numeric>Compras</DataTable.Title>
              <DataTable.Title numeric>Receita</DataTable.Title>
            </DataTable.Header>
            {monthlyFinancial.map((item, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{new Date(item.mes).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</DataTable.Cell>
                <DataTable.Cell numeric>{item.compras_realizadas}</DataTable.Cell>
                <DataTable.Cell numeric>€{item.receita_total.toFixed(2)}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
  },
});

