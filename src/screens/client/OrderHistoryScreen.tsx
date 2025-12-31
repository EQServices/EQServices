import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, Platform, useWindowDimensions } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';
import { SkeletonCardList } from '../../components/SkeletonCard';

type FilterOption = 'all' | 'pending' | 'active' | 'completed' | 'cancelled';

export const OrderHistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const statusLabels: Record<FilterOption, string> = {
    all: t('orderHistory.all'),
    pending: t('orderHistory.status.pending'),
    active: t('orderHistory.status.active'),
    completed: t('orderHistory.status.completed'),
    cancelled: t('orderHistory.status.cancelled'),
  };
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
        category: row.categories?.[0] || row.category || '',
        categories: row.categories || (row.category ? [row.category] : []),
        title: row.title,
        description: row.description,
        location: row.location,
        budget: row.budget ?? undefined,
        photos: row.photos ?? [],
        status: row.status,
        completedAt: row.completed_at ?? null,
        createdAt: row.created_at,
        referenceNumber: row.reference_number ?? undefined,
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

  const handleRequestPress = (requestId: string) => {
    (navigation as any).navigate('ServiceRequestDetail', { requestId });
  };

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleRequestPress(item.id)}
    >
      <Card style={[styles.card, isMobile && styles.cardMobile]}>
        <Card.Content style={isMobile && styles.cardContentMobile}>
        <View style={[styles.cardHeader, isMobile && styles.cardHeaderMobile]}>
          <View style={[styles.titleRow, isMobile && styles.titleRowMobile]}>
            <Text style={[styles.title, isMobile && styles.titleMobile]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.referenceNumber && (
              <Chip 
                mode="outlined" 
                style={[styles.referenceChip, isMobile && styles.referenceChipMobile]} 
                textStyle={[styles.referenceChipText, isMobile && styles.referenceChipTextMobile]}
              >
                {item.referenceNumber}
              </Chip>
            )}
          </View>
          <Chip 
            mode="outlined" 
            style={isMobile && styles.statusChipMobile}
            textStyle={isMobile && styles.statusChipTextMobile}
          >
            {statusLabels[item.status as FilterOption] || item.status}
          </Chip>
        </View>
        <Text style={[styles.category, isMobile && styles.categoryMobile]}>
          {item.categories?.[0] || item.category || ''}
        </Text>
        <Text style={[styles.description, isMobile && styles.descriptionMobile]} numberOfLines={3}>
          {item.description}
        </Text>
        <View style={[styles.metaRow, isMobile && styles.metaRowMobile]}>
          <Text style={[styles.location, isMobile && styles.locationMobile]} numberOfLines={1}>
            {item.location}
          </Text>
          <Text style={[styles.date, isMobile && styles.dateMobile]}>
            {new Date(item.createdAt).toLocaleString('pt-PT', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {item.completedAt ? (
          <Text style={[styles.completedDate, isMobile && styles.completedDateMobile]}>
            {t('orderHistory.completedOn')} {new Date(item.completedAt).toLocaleDateString('pt-PT')}
          </Text>
        ) : null}
      </Card.Content>
    </Card>
    </TouchableOpacity>
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
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={[styles.filtersRow, isMobile && styles.filtersRowMobile]}
      >
        {(['all', 'pending', 'active', 'completed', 'cancelled'] as FilterOption[]).map((option) => (
          <Button
            key={option}
            mode={filter === option ? 'contained' : 'outlined'}
            onPress={() => setFilter(option)}
            style={[styles.filterButton, isMobile && styles.filterButtonMobile]}
            textColor={filter === option ? colors.textLight : colors.primary}
            buttonColor={filter === option ? colors.primary : undefined}
            labelStyle={isMobile && styles.filterButtonLabelMobile}
            compact={isMobile}
          >
            {isMobile ? (
              <Text style={styles.filterButtonTextMobile}>
                {statusLabels[option]} ({statusCounts[option]})
              </Text>
            ) : (
              `${statusLabels[option]} (${statusCounts[option]})`
            )}
          </Button>
        ))}
      </ScrollView>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, isMobile && styles.listMobile]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadRequests} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          loading ? (
            <SkeletonCardList />
          ) : (
            <View style={[styles.emptyContainer, isMobile && styles.emptyContainerMobile]}>
              <Text style={[styles.emptyText, isMobile && styles.emptyTextMobile]}>
                {t('orderHistory.empty')}
              </Text>
            </View>
          )
        }
        numColumns={isTablet ? 2 : 1}
        columnWrapperStyle={isTablet ? styles.columnWrapper : undefined}
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
    minHeight: 56,
  },
  filtersRowMobile: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  filterButton: {
    borderRadius: 24,
    minWidth: 100,
  },
  filterButtonMobile: {
    borderRadius: 20,
    minWidth: 80,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterButtonLabelMobile: {
    fontSize: 12,
  },
  filterButtonTextMobile: {
    fontSize: 12,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  listMobile: {
    padding: 12,
    gap: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    borderRadius: 16,
    elevation: 2,
    maxWidth: '100%',
  },
  cardMobile: {
    borderRadius: 12,
    elevation: 1,
  },
  cardContentMobile: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  cardHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 12,
  },
  titleRowMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 0,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flexShrink: 1,
  },
  titleMobile: {
    fontSize: 16,
    flex: 1,
    minWidth: 0,
  },
  referenceChip: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    flexShrink: 0,
  },
  referenceChipMobile: {
    height: 24,
  },
  referenceChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  referenceChipTextMobile: {
    fontSize: 10,
  },
  statusChipMobile: {
    alignSelf: 'flex-start',
    height: 28,
  },
  statusChipTextMobile: {
    fontSize: 11,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 4,
  },
  categoryMobile: {
    fontSize: 13,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  },
  descriptionMobile: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  metaRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 6,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  locationMobile: {
    fontSize: 11,
    width: '100%',
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  dateMobile: {
    fontSize: 11,
  },
  completedDate: {
    fontSize: 12,
    color: colors.success,
    marginTop: 4,
  },
  completedDateMobile: {
    fontSize: 11,
    marginTop: 6,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainerMobile: {
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyTextMobile: {
    fontSize: 13,
  },
});

export default OrderHistoryScreen;

