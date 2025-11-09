import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, List, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { Proposal, Review, ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';
import { ensureConversation } from '../../services/chat';
import { useAuth } from '../../contexts/AuthContext';
import { RatingStars } from '../../components/RatingStars';
import {
  getClientReviewForRequest,
  getProfessionalReviewSummary,
  ReviewSummary,
} from '../../services/reviews';
import { ImageGallery } from '../../components/ImageGallery';

interface ServiceRequestDetailScreenProps {
  navigation: any;
  route: {
    params: {
      requestId: string;
    };
  };
}

const mapServiceRequest = (row: any): ServiceRequest => ({
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
});

const mapProposal = (row: any): Proposal => ({
  id: row.id,
  serviceRequestId: row.service_request_id,
  professionalId: row.professional_id,
  price: Number(row.price),
  description: row.description,
  estimatedDuration: row.estimated_duration ?? undefined,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? undefined,
  professionalName:
    row.professional?.users?.name ??
    row.professional?.name ??
    undefined,
});

const statusChipColor = (status: string) => {
  switch (status) {
    case 'pending':
      return colors.warning;
    case 'active':
      return colors.info;
    case 'completed':
      return colors.success;
    case 'cancelled':
      return colors.error;
    default:
      return colors.textSecondary;
  }
};

const statusChipText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Aguardando';
    case 'active':
      return 'Ativo';
    case 'completed':
      return 'Concluído';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

export const ServiceRequestDetailScreen: React.FC<ServiceRequestDetailScreenProps> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [ratingSummaries, setRatingSummaries] = useState<Record<string, ReviewSummary>>({});
  const [clientReview, setClientReview] = useState<Review | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const { user } = useAuth();
  const tabNavigator = navigation.getParent();
  const handleStartChat = async (professionalId: string) => {
    if (!user?.id || !request) return;
    try {
      setActionLoading(`chat-${professionalId}`);
      const conversationId = await ensureConversation(request.id, request.clientId, professionalId);
      if (tabNavigator?.navigate) {
        tabNavigator.navigate('ClientChat', {
          screen: 'ChatConversation',
          params: {
            conversationId,
          },
        });
      } else {
        navigation.navigate('ChatConversation', { conversationId });
      }
    } catch (err) {
      console.error('Erro ao iniciar chat:', err);
      alert('Não foi possível abrir a conversa.');
    } finally {
      setActionLoading(null);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRatingSummaries({});

      const [{ data: requestData, error: requestError }, { data: proposalsData, error: proposalsError }] =
        await Promise.all([
          supabase.from('service_requests').select('*').eq('id', requestId).single(),
          supabase
            .from('proposals')
            .select('*, professional:professional_id(id, name, users(name))')
            .eq('service_request_id', requestId)
            .order('created_at', { ascending: false }),
        ]);

      if (requestError) throw requestError;
      if (!requestData) {
        setRequest(null);
        return;
      }

      setRequest(mapServiceRequest(requestData));

      if (proposalsError) {
        console.warn('Erro ao carregar propostas:', proposalsError);
      }

      const mappedProposals = (proposalsData || []).map(mapProposal);
      setProposals(mappedProposals);

      if (mappedProposals.length > 0) {
        const uniqueProfessionalIds = Array.from(new Set(mappedProposals.map((proposal) => proposal.professionalId)));
        const summaryEntries = await Promise.all(
          uniqueProfessionalIds.map(async (professionalId) => {
            try {
              const summary = await getProfessionalReviewSummary(professionalId);
              return [professionalId, summary] as [string, ReviewSummary];
            } catch (summaryError) {
              console.warn('Erro ao carregar resumo de avaliações:', summaryError);
              return null;
            }
          }),
        );

        const summaries: Record<string, ReviewSummary> = {};
        summaryEntries.forEach((entry) => {
          if (entry) {
            const [professionalId, summary] = entry;
            summaries[professionalId] = summary;
          }
        });

        setRatingSummaries(summaries);
      } else {
        setRatingSummaries({});
      }

      if (user?.id) {
        try {
          const review = await getClientReviewForRequest(requestId, user.id);
          setClientReview(review);
        } catch (reviewError) {
          console.warn('Erro ao carregar avaliação do cliente:', reviewError);
          setClientReview(null);
        }
      } else {
        setClientReview(null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar detalhes do pedido:', err);
      setError(err.message || 'Erro inesperado ao carregar o pedido.');
    } finally {
      setLoading(false);
    }
  }, [requestId, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const isOwner = user?.id && request?.clientId === user.id;
  const acceptedProposal = useMemo(
    () => proposals.find((proposal) => proposal.status === 'accepted'),
    [proposals],
  );

  const filteredProposals = useMemo(() => {
    if (!ratingFilter) {
      return proposals;
    }

    return proposals.filter((proposal) => {
      const summary = ratingSummaries[proposal.professionalId];
      return summary ? summary.average >= ratingFilter : false;
    });
  }, [proposals, ratingSummaries, ratingFilter]);

  const handleOpenReview = () => {
    if (!request || !acceptedProposal) return;

    navigation.navigate('Review', {
      serviceRequestId: request.id,
      professionalId: acceptedProposal.professionalId,
      professionalName: acceptedProposal.professionalName,
    });
  };

  const handleViewProfile = (proposal: Proposal) => {
    navigation.navigate('ProfessionalProfile', {
      professionalId: proposal.professionalId,
      professionalName: proposal.professionalName,
    });
  };

  const handleProposalAction = async (proposal: Proposal, action: 'accept' | 'reject') => {
    if (!isOwner) {
      alert('Apenas o cliente responsável pelo pedido pode gerir propostas.');
      return;
    }

    setActionLoading(proposal.id + action);

    try {
      const now = new Date().toISOString();

      if (action === 'accept') {
        const { error: acceptError } = await supabase
          .from('proposals')
          .update({ status: 'accepted', updated_at: now })
          .eq('id', proposal.id);

        if (acceptError) throw acceptError;

        const { error: rejectOthersError } = await supabase
          .from('proposals')
          .update({ status: 'rejected', updated_at: now })
          .eq('service_request_id', requestId)
          .neq('id', proposal.id)
          .eq('status', 'pending');

        if (rejectOthersError) throw rejectOthersError;

        const { error: updateRequestError } = await supabase
          .from('service_requests')
          .update({ status: 'active', updated_at: now })
          .eq('id', requestId);

        if (updateRequestError) throw updateRequestError;

        alert('Proposta aceite! Entre em contacto com o profissional para alinharem os próximos passos.');
      } else {
        const { error: rejectError } = await supabase
          .from('proposals')
          .update({ status: 'rejected', updated_at: now })
          .eq('id', proposal.id);

        if (rejectError) throw rejectError;

        alert('Proposta rejeitada.');
      }

      await loadData();
    } catch (actionErr: any) {
      console.error('Erro ao atualizar proposta:', actionErr);
      alert(actionErr.message || 'Não foi possível atualizar a proposta.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCompleted = async () => {
    if (!isOwner || !request || !acceptedProposal) return;

    try {
      setCompleting(true);
      const now = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({
          status: 'completed',
          completed_at: now,
          updated_at: now,
        })
        .eq('id', request.id)
        .eq('client_id', user.id);

      if (updateError) throw updateError;

      alert('Pedido marcado como concluído.');
      await loadData();
    } catch (updateErr: any) {
      console.error('Erro ao concluir pedido:', updateErr);
      alert(updateErr.message || 'Não foi possível marcar o serviço como concluído.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button mode="contained" onPress={loadData} style={styles.retryButton} buttonColor={colors.primary}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Pedido não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{request.title}</Text>
              <Text style={styles.category}>{request.category}</Text>
            </View>
            <Chip style={{ backgroundColor: statusChipColor(request.status) }} textStyle={{ color: colors.textLight }}>
              {statusChipText(request.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionLabel}>Descrição</Text>
          <Text style={styles.description}>{request.description}</Text>

          <Text style={styles.sectionLabel}>Localização</Text>
          <Text style={styles.bodyText}>{request.location}</Text>

          {request.photos && request.photos.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>Fotos</Text>
              <ImageGallery images={request.photos} />
            </>
          ) : null}

          {typeof request.budget === 'number' && (
            <>
              <Text style={styles.sectionLabel}>Orçamento estimado</Text>
              <Text style={styles.bodyText}>€ {request.budget.toFixed(2)}</Text>
            </>
          )}

          <Text style={styles.sectionLabel}>Criado em</Text>
          <Text style={styles.bodyText}>
            {new Date(request.createdAt).toLocaleString('pt-PT', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </Text>
          {request.completedAt ? (
            <>
              <Text style={styles.sectionLabel}>Concluído em</Text>
              <Text style={styles.bodyText}>
                {new Date(request.completedAt).toLocaleString('pt-PT', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </Text>
            </>
          ) : null}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Propostas recebidas</Text>

          {proposals.length > 0 ? (
            <View style={styles.filterRow}>
              {[
                { label: 'Todas', value: null },
                { label: '≥ 4★', value: 4 },
                { label: '≥ 3★', value: 3 },
              ].map((option) => (
                <Chip
                  key={option.label}
                  selected={ratingFilter === option.value || (!ratingFilter && option.value === null)}
                  onPress={() => setRatingFilter(option.value)}
                  style={styles.filterChip}
                >
                  {option.label}
                </Chip>
              ))}
            </View>
          ) : null}

          {proposals.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma proposta enviada ainda.</Text>
          ) : filteredProposals.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma proposta corresponde ao filtro selecionado.</Text>
          ) : (
            <List.Section>
              {filteredProposals.map((proposal) => {
                const summary = ratingSummaries[proposal.professionalId];
                return (
                <Card key={proposal.id} style={styles.proposalCard}>
                  <Card.Content>
                    <View style={styles.proposalHeader}>
                      <Text style={styles.proposalPrice}>€ {proposal.price.toFixed(2)}</Text>
                      <Chip>{statusChipText(proposal.status)}</Chip>
                    </View>
                    {proposal.professionalName ? (
                      <Text style={styles.proposalMeta}>Profissional: {proposal.professionalName}</Text>
                    ) : null}
                    {summary ? (
                      <View style={styles.reviewSummaryRow}>
                        <RatingStars rating={summary.average} size={20} />
                        <Text style={styles.reviewSummaryText}>
                          {summary.average.toFixed(1)} ★ ({summary.count} avaliação{summary.count === 1 ? '' : 's'})
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.reviewSummaryPlaceholder}>Sem avaliações registradas ainda.</Text>
                    )}
                    <Text style={styles.proposalDescription}>{proposal.description}</Text>
                    {proposal.estimatedDuration ? (
                      <Text style={styles.proposalMeta}>Duração estimada: {proposal.estimatedDuration}</Text>
                    ) : null}
                    <Text style={styles.proposalMeta}>
                      Recebida em {new Date(proposal.createdAt).toLocaleDateString('pt-PT')}
                    </Text>

                    <Button
                      mode="text"
                      onPress={() => handleViewProfile(proposal)}
                      textColor={colors.primary}
                      style={styles.profileButton}
                    >
                      Ver perfil completo
                    </Button>

                    {isOwner && request?.status !== 'completed' ? (
                      <View style={styles.actionsRow}>
                        <Button
                          mode="contained"
                          buttonColor={colors.success}
                          onPress={() => handleProposalAction(proposal, 'accept')}
                          disabled={proposal.status === 'accepted' || actionLoading !== null}
                          loading={actionLoading === proposal.id + 'accept'}
                          style={styles.actionButton}
                        >
                          Aceitar
                        </Button>
                        <Button
                          mode="outlined"
                          textColor={colors.error}
                          onPress={() => handleProposalAction(proposal, 'reject')}
                          disabled={proposal.status !== 'pending' || actionLoading !== null}
                          loading={actionLoading === proposal.id + 'reject'}
                          style={styles.actionButton}
                        >
                          Rejeitar
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => handleStartChat(proposal.professionalId)}
                          loading={actionLoading === `chat-${proposal.professionalId}`}
                          disabled={actionLoading !== null && actionLoading !== `chat-${proposal.professionalId}`}
                          style={styles.actionButton}
                        >
                          Conversar
                        </Button>
                      </View>
                    ) : null}
                  </Card.Content>
                </Card>
              );
              })}
            </List.Section>
          )}

          {isOwner && acceptedProposal ? (
            <View style={styles.reviewActions}>
              {request.status === 'active' ? (
                <Button
                  mode="outlined"
                  textColor={colors.success}
                  onPress={handleMarkCompleted}
                  loading={completing}
                  disabled={completing}
                  style={styles.reviewButton}
                >
                  Marcar serviço como concluído
                </Button>
              ) : request.status === 'completed' ? (
                <Text style={styles.completionText}>
                  Este serviço foi marcado como concluído. Obrigado por utilizar a Elastiquality!
                </Text>
              ) : null}
              {clientReview ? (
                <Text style={styles.reviewInfo}>Obrigado! A sua avaliação já foi registada para este profissional.</Text>
              ) : (
                <Button
                  mode="contained"
                  onPress={handleOpenReview}
                  buttonColor={colors.primary}
                  style={styles.reviewButton}
                >
                  Avaliar profissional
                </Button>
              )}
            </View>
          ) : null}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  category: {
    fontSize: 14,
    color: colors.primary,
  },
  divider: {
    marginVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: colors.surface,
  },
  proposalDescription: {
    fontSize: 14,
    color: colors.text,
    marginVertical: 10,
    lineHeight: 20,
  },
  proposalMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  proposalCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
  },
  proposalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  proposalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  reviewSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  reviewSummaryText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  reviewSummaryPlaceholder: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  profileButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
  error: {
    fontSize: 16,
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
  },
  reviewActions: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  reviewButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  reviewInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
  },
});


