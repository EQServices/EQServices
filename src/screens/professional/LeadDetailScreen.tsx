import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, List, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';
import { colors } from '../../theme/colors';
import { Lead, ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ensureConversation } from '../../services/chat';
import { ImageGallery } from '../../components/ImageGallery';
import { useRequireUserType } from '../../hooks/useRequireUserType';

interface LeadDetailScreenProps {
  navigation: any;
  route: {
    params: {
      leadId: string;
      serviceRequestId?: string;
      refresh?: number;
    };
  };
}

const mapLead = (row: any): Lead => ({
  id: row.id,
  serviceRequestId: row.service_request_id,
  category: row.category,
  cost: row.cost,
  location: row.location,
  description: row.description,
  createdAt: row.created_at,
});

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

export const LeadDetailScreen: React.FC<LeadDetailScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { leadId, serviceRequestId: routeServiceRequestId } = route.params;
  const { user, isValid } = useRequireUserType('professional');
  const [lead, setLead] = useState<Lead | null>(null);
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string | null>(null);

  const serviceRequestId = routeServiceRequestId || lead?.serviceRequestId || '';

  const handleStartChat = async () => {
    if (!lead || !serviceRequest || !user?.id) return;

    try {
      const conversationId = await ensureConversation(serviceRequest.id, serviceRequest.clientId, user.id);
      const parent = navigation.getParent();
      if (parent?.navigate) {
        parent.navigate('ProfessionalChat', {
          screen: 'ProChatConversation',
          params: {
            conversationId,
          },
        });
      } else {
        navigation.navigate('ProChatConversation', { conversationId });
      }
    } catch (err) {
      console.error('Erro ao iniciar conversa:', err);
      alert('Não foi possível iniciar a conversa.');
    }
  };

  const loadLead = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: leadData, error: leadError } = await supabase.from('leads').select('*').eq('id', leadId).single();

      if (leadError) throw leadError;
      if (!leadData) {
        setLead(null);
        return;
      }

      const mappedLead = mapLead(leadData);
      const finalLead = { ...mappedLead };
      setLead(finalLead);

      if (!finalLead.serviceRequestId) {
        setServiceRequest(null);
        return;
      }

      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', finalLead.serviceRequestId)
        .single();

      if (requestError) throw requestError;

      setServiceRequest(requestData ? mapServiceRequest(requestData) : null);

      if (user?.id) {
        const { data: existingProposal, error: existingError } = await supabase
          .from('proposals')
          .select('status')
          .eq('service_request_id', finalLead.serviceRequestId)
          .eq('professional_id', user.id)
          .maybeSingle();

        if (existingError && existingError.code !== 'PGRST116') {
          console.error('[DEBUG LeadDetail] Erro ao buscar proposta:', existingError);
          throw existingError;
        }

        console.log('[DEBUG LeadDetail] Proposta encontrada:', existingProposal);
        console.log('[DEBUG LeadDetail] Status da proposta:', existingProposal?.status);
        setProposalStatus(existingProposal?.status ?? null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar detalhes do lead:', err);
      setError(err.message || 'Erro inesperado ao carregar o lead.');
    } finally {
      setLoading(false);
    }
  }, [leadId, user?.id]);

  useEffect(() => {
    loadLead();
  }, [loadLead, route.params?.refresh]);

  // Se não for profissional válido, não renderizar conteúdo
  if (!isValid) {
    return null;
  }

  const handleSendProposal = () => {
    if (!serviceRequestId) {
      alert('Não foi possível identificar o pedido associado a este lead.');
      return;
    }

    navigation.navigate('SendProposal', {
      leadId,
      serviceRequestId,
    });
  };

  const handleMarkCompleted = async () => {
    if (!serviceRequest || proposalStatus !== 'accepted') return;

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
        .eq('id', serviceRequest.id);

      if (updateError) throw updateError;

      alert('Serviço marcado como concluído.');
      loadLead();
    } catch (updateErr: any) {
      console.error('Erro ao concluir serviço:', updateErr);
      alert(updateErr.message || 'Não foi possível concluir o serviço.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" color={colors.professional} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button mode="contained" onPress={loadLead} buttonColor={colors.professional} style={styles.retryButton}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>{t('professional.leadDetail.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{lead.category}</Text>
          <Text style={styles.subtitle}>{t('professional.leadDetail.cost', { cost: lead.cost })}</Text>

          <Divider style={styles.divider} />

          <Text style={styles.sectionLabel}>{t('professional.leadDetail.summaryDescription')}</Text>
          <Text style={styles.bodyText}>{lead.description}</Text>

          <Text style={styles.sectionLabel}>{t('professional.leadDetail.location')}</Text>
          <Text style={styles.bodyText}>{lead.location}</Text>

          {serviceRequest?.photos && serviceRequest.photos.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>{t('professional.leadDetail.clientPhotos')}</Text>
              <ImageGallery images={serviceRequest.photos} />
            </>
          ) : null}

          {lead.createdAt ? (
            <>
              <Text style={styles.sectionLabel}>{t('professional.leadDetail.createdAt')}</Text>
              <Text style={styles.bodyText}>
                {new Date(lead.createdAt).toLocaleString(i18n.language || 'pt-PT', { dateStyle: 'long', timeStyle: 'short' })}
              </Text>
            </>
          ) : null}

          <Button
            mode="contained"
            onPress={handleStartChat}
            style={styles.proposalButton}
            buttonColor={colors.secondary}
            disabled={!serviceRequest}
          >
            {t('professional.leadDetail.chatWithClient')}
          </Button>

          <Button
            mode="contained"
            onPress={handleSendProposal}
            style={styles.proposalButton}
            buttonColor={colors.secondary}
            disabled={!user?.id || !!proposalStatus}
          >
            {proposalStatus 
              ? (proposalStatus === 'pending' 
                  ? 'Proposta Enviada'
                  : proposalStatus === 'accepted' 
                    ? t('professional.leadDetail.proposalStatus', { status: t('client.requestDetail.status.active') })
                    : proposalStatus === 'rejected'
                      ? 'Proposta Rejeitada'
                      : 'Proposta Enviada')
              : t('professional.leadDetail.sendProposal')}
          </Button>
          {proposalStatus === 'accepted' ? (
            <Text style={styles.infoText}>
              Esta proposta já foi aceite pelo cliente. Verifique o contacto disponibilizado.
            </Text>
          ) : null}
          {proposalStatus === 'accepted' && serviceRequest?.status === 'active' ? (
            <Button
              mode="outlined"
              onPress={handleMarkCompleted}
              textColor={colors.success}
              style={styles.proposalButton}
              loading={completing}
              disabled={completing}
            >
              Marcar serviço como concluído
            </Button>
          ) : null}
          {serviceRequest?.status === 'completed' && serviceRequest.completedAt ? (
            <Text style={styles.successInfo}>
              Serviço concluído em{' '}
              {new Date(serviceRequest.completedAt).toLocaleString('pt-PT', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
            </Text>
          ) : null}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Detalhes completos do pedido</Text>
          {!serviceRequest ? (
            <Text style={styles.emptyText}>Não foi possível carregar o pedido associado.</Text>
          ) : (
            <List.Section>
              <List.Item
                title={serviceRequest.title}
                description={() => (
                  <View>
                    <Text style={styles.bodyText}>{serviceRequest.description}</Text>
                    <Text style={styles.meta}>
                      Localização: {serviceRequest.location}
                    </Text>
                    <Text style={styles.meta}>
                      Situação: {serviceRequest.status}
                    </Text>
                    {serviceRequest.completedAt ? (
                      <Text style={styles.meta}>
                        Concluído em:{' '}
                        {new Date(serviceRequest.completedAt).toLocaleString('pt-PT', {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        })}
                      </Text>
                    ) : null}
                    <Text style={styles.meta}>
                      Criado em:{' '}
                      {new Date(serviceRequest.createdAt).toLocaleDateString('pt-PT', {
                        dateStyle: 'long',
                      })}
                    </Text>
                    {typeof serviceRequest.budget === 'number' ? (
                      <Text style={styles.meta}>Orçamento estimado: € {serviceRequest.budget.toFixed(2)}</Text>
                    ) : null}
                  </View>
                )}
                left={() => <List.Icon icon="clipboard-text" color={colors.professional} />}
              />
            </List.Section>
          )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
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
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  proposalButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  infoText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
  successInfo: {
    marginTop: 8,
    fontSize: 12,
    color: colors.success,
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
});


