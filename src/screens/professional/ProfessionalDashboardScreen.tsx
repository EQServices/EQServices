import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Card, List, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { MetricBar } from '../../components/Charts';
import { useRequireUserType } from '../../hooks/useRequireUserType';
import { AppLogo } from '../../components/AppLogo';

interface TransactionSummary {
  id: string;
  type: 'purchase' | 'debit' | 'refund';
  amount: number;
  description?: string | null;
  createdAt: string;
}

interface LeadSummary {
  id: string;
  leadId: string;
  category?: string | null;
  cost: number;
  location?: string | null;
  description?: string | null;
  createdAt: string;
}

interface ProposalSummary {
  id: string;
  status: string;
  createdAt: string;
  serviceRequestId?: string;
  serviceRequestTitle?: string;
  serviceRequestStatus?: string;
}

export const ProfessionalDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, isValid } = useRequireUserType('professional');
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [leadsUnlocked, setLeadsUnlocked] = useState<LeadSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [totals, setTotals] = useState({
    leadsUnlocked: 0,
    proposalsSent: 0,
    proposalsAccepted: 0,
    creditsPurchased: 0,
    creditsSpent: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [
          { data: professionalData, error: professionalError },
          { data: transactionsData, error: transactionsError },
          { data: unlockedData, error: unlockedError },
          { data: proposalsData, error: proposalsError },
        ] = await Promise.all([
          supabase
            .from('professionals')
            .select('credits')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('credit_transactions')
            .select('id,type,amount,description,created_at')
            .eq('professional_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('unlocked_leads')
            .select(
              `
              id,
              lead_id,
              cost,
              unlocked_at,
              lead:leads (
                id,
                category,
                location,
                description
              )
            `,
            )
            .eq('professional_id', user.id)
            .order('unlocked_at', { ascending: false })
            .limit(10),
          supabase
            .from('proposals')
            .select(`
              id,
              status,
              created_at,
              service_request_id,
              service_requests:service_request_id (
                id,
                title,
                status
              )
            `)
            .eq('professional_id', user.id),
        ]);

        if (professionalError) throw professionalError;
        if (transactionsError) throw transactionsError;
        if (unlockedError) throw unlockedError;
        if (proposalsError) throw proposalsError;

        setCredits(professionalData?.credits ?? 0);

        const normalizedTransactions: TransactionSummary[] = (transactionsData ?? []).map((item: any) => ({
          id: item.id,
          type: item.type,
          amount: item.amount,
          description: item.description,
          createdAt: item.created_at,
        }));
        setTransactions(normalizedTransactions);

        const normalizedLeads: LeadSummary[] = (unlockedData ?? []).map((item: any) => ({
          id: item.id,
          leadId: item.lead_id,
          category: item.lead?.category,
          cost: item.cost,
          location: item.lead?.location,
          description: item.lead?.description,
          createdAt: item.unlocked_at || item.created_at, // Usar unlocked_at, fallback para created_at se existir
        }));
        setLeadsUnlocked(normalizedLeads);

        const normalizedProposals: ProposalSummary[] = (proposalsData ?? []).map((item: any) => ({
          id: item.id,
          status: item.status,
          createdAt: item.created_at,
          serviceRequestId: item.service_request_id,
          serviceRequestTitle: item.service_requests?.title,
          serviceRequestStatus: item.service_requests?.status,
        }));
        setProposals(normalizedProposals);

        const creditsPurchased = normalizedTransactions
          .filter((transaction) => transaction.type === 'purchase')
          .reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);

        const creditsSpent = normalizedTransactions
          .filter((transaction) => transaction.type === 'debit')
          .reduce((sum, transaction) => sum + Math.abs(transaction.amount ?? 0), 0);

        const proposalsSent = normalizedProposals.length;
        const proposalsAccepted = normalizedProposals.filter((proposal) => proposal.status === 'accepted').length;

        setTotals({
          leadsUnlocked: normalizedLeads.length,
          proposalsSent,
          proposalsAccepted,
          creditsPurchased,
          creditsSpent,
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard profissional:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Se não for profissional válido, não renderizar conteúdo
  if (!isValid) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator animating color={colors.professional} />
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
            <Text style={styles.metricLabel}>Créditos atuais</Text>
            <Text style={styles.metricValue}>{credits}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Créditos comprados</Text>
            <Text style={styles.metricValue}>{totals.creditsPurchased}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Créditos gastos</Text>
            <Text style={styles.metricValue}>{totals.creditsSpent}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Leads desbloqueados</Text>
            <Text style={styles.metricValue}>{totals.leadsUnlocked}</Text>
          </Card.Content>
        </Card>
      </View>

      <MetricBar
        title="Taxa de propostas aceites"
        current={totals.proposalsAccepted}
        total={totals.proposalsSent || 1}
        description="Comparativo entre propostas enviadas e aceites."
      />
      <MetricBar
        title="Créditos gastos vs. comprados"
        current={totals.creditsSpent}
        total={totals.creditsPurchased || 1}
        description="Percentagem de créditos já utilizados."
      />

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Propostas enviadas</Text>
            <Text style={styles.metricValue}>{totals.proposalsSent}</Text>
          </Card.Content>
        </Card>
        <Card style={styles.metricCard}>
          <Card.Content>
            <Text style={styles.metricLabel}>Propostas aceites</Text>
            <Text style={styles.metricValue}>{totals.proposalsAccepted}</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Transações recentes</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não existem transações registadas.</Text>
          ) : (
            transactions.map((transaction) => (
              <List.Item
                key={transaction.id}
                title={`${transaction.type === 'purchase' ? 'Compra' : transaction.type === 'debit' ? 'Débito' : 'Ajuste'}: ${transaction.amount} moedas`}
                description={
                  transaction.description || `Registado em ${new Date(transaction.createdAt).toLocaleString('pt-PT')}`
                }
                left={(props) => <List.Icon {...props} icon={transaction.type === 'purchase' ? 'plus-circle' : 'minus-circle'} />}
              />
            ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Pedidos aceitos</Text>
          {proposals.filter((p) => p.status === 'accepted').length === 0 ? (
            <Text style={styles.emptyText}>Ainda não tem pedidos aceitos.</Text>
          ) : (
            proposals
              .filter((p) => p.status === 'accepted')
              .slice(0, 5)
              .map((proposal) => (
                <TouchableOpacity
                  key={proposal.id}
                  onPress={() => {
                    if (proposal.serviceRequestId) {
                      // Buscar o lead associado ao service_request
                      supabase
                        .from('leads')
                        .select('id')
                        .eq('service_request_id', proposal.serviceRequestId)
                        .maybeSingle()
                        .then(({ data: leadData }) => {
                          if (leadData) {
                            navigation.navigate('LeadDetail' as never, { leadId: leadData.id } as never);
                          }
                        });
                    }
                  }}
                >
                  <List.Item
                    title={proposal.serviceRequestTitle || 'Pedido aceito'}
                    description={`Status: ${proposal.serviceRequestStatus || 'active'}\nAceito em ${new Date(proposal.createdAt).toLocaleString('pt-PT')}`}
                    left={(props) => <List.Icon {...props} icon="check-circle" color={colors.success} />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                  />
                </TouchableOpacity>
              ))
          )}
        </Card.Content>
      </Card>

      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Leads desbloqueados recentemente</Text>
          {leadsUnlocked.length === 0 ? (
            <Text style={styles.emptyText}>Ainda não desbloqueou leads.</Text>
          ) : (
            leadsUnlocked.map((lead) => (
              <TouchableOpacity
                key={lead.id}
                onPress={() => {
                  navigation.navigate('LeadDetail' as never, { leadId: lead.leadId } as never);
                }}
              >
                <List.Item
                  title={`${lead.category || 'Serviço'} — ${lead.cost} moedas`}
                  description={
                    lead.location
                      ? `${lead.location}\n${new Date(lead.createdAt).toLocaleString('pt-PT')}`
                      : new Date(lead.createdAt).toLocaleString('pt-PT')
                  }
                  left={(props) => <List.Icon {...props} icon="briefcase" />}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                />
              </TouchableOpacity>
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
    color: colors.professional,
  },
  sectionCard: {
    borderRadius: 16,
    elevation: 2,
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

export default ProfessionalDashboardScreen;

