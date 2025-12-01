import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, List, Text } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { MetricBar } from '../../components/Charts';
import { useNavigation } from '@react-navigation/native';
import { AppLogo } from '../../components/AppLogo';

interface RequestResume {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface ProposalResume {
  id: string;
  serviceRequestId: string;
  status: string;
  createdAt: string;
}

interface ReviewResume {
  id: string;
  rating: number;
  createdAt: string;
}

export const ClientDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestResume[]>([]);
  const [proposals, setProposals] = useState<ProposalResume[]>([]);
  const [reviews, setReviews] = useState<ReviewResume[]>([]);
  const [totals, setTotals] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    cancelledRequests: 0,
    proposalsReceived: 0,
    proposalsAccepted: 0,
    reviewsWritten: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data: requestsData, error: requestsError } = await supabase
          .from('service_requests')
          .select('id,title,status,created_at')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        const mappedRequests: RequestResume[] = (requestsData ?? []).map((item: any) => ({
          id: item.id,
          title: item.title,
          status: item.status,
          createdAt: item.created_at,
        }));
        setRequests(mappedRequests);

        const requestIds = mappedRequests.map((item) => item.id);
        let mappedProposals: ProposalResume[] = [];

        if (requestIds.length > 0) {
          const { data: proposalsData, error: proposalsError } = await supabase
            .from('proposals')
            .select('id, service_request_id, status, created_at')
            .in('service_request_id', requestIds);

          if (proposalsError) throw proposalsError;

          mappedProposals = (proposalsData ?? []).map((item: any) => ({
            id: item.id,
            serviceRequestId: item.service_request_id,
            status: item.status,
            createdAt: item.created_at,
          }));
          setProposals(mappedProposals);
        } else {
          setProposals([]);
        }

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('id,rating,created_at')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        const mappedReviews: ReviewResume[] = (reviewsData ?? []).map((item: any) => ({
          id: item.id,
          rating: item.rating,
          createdAt: item.created_at,
        }));
        setReviews(mappedReviews);

        const pendingRequests = mappedRequests.filter((request) => request.status === 'pending').length;
        const activeRequests = mappedRequests.filter((request) => request.status === 'active').length;
        const completedRequests = mappedRequests.filter((request) => request.status === 'completed').length;
        const cancelledRequests = mappedRequests.filter((request) => request.status === 'cancelled').length;

        const proposalsAccepted = mappedProposals.filter((proposal) => proposal.status === 'accepted').length;

        setTotals({
          totalRequests: mappedRequests.length,
          pendingRequests,
          activeRequests,
          completedRequests,
          cancelledRequests,
          proposalsReceived: mappedProposals.length,
          proposalsAccepted,
          reviewsWritten: mappedReviews.length,
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={colors.primary} />
        <Text style={styles.loaderText}>A carregar o seu dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <AppLogo size={150} withBackground />
      </View>
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Pedidos criados</Text>
            <Text style={styles.metricValue}>{totals.totalRequests}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Pedidos ativos</Text>
            <Text style={styles.metricValue}>{totals.activeRequests}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Pedidos concluídos</Text>
            <Text style={styles.metricValue}>{totals.completedRequests}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Propostas recebidas</Text>
            <Text style={styles.metricValue}>{totals.proposalsReceived}</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.quickActionsCard}>
        <Card.Content style={styles.quickActionsContent}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('ClientOrderHistory' as never)}
            textColor={colors.primary}
          >
            Ver histórico completo
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Propostas aceites</Text>
            <Text style={styles.metricValue}>{totals.proposalsAccepted}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Avaliações realizadas</Text>
            <Text style={styles.metricValue}>{totals.reviewsWritten}</Text>
          </Card.Content>
        </Card>
      </View>

      <MetricBar
        title="Taxa de conclusão de pedidos"
        current={totals.completedRequests}
        total={totals.totalRequests || 1}
        description="Proporção de pedidos concluídos em relação ao total criado."
      />
      <MetricBar
        title="Propostas aceites"
        current={totals.proposalsAccepted}
        total={totals.proposalsReceived || 1}
        description="Percentagem de propostas recebidas que foram aceites."
      />

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Pedidos recentes</Text>
          {requests.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não criou nenhum pedido.</Text>
          ) : (
            requests.slice(0, 5).map((request) => (
              <List.Item
                key={request.id}
                title={request.title}
                description={`${request.status} — ${new Date(request.createdAt).toLocaleDateString('pt-PT', {
                  dateStyle: 'medium',
                })}`}
                left={(props) => <List.Icon {...props} icon="clipboard-text" />}
              />
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Propostas recebidas</Text>
          {proposals.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não recebeu propostas dos profissionais.</Text>
          ) : (
            proposals.slice(0, 5).map((proposal) => (
              <List.Item
                key={proposal.id}
                title={`Proposta • ${proposal.status}`}
                description={`Recebida em ${new Date(proposal.createdAt).toLocaleDateString('pt-PT', {
                  dateStyle: 'medium',
                })}`}
                left={(props) => <List.Icon {...props} icon="email" />}
              />
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Avaliações realizadas</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não avaliou nenhum profissional.</Text>
          ) : (
            reviews.slice(0, 5).map((review) => (
              <List.Item
                key={review.id}
                title={`Avaliação • ${review.rating} estrelas`}
                description={`Enviada em ${new Date(review.createdAt).toLocaleDateString('pt-PT', {
                  dateStyle: 'medium',
                })}`}
                left={(props) => <List.Icon {...props} icon="star" />}
              />
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    maxWidth: '100%',
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
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sectionCard: {
    borderRadius: 16,
    elevation: 2,
  },
  quickActionsCard: {
    borderRadius: 16,
    elevation: 1,
  },
  quickActionsContent: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default ClientDashboardScreen;

