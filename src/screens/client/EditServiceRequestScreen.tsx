import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, HelperText, Chip } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { supabase } from '../../config/supabase';
import { ALL_SERVICES, getServiceGroup } from '../../constants/categories';
import { LocationPicker } from '../../components/LocationPicker';
import { LocationSelection, formatLocationSelection, searchParishesWithParents } from '../../services/locations';
import { ImagePicker, ImagePickerItem } from '../../components/ImagePicker';
import { uploadServiceImage } from '../../services/storage';
import { Coordinates } from '../../services/geolocation';
import { AppLogo } from '../../components/AppLogo';
import { ServiceRequest } from '../../types';

interface EditServiceRequestScreenProps {
  navigation: any;
  route: {
    params: {
      requestId: string;
    };
  };
}

export const EditServiceRequestScreen = ({ navigation, route }: EditServiceRequestScreenProps) => {
  const { t } = useTranslation();
  const { requestId } = route.params;
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<ImagePickerItem[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [canEdit, setCanEdit] = useState(true);

  const toggleCategory = (service: string) => {
    setCategories((prev) => {
      if (prev.includes(service)) {
        return prev.filter((cat) => cat !== service);
      } else {
        return [...prev, service];
      }
    });
    // Limpar erro se houver
    if (fieldErrors.category) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };

  // Carregar dados do pedido
  useEffect(() => {
    loadRequestData();
  }, [requestId]);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      setError('');

      // Carregar pedido
      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .eq('client_id', user?.id)
        .single();

      if (requestError) throw requestError;
      if (!requestData) {
        setError(t('editRequest.notFound'));
        setCanEdit(false);
        return;
      }

      // Verificar se pode editar (só se status for pending e não houver propostas aceitas)
      const { data: acceptedProposals } = await supabase
        .from('proposals')
        .select('id')
        .eq('service_request_id', requestId)
        .eq('status', 'accepted')
        .limit(1);

      if (requestData.status !== 'pending' || (acceptedProposals && acceptedProposals.length > 0)) {
        setCanEdit(false);
        setError(t('editRequest.cannotEditReason'));
        return;
      }

      // Preencher formulário com dados existentes
      setTitle(requestData.title || '');
      // Suporta tanto categories[] quanto category (legado)
      setCategories(requestData.categories || (requestData.category ? [requestData.category] : []));
      setDescription(requestData.description || '');
      setBudget(requestData.budget ? requestData.budget.toString() : '');
      setExistingPhotos(requestData.photos || []);

      // Carregar localização
      if (requestData.location) {
        // Tentar parsear a localização para preencher o LocationPicker
        const locationParts = requestData.location.split(',').map((p: string) => p.trim());
        if (locationParts.length >= 3) {
          // Formato: "Freguesia, Concelho, Distrito"
          const parishName = locationParts[0];
          const municipalityName = locationParts[1];
          const districtName = locationParts[2];

          // Buscar IDs correspondentes
          try {
            const parishResults = await searchParishesWithParents(parishName, 5);
            const match = parishResults.find(
              (p) =>
                p.parishName.toLowerCase() === parishName.toLowerCase() &&
                p.municipalityName.toLowerCase() === municipalityName.toLowerCase() &&
                p.districtName.toLowerCase() === districtName.toLowerCase(),
            );

            if (match) {
              setLocationSelection({
                parishId: match.parishId,
                parishName: match.parishName,
                municipalityId: match.municipalityId,
                municipalityName: match.municipalityName,
                districtId: match.districtId,
                districtName: match.districtName,
              });
            }
          } catch (err) {
            console.warn('Erro ao carregar localização:', err);
          }
        }
      }

      if (requestData.latitude && requestData.longitude) {
        setCoordinates({
          latitude: requestData.latitude,
          longitude: requestData.longitude,
        });
      }
    } catch (err: any) {
      setError(err.message || t('editRequest.loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const locationLabel = formatLocationSelection(locationSelection);

    // Limpar erros anteriores
    setFieldErrors({});
    setError('');
    setLocationError(null);

    // Validar campos obrigatórios
    const missingFields: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!title.trim()) {
      missingFields.push(t('editRequest.serviceTitle'));
      newFieldErrors.title = t('editRequest.requiredField');
    }
    if (categories.length === 0) {
      missingFields.push(t('client.newRequest.category'));
      newFieldErrors.category = t('editRequest.selectCategory');
    }
    if (!description.trim()) {
      missingFields.push(t('editRequest.description'));
      newFieldErrors.description = t('editRequest.requiredField');
    }
    if (!locationLabel) {
      missingFields.push(t('editRequest.location'));
      setLocationError(t('editRequest.selectLocation'));
      newFieldErrors.location = t('editRequest.requiredField');
    }

    if (missingFields.length > 0) {
      setFieldErrors(newFieldErrors);
      setError(t('editRequest.fillFields', { fields: missingFields.join(', ') }));
      return;
    }

    setSaving(true);
    setError('');
    setLocationError(null);

    try {
      // Upload de novas fotos
      const uploadedPhotos: string[] = [];
      for (const photo of photos) {
        if (photo.uri && !photo.uri.startsWith('http')) {
          // Nova foto que precisa ser enviada
          if (!user?.id) {
            throw new Error(t('editRequest.invalidSession'));
          }
          const upload = await uploadServiceImage(user.id, photo.uri);
          uploadedPhotos.push(upload.publicUrl);
        } else if (photo.uri) {
          // Foto existente (já tem URL)
          uploadedPhotos.push(photo.uri);
        }
      }

      // Combinar fotos existentes com novas
      const allPhotos = [...existingPhotos.filter((url) => !uploadedPhotos.includes(url)), ...uploadedPhotos];

      // Atualizar pedido
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({
          title,
          categories, // Array de categorias
          description,
          location: locationLabel,
          latitude: coordinates?.latitude ?? null,
          longitude: coordinates?.longitude ?? null,
          budget: budget ? parseFloat(budget) : null,
          photos: allPhotos,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('client_id', user?.id);

      if (updateError) throw updateError;

      // Obter leads existentes para este pedido
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('id, category')
        .eq('service_request_id', requestId);

      const existingCategories = (existingLeads || []).map((l) => l.category);
      const categoriesToAdd = categories.filter((cat) => !existingCategories.includes(cat));
      const categoriesToRemove = existingCategories.filter((cat) => !categories.includes(cat));

      // Remover leads de categorias que não estão mais selecionadas
      if (categoriesToRemove.length > 0) {
        await supabase.from('leads').delete().eq('service_request_id', requestId).in('category', categoriesToRemove);
      }

      // Criar novos leads para categorias adicionadas
      for (const cat of categoriesToAdd) {
        const leadCost = calculateLeadCost(cat);
        await supabase.from('leads').insert({
          service_request_id: requestId,
          category: cat,
          cost: leadCost,
          location: locationLabel,
          description: `${title} - ${description.substring(0, 100)}`,
        });
      }

      // Atualizar leads existentes (localização e descrição)
      if (existingLeads && existingLeads.length > 0) {
        const leadsToUpdate = existingLeads.filter((l) => categories.includes(l.category));
        for (const lead of leadsToUpdate) {
          const leadCost = calculateLeadCost(lead.category);
          await supabase
            .from('leads')
            .update({
              cost: leadCost,
              location: locationLabel,
              description: `${title} - ${description.substring(0, 100)}`,
            })
            .eq('id', lead.id);
        }
      }

      alert(t('editRequest.updateSuccess'));
      navigation.goBack();
    } catch (err: any) {
      setError(err.message || t('editRequest.updateError'));
    } finally {
      setSaving(false);
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

  // Converter fotos existentes para formato ImagePickerItem
  useEffect(() => {
    if (existingPhotos.length > 0) {
      const existingItems: ImagePickerItem[] = existingPhotos.map((url) => ({
        uri: url,
        id: url,
      }));
      setPhotos(existingItems);
    }
  }, [existingPhotos]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>{t('editRequest.loading')}</Text>
      </View>
    );
  }

  if (!canEdit) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || t('editRequest.cannotEdit')}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button} buttonColor={colors.primary}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <AppLogo size={200} withBackground />
        </View>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{t('editRequest.title')}</Text>
            <Text style={styles.subtitle}>{t('editRequest.subtitle')}</Text>

            <TextInput
              label={`${t('editRequest.serviceTitle')} *`}
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
              placeholder={t('editRequest.serviceTitlePlaceholder')}
              error={!!fieldErrors.title}
            />
            {fieldErrors.title && <HelperText type="error">{fieldErrors.title}</HelperText>}

            <View>
              <Text style={styles.label}>{t('editRequest.categories')} *</Text>
              <Text style={styles.subtitle}>
                {t('editRequest.categoriesSubtitle')}
              </Text>
              <View style={styles.chipContainer}>
                {ALL_SERVICES.map((service) => {
                  const isSelected = categories.includes(service);
                  return (
                    <Chip
                      key={service}
                      selected={isSelected}
                      onPress={() => toggleCategory(service)}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipSelected,
                      ]}
                      textStyle={isSelected ? styles.categoryChipTextSelected : undefined}
                    >
                      {service}
                    </Chip>
                  );
                })}
              </View>
              {categories.length === 0 && fieldErrors.category && (
                <HelperText type="error">{fieldErrors.category}</HelperText>
              )}
              {categories.length > 0 && (
                <HelperText type="info">
                  {categories.length === 1 
                    ? t('editRequest.categoriesSelected', { count: categories.length })
                    : t('editRequest.categoriesSelectedPlural', { count: categories.length })}
                </HelperText>
              )}
            </View>

            <TextInput
              label={`${t('editRequest.description')} *`}
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
              placeholder={t('editRequest.descriptionPlaceholder')}
              error={!!fieldErrors.description}
            />
            {fieldErrors.description && <HelperText type="error">{fieldErrors.description}</HelperText>}

            <View>
              <Text style={styles.label}>{t('editRequest.location')} *</Text>
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
                caption={t('editRequest.locationCaption')}
              />
              {fieldErrors.location && <HelperText type="error">{fieldErrors.location}</HelperText>}
            </View>

            <TextInput
              label={t('editRequest.budget')}
              value={budget}
              onChangeText={setBudget}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              placeholder={t('editRequest.budgetPlaceholder')}
            />

            <ImagePicker
              title={t('editRequest.photos')}
              subtitle={t('editRequest.photosSubtitle')}
              images={photos}
              onChange={setPhotos}
              maxImages={5}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={saving}
              disabled={saving}
              style={styles.button}
              buttonColor={colors.primary}
            >
              {t('editRequest.save')}
            </Button>

            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button} textColor={colors.textSecondary}>
              {t('common.cancel')}
            </Button>

            <Text style={styles.infoText}>{t('editRequest.requiredFields')}</Text>
            <Text style={styles.infoText}>
              {t('editRequest.editWarning')}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    marginBottom: 4,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
  },
  categoryChipTextSelected: {
    color: colors.textLight,
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

