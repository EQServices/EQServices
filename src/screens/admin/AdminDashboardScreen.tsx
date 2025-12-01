import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Button, DataTable } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { AppLogo } from '../../components/AppLogo';

interface AdminStats {
  total_clientes: number;
  total_profissionais: number;
  total_pedidos: number;
  pedidos_pendentes: number;
  pedidos_completos: number;
  total_propostas: number;
  propostas_aceitas: number;
  total_leads_desbloqueados: number;
  receita_total: number;
  creditos_vendidos: number;
  creditos_em_circulacao: number;
}

interface CashFlow {
  tipo_transacao: string;
  quantidade: number;
  valor_total: number;
  creditos_total: number;
}

export const AdminDashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
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
      // Buscar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .from('admin_statistics')
        .select('*')
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Buscar fluxo de caixa
      const { data: cashFlowData, error: cashFlowError } = await supabase
        .from('admin_cash_flow')
        .select('*');

      if (cashFlowError) throw cashFlowError;
      setCashFlow(cashFlowData || []);
    } catch (error) {
      console.error('Erro ao buscar dados admin:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>A carregar dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <AppLogo size={200} withBackground />
        <Text style={styles.title}>Dashboard Administrativo</Text>
      </View>

      {/* Estatísticas Gerais */}
      <Card style={styles.card}>
        <Card.Title title="Estatísticas Gerais" titleStyle={styles.cardTitle} />
        <Card.Content>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.total_clientes || 0}</Text>
              <Text style={styles.statLabel}>Clientes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.total_profissionais || 0}</Text>
              <Text style={styles.statLabel}>Profissionais</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.total_pedidos || 0}</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.pedidos_pendentes || 0}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Fluxo de Caixa */}
      <Card style={styles.card}>
        <Card.Title title="Fluxo de Caixa" titleStyle={styles.cardTitle} />
        <Card.Content>
          {cashFlow.map((item, index) => (
            <View key={index} style={styles.cashFlowItem}>
              <Text style={styles.cashFlowType}>{item.tipo_transacao}</Text>
              <View style={styles.cashFlowDetails}>
                <Text style={styles.cashFlowValue}>€{item.valor_total.toFixed(2)}</Text>
                <Text style={styles.cashFlowQuantity}>{item.quantidade} transações</Text>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Receita Total:</Text>
            <Text style={styles.totalValue}>
              €{cashFlow.reduce((sum, item) => sum + item.valor_total, 0).toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Ações Rápidas */}
      <Card style={styles.card}>
        <Card.Title title="Ações Rápidas" titleStyle={styles.cardTitle} />
        <Card.Content>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AdminUsers')}
            style={styles.actionButton}
            icon="account-group"
          >
            Ver Usuários
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AdminOrders')}
            style={styles.actionButton}
            icon="clipboard-list"
          >
            Ver Pedidos
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AdminCashFlow')}
            style={styles.actionButton}
            icon="cash-multiple"
          >
            Ver Fluxo de Caixa
          </Button>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cashFlowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  cashFlowType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  cashFlowDetails: {
    alignItems: 'flex-end',
  },
  cashFlowValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.accent,
  },
  cashFlowQuantity: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.accent,
  },
  actionButton: {
    marginBottom: 8,
    backgroundColor: colors.primary,
  },
});

