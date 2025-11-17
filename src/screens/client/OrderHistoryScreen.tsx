import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';
import { SkeletonCardList } from '../../components/SkeletonCard';

type FilterOption = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

const statusLabels: Record<FilterOption, string> = {
  all: 'Todos',
  pending: 'Aguardando',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const OrderHistoryScreen: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('all');

  const loadRequests = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped: ServiceRequest[] = (data || []).map((row: any) => ({
        id: row.id,
        clientId: row.client_id,
        category: row.category,
        title: row.title,
        description: row.description,
        location: row.location,
        budget: row.budget ?? undefined,
        photos: row.photos ?? [],
        status: row.status,
        completedAt: row.completed_at ?? null,
        createdAt: row.created_at,
      }));
      setRequests(mapped);
    } catch (error) {
      console.error('Erro ao carregar histórico de pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    if (filter === 'all') {
      return requests;
    }
    return requests.filter((request) => request.status === filter);
  }, [requests, filter]);

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{item.title}</Text>
          <Chip mode="outlined">{statusLabels[item.status as FilterOption] || item.status}</Chip>
        </View>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString('pt-PT')}</Text>
        {item.completedAt ? (
          <Text style={styles.completedDate}>
            Concluído em {new Date(item.completedAt).toLocaleDateString('pt-PT', { dateStyle: 'medium' })}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
  );

  const statusCounts = useMemo(() => {
    const base = {
      all: requests.length,
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
    };

    requests.forEach((request) => {
      if (request.status in base) {
        base[request.status as FilterOption] += 1;
      }
    });

    return base;
  }, [requests]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {(['all', 'pending', 'active', 'completed', 'cancelled'] as FilterOption[]).map((option) => (
          <Button
            key={option}
            mode={filter === option ? 'contained' : 'outlined'}
            onPress={() => setFilter(option)}
            style={styles.filterButton}
            textColor={filter === option ? colors.textLight : colors.primary}
            buttonColor={filter === option ? colors.primary : undefined}
          >
            {statusLabels[option]} ({statusCounts[option]})
          </Button>
        ))}
      </ScrollView>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          loading ? (
            <SkeletonCardList />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum pedido para o filtro selecionado.</Text>
            </View>
          )
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
  filtersRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  filterButton: {
    borderRadius: 24,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  completedDate: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default OrderHistoryScreen;

