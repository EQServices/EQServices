import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, TextInput, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { useRequireUserType } from '../../hooks/useRequireUserType';
import { notifyProposalSubmitted } from '../../services/notifications';

interface SendProposalScreenProps {
  navigation: any;
  route: {
    params: {
      leadId: string;
      serviceRequestId: string;
    };
  };
}

export const SendProposalScreen: React.FC<SendProposalScreenProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user, isValid } = useRequireUserType('professional');
  const { leadId, serviceRequestId } = route.params;

  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!user?.id) {
      setError('Sessão inválida. Faça login novamente.');
      return;
    }

    // Limpar erros anteriores
    setFieldErrors({});
    setError(null);

    // Validar campos obrigatórios e identificar quais estão faltando
    const missingFields: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!price.trim()) {
      missingFields.push('Valor da proposta');
      newFieldErrors.price = 'Campo obrigatório';
    } else {
      const parsedPrice = Number(price.replace(',', '.'));
      if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
        missingFields.push(t('professional.sendProposal.priceLabel'));
        newFieldErrors.price = t('professional.sendProposal.invalidPrice');
      }
    }

    if (!description.trim()) {
      missingFields.push(t('professional.sendProposal.descriptionLabel'));
      newFieldErrors.description = t('client.newRequest.requiredField');
    }

    if (missingFields.length > 0) {
      setFieldErrors(newFieldErrors);
      setError(t('client.newRequest.fillFields', { fields: missingFields.join(', ') }));
      return;
    }

    const parsedPrice = Number(price.replace(',', '.'));

    setLoading(true);
    setError(null);

    try {
      const { data: requestStatus, error: requestError } = await supabase
        .from('service_requests')
        .select('status, client_id, title')
        .eq('id', serviceRequestId)
        .maybeSingle();

      if (requestError) throw requestError;
      if (!requestStatus) {
        throw new Error(t('professional.sendProposal.requestNotFound'));
      }

      if (requestStatus.status !== 'pending') {
        throw new Error(t('professional.sendProposal.requestNotAccepting'));
      }

      const { error: insertError } = await supabase.from('proposals').insert({
        service_request_id: serviceRequestId,
        professional_id: user.id,
        price: parsedPrice,
        description: description.trim(),
        estimated_duration: estimatedDuration ? estimatedDuration.trim() : null,
        status: 'pending',
      });

      if (insertError) throw insertError;

      await notifyProposalSubmitted({
        clientId: requestStatus.client_id,
        professionalName: user.name,
        serviceTitle: requestStatus.title,
        serviceRequestId,
      });

      alert('Proposta enviada com sucesso!');
      navigation.navigate('LeadDetail', { leadId, serviceRequestId, refresh: Date.now() });
    } catch (insertErr: any) {
      console.error('Erro ao enviar proposta:', insertErr);
      setError(insertErr.message || 'Erro inesperado ao enviar proposta.');
    } finally {
      setLoading(false);
    }
  };

  // Se não for profissional válido, não renderizar conteúdo
  if (!isValid) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>{t('professional.sendProposal.title')}</Text>
            <Text style={styles.subtitle}>
              {t('professional.sendProposal.subtitle')}
            </Text>

            <TextInput
              label={t('professional.sendProposal.priceLabel')}
              value={price}
              onChangeText={(text) => {
                setPrice(text);
                if (fieldErrors.price) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.price;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder={t('professional.sendProposal.pricePlaceholder')}
              error={!!fieldErrors.price}
            />
            {fieldErrors.price && <HelperText type="error">{fieldErrors.price}</HelperText>}

            <TextInput
              label={t('professional.sendProposal.descriptionLabel')}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (fieldErrors.description) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.description;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              multiline
              numberOfLines={6}
              style={styles.input}
              placeholder={t('professional.sendProposal.descriptionPlaceholder')}
              error={!!fieldErrors.description}
            />
            {fieldErrors.description && <HelperText type="error">{fieldErrors.description}</HelperText>}

            <TextInput
              label={t('professional.sendProposal.durationLabel')}
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              mode="outlined"
              style={styles.input}
              placeholder={t('professional.sendProposal.durationPlaceholder')}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.secondary}
            >
              {t('professional.sendProposal.submit')}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    elevation: 3,
    borderRadius: 16,
  },
  cardContent: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
  },
  error: {
    color: colors.error,
  },
});


