import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';

interface Order {
  id: string;
  title: string;
  category: string;
  status: string;
  budget: number | null;
  created_at: string;
  completed_at: string | null;
  cliente_email: string;
  cliente_nome: string;
  total_propostas: number;
  total_desbloqueios: number;
  total_avaliacoes: number;
}

export const AdminOrdersScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.isAdmin) {
      navigation.navigate('Login');
      return;
    }
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = orders.filter(
        (o) =>
          o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.cliente_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('admin_orders_summary').select('*').order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'active':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard}>
      <Card.Content>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>{item.title}</Text>
            <Text style={styles.orderCategory}>{item.category}</Text>
          </View>
          <Chip style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]} textStyle={styles.chipText}>
            {item.status}
          </Chip>
        </View>
        <Text style={styles.clientInfo}>Cliente: {item.cliente_nome} ({item.cliente_email})</Text>
        {item.budget && <Text style={styles.budgetText}>Orçamento: €{item.budget.toFixed(2)}</Text>}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Propostas: {item.total_propostas}</Text>
          <Text style={styles.statText}>Desbloqueios: {item.total_desbloqueios}</Text>
          <Text style={styles.statText}>Avaliações: {item.total_avaliacoes}</Text>
        </View>
        <Text style={styles.dateText}>Criado em: {new Date(item.created_at).toLocaleDateString('pt-PT')}</Text>
        {item.completed_at && (
          <Text style={styles.dateText}>Completado em: {new Date(item.completed_at).toLocaleDateString('pt-PT')}</Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating={true} color={colors.primary} size="large" />
        <Text style={styles.loadingText}>A carregar pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Pesquisar pedidos..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
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
  searchbar: {
    margin: 16,
    backgroundColor: colors.surface,
  },
  list: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: colors.surface,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
    marginRight: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  orderCategory: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusChip: {
    marginLeft: 8,
  },
  chipText: {
    color: colors.textLight,
  },
  clientInfo: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  budgetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

