import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, HelperText, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { getServiceGroup } from '../../constants/categories';
import { LocationPicker } from '../../components/LocationPicker';
import { CategoryPicker } from '../../components/CategoryPicker';
import { LocationSelection, formatLocationSelection } from '../../services/locations';
import { ImagePicker, ImagePickerItem } from '../../components/ImagePicker';
import { uploadServiceImage } from '../../services/storage';
import { notifyLeadAvailable } from '../../services/notifications';
import { Coordinates } from '../../services/geolocation';
import { queueActionIfOffline } from '../../components/AppWithOffline';
import { isOnline } from '../../services/network';
import { AppLogo } from '../../components/AppLogo';

export const NewServiceRequestScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<ImagePickerItem[]>([]);


  const handleSubmit = async () => {
    const locationLabel = formatLocationSelection(locationSelection);
    
    // Limpar erros anteriores
    setFieldErrors({});
    setError('');
    setLocationError(null);

    // Validar campos obrigatórios e identificar quais estão faltando
    const missingFields: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!title.trim()) {
      missingFields.push(t('client.newRequest.serviceTitle'));
      newFieldErrors.title = t('client.newRequest.requiredField');
    }
    if (categories.length === 0) {
      missingFields.push(t('client.newRequest.category'));
      newFieldErrors.category = t('client.newRequest.selectCategory');
    }
    if (!description.trim()) {
      missingFields.push(t('client.newRequest.description'));
      newFieldErrors.description = t('client.newRequest.requiredField');
    }
    if (!locationLabel) {
      missingFields.push(t('client.newRequest.location'));
      setLocationError(t('client.newRequest.selectLocation'));
      newFieldErrors.location = t('client.newRequest.requiredField');
    }

    if (missingFields.length > 0) {
      setFieldErrors(newFieldErrors);
      setError(t('client.newRequest.fillFields', { fields: missingFields.join(', ') }));
      return;
    }

    setLoading(true);
    setError('');
    setLocationError(null);

    try {
      const uploadedPhotos: string[] = [];
      if (photos.length > 0) {
        if (!user?.id) {
          throw new Error(t('client.newRequest.invalidSession'));
        }

        for (const photo of photos) {
          const upload = await uploadServiceImage(user.id, photo.uri);
          uploadedPhotos.push(upload.publicUrl);
        }
      }

      const online = await isOnline();

      // Se offline, adicionar à fila de sincronização
      if (!online && user?.id) {
        await queueActionIfOffline(
          'CREATE_SERVICE_REQUEST',
          {
            client_id: user.id,
            title,
            categories,
            description,
            location: locationLabel,
            latitude: coordinates?.latitude ?? null,
            longitude: coordinates?.longitude ?? null,
            budget: budget ? parseFloat(budget) : null,
            photos: uploadedPhotos,
          },
          false,
          2, // Alta prioridade
        );

        alert(t('client.newRequest.createdOffline'));
        setTitle('');
        setLocationSelection({});
        setLocationError(null);
        setCoordinates(null);
        setPhotos([]);
        setCategories([]);
        setDescription('');
        setBudget('');
        // Redirecionar para a tela de perfil/home do cliente
        navigation.navigate('ClientHome');
        return;
      }

      // Criar pedido de serviço com múltiplas categorias
      const { data: serviceRequest, error: requestError } = await supabase
        .from('service_requests')
        .insert({
          client_id: user?.id,
          title,
          categories, // Array de categorias
          description,
          location: locationLabel,
          latitude: coordinates?.latitude ?? null,
          longitude: coordinates?.longitude ?? null,
          budget: budget ? parseFloat(budget) : null,
          status: 'pending',
          photos: uploadedPhotos,
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // Criar um lead para cada categoria selecionada
      const createdLeads: { id: string; category: string }[] = [];

      for (const cat of categories) {
        const leadCost = calculateLeadCost(cat);
        
        // Tentar usar função RPC primeiro
        const { data: leadId, error: leadError } = await supabase.rpc('create_lead_for_service_request', {
          p_service_request_id: serviceRequest.id,
          p_category: cat,
          p_cost: leadCost,
          p_location: locationLabel,
          p_description: `${title} - ${description.substring(0, 100)}`,
        });

        let leadRecordId: string | null = null;

        if (leadError) {
          // Fallback: inserir diretamente se a função não existir
          const { data: directLeadRecord, error: directInsertError } = await supabase
            .from('leads')
            .insert({
              service_request_id: serviceRequest.id,
              category: cat,
              cost: leadCost,
              location: locationLabel,
              description: `${title} - ${description.substring(0, 100)}`,
            })
            .select('id')
            .single();

          if (directInsertError) {
            console.error(`Erro ao criar lead para categoria ${cat}:`, directInsertError);
            continue; // Continuar com próxima categoria mesmo se uma falhar
          }
          leadRecordId = directLeadRecord?.id || null;
        } else {
          leadRecordId = leadId as string;
        }

        if (leadRecordId) {
          createdLeads.push({ id: leadRecordId, category: cat });

          // Notificar profissionais desta categoria
          const { data: professionals } = await supabase
            .from('professionals')
            .select('id, categories')
            .contains('categories', [cat]);

          if (professionals && professionals.length > 0) {
            await Promise.all(
              professionals.map((professional) =>
                notifyLeadAvailable({
                  professionalId: professional.id,
                  category: cat,
                  location: locationLabel,
                  leadId: leadRecordId!,
                  serviceRequestId: serviceRequest.id,
                }),
              ),
            );
          }
        }
      }

      if (createdLeads.length === 0) {
        throw new Error('Erro ao criar leads. Nenhum lead foi criado.');
      }

      // Limpar formulário
      setTitle('');
      setLocationSelection({});
      setLocationError(null);
      setCoordinates(null);
      setPhotos([]);
      setCategories([]);
      setDescription('');
      setBudget('');
      
      // Mostrar mensagem de sucesso e redirecionar para a tela inicial do cliente
      alert(t('client.newRequest.success') + ` ${createdLeads.length} ${t('client.newRequest.opportunitiesCreated')}`);
      
      // Redirecionar para a tela de perfil/home do cliente
      navigation.navigate('ClientHome');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar pedido');
    } finally {
      setLoading(false);
    }
  };

  const calculateLeadCost = (service: string): number => {
    const group = getServiceGroup(service);
    const baseByGroup: Record<string, number> = {
      'Serviços de Construção e Remodelação': 10, // Máximo: 10 moedas
      'Serviços Administrativos e Financeiros': 9,
      'Serviços de Transporte e Logística': 8,
      'Eventos e Festas': 7,
      'Serviço Automóvel': 7,
      'Serviços Criativos e Design': 7,
      'Serviços de Tecnologia e Informática': 6,
      'Serviços de Saúde e Bem-Estar': 6,
      'Beleza e Estética': 4,
      'Serviços de Costura/Alfaiataria/Modista': 4,
      Educação: 3,
      'Serviços de Limpeza': 3,
      'Serviços Domésticos': 3,
    };

    return group ? baseByGroup[group.name] ?? 3 : 3;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <AppLogo size={200} withBackground />
        </View>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Novo Pedido de Serviço</Text>
            <Text style={styles.subtitle}>
              Descreva o serviço que precisa e receba orçamentos de profissionais qualificados
            </Text>

            <TextInput
              label="Título do serviço *"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (fieldErrors.title) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.title;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              style={styles.input}
              placeholder="Ex: Pintura de sala e quarto"
              error={!!fieldErrors.title}
            />
            {fieldErrors.title && <HelperText type="error">{fieldErrors.title}</HelperText>}

            <View>
              <CategoryPicker
                value={categories}
                onChange={(selectedCategories) => {
                  setCategories(selectedCategories);
                  if (fieldErrors.category) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.category;
                      return newErrors;
                    });
                  }
                }}
                error={fieldErrors.category}
                label={`${t('client.newRequest.category')} *`}
                caption={t('client.newRequest.categoryHint')}
                multiple={true}
                style={styles.categoryPicker}
              />
            </View>

            <TextInput
              label={`${t('client.newRequest.description')} *`}
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
              placeholder="Descreva o serviço em detalhes: o que precisa, quando, requisitos especiais, etc."
              error={!!fieldErrors.description}
            />
            {fieldErrors.description && <HelperText type="error">{fieldErrors.description}</HelperText>}

            <View>
              <Text style={styles.label}>{t('client.newRequest.location')} *</Text>
              <LocationPicker
                value={locationSelection}
                onChange={(selection) => {
                  setLocationSelection(selection);
                  setLocationError(null);
                  if (fieldErrors.location) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.location;
                      return newErrors;
                    });
                  }
                }}
                onCoordinatesChange={(coords) => {
                  setCoordinates(coords);
                }}
                enableGPS={Platform.OS !== 'web'}
                error={locationError || fieldErrors.location || undefined}
                style={styles.locationPicker}
                mode="parish"
                caption="Selecione distrito, concelho e freguesia do serviço."
              />
              {fieldErrors.location && <HelperText type="error">{fieldErrors.location}</HelperText>}
            </View>

            <TextInput
              label={t('client.newRequest.budget')}
              value={budget}
              onChangeText={setBudget}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder="Opcional"
            />

            <ImagePicker
              title={t('client.newRequest.photos')}
              subtitle={t('client.newRequest.photosSubtitle')}
              images={photos}
              onChange={setPhotos}
              maxImages={5}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.primary}
            >
              {t('client.newRequest.submit')}
            </Button>

            <Text style={styles.infoText}>
              * {t('client.newRequest.requiredFields')}
            </Text>
            <Text style={styles.infoText}>
              ℹ️ {t('client.newRequest.noCostInfo')}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  locationPicker: {
    marginBottom: 16,
  },
  categoryPicker: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

