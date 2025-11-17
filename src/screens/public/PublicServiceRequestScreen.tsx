import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';
import { colors } from '../../theme/colors';
import { ServiceRequest } from '../../types';
import { supabase } from '../../config/supabase';
import { ImageGallery } from '../../components/ImageGallery';

interface PublicServiceRequestScreenProps {
  navigation: any;
  route: {
    params: {
      serviceRequestId: string;
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

export const PublicServiceRequestScreen: React.FC<PublicServiceRequestScreenProps> = ({ navigation, route }) => {
  const { serviceRequestId } = route.params;
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequest();
  }, [serviceRequestId]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', serviceRequestId)
        .single();

      if (requestError) throw requestError;
      if (!data) {
        setError('Pedido não encontrado.');
        return;
      }

      setRequest(mapServiceRequest(data));
    } catch (err: any) {
      console.error('Erro ao carregar pedido:', err);
      setError(err.message || 'Não foi possível carregar o pedido.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Carregando pedido...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Pedido não encontrado.'}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>{request.title}</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusChipColor(request.status) }]}
              textStyle={styles.statusChipText}
            >
              {statusChipText(request.status)}
            </Chip>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Categoria:</Text>
            <Text style={styles.value}>{request.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Localização:</Text>
            <Text style={styles.value}>{request.location}</Text>
          </View>

          {request.budget && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Orçamento:</Text>
              <Text style={styles.value}>€{request.budget.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          {request.photos && request.photos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fotos</Text>
              <ImageGallery images={request.photos} />
            </View>
          )}

          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Quer responder a este pedido? Faça login ou crie uma conta de profissional.
            </Text>
            <View style={styles.buttonRow}>
              <Button mode="contained" onPress={handleLogin} style={styles.button}>
                Fazer Login
              </Button>
              <Button mode="outlined" onPress={handleRegister} style={styles.button}>
                Criar Conta
              </Button>
            </View>
          </View>
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 100,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  ctaSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  ctaText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

