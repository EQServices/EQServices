import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, HelperText, Text, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase';
import { colors } from '../../theme/colors';
import { ALL_SERVICES } from '../../constants/categories';
import { ImagePicker, ImagePickerItem } from '../../components/ImagePicker';
import { uploadAvatarImage, uploadPortfolioImage } from '../../services/storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePickerLib from 'expo-image-picker';
import { useRequireUserType } from '../../hooks/useRequireUserType';

const MAX_PORTFOLIO_ITEMS = 10;

export const ManageProfileScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { isValid } = useRequireUserType('professional');
  const { user, updateUserContext, signOut } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [portfolioItems, setPortfolioItems] = useState<ImagePickerItem[]>([]);
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('professionals')
        .select('categories, regions, description, portfolio, credits, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        const storedServices: string[] = Array.isArray(data.categories) ? data.categories : [];
        const validServices = storedServices.filter((service) => ALL_SERVICES.includes(service));
        setSelectedServices(validServices);
        setSelectedRegions(Array.isArray(data.regions) ? data.regions : []);
        setDescription(data.description || '');
        const portfolioList: string[] = Array.isArray(data.portfolio) ? data.portfolio : [];
        setPortfolioItems(portfolioList.map((uri) => ({ uri, local: false })));
        setCredits(data.credits ?? 0);
        setAvatarUrl(data.avatar_url ?? null);
        setAvatarPreview(data.avatar_url ?? null);
        setNewAvatarUri(null);
        setRemoveAvatar(false);
      }
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar perfil profissional:', err);
      setError(err.message || t('manageProfile.loadError'));
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  const handleLogout = () => {
    Alert.alert(t('manageProfile.logout'), t('manageProfile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('manageProfile.logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            console.error('Erro ao terminar sessão:', err);
            Alert.alert(t('common.error'), t('manageProfile.logoutError'));
          }
        },
      },
    ]);
  };

  const handleSelectAvatar = async () => {
    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('manageProfile.permissionRequired'),
        t('manageProfile.permissionMessage'),
      );
      return;
    }

    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.uri) {
      setAvatarPreview(asset.uri);
      setNewAvatarUri(asset.uri);
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setNewAvatarUri(null);
    if (avatarUrl) {
      setRemoveAvatar(true);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (selectedServices.length === 0) {
      setError(t('manageProfile.categoriesError'));
      return;
    }

    if (selectedRegions.length === 0) {
      setError(t('manageProfile.regionsError'));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (portfolioItems.length > MAX_PORTFOLIO_ITEMS) {
        throw new Error(t('manageProfile.portfolioLimit', { max: MAX_PORTFOLIO_ITEMS }));
      }

      const existingPortfolio = portfolioItems.filter((item) => !item.local).map((item) => item.uri);
      const newImages = portfolioItems.filter((item) => item.local);

      const uploadedImages: string[] = [];
      for (const image of newImages) {
        const upload = await uploadPortfolioImage(user.id, image.uri);
        uploadedImages.push(upload.publicUrl);
      }

      const finalPortfolio = [...existingPortfolio, ...uploadedImages];
      let finalAvatarUrl = avatarUrl ?? null;

      if (removeAvatar) {
        finalAvatarUrl = null;
      }

      if (newAvatarUri) {
        const avatarUpload = await uploadAvatarImage(user.id, 'professional', newAvatarUri);
        finalAvatarUrl = avatarUpload.publicUrl;
      }

      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          categories: selectedServices,
          regions: selectedRegions,
          description: description || null,
          portfolio: finalPortfolio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setPortfolioItems(finalPortfolio.map((uri) => ({ uri, local: false })));
      setAvatarUrl(finalAvatarUrl);
      setAvatarPreview(finalAvatarUrl);
      setNewAvatarUri(null);
      setRemoveAvatar(false);
      updateUserContext({
        avatarUrl: finalAvatarUrl ?? undefined,
      });
      alert(t('manageProfile.saveSuccess'));
    } catch (err: any) {
      console.error('Erro ao atualizar perfil profissional:', err);
      setError(err.message || t('manageProfile.saveError'));
    } finally {
      setSaving(false);
    }
  };

  // Se não for profissional válido, não renderizar conteúdo
  if (!isValid) {
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ gap: 16 }}>
          <Text style={styles.title}>{t('manageProfile.title')}</Text>

          {loading ? (
            <Text style={styles.loading}>{t('manageProfile.loading')}</Text>
          ) : (
            <>
              <View style={styles.avatarSection}>
                {avatarPreview ? (
                  <Avatar.Image size={96} source={{ uri: avatarPreview }} />
                ) : (
                  <Avatar.Icon size={96} icon="account" />
                )}
                <View style={styles.avatarActions}>
                  <Button
                    mode="outlined"
                    onPress={handleSelectAvatar}
                    textColor={colors.professional}
                    style={styles.sectionButton}
                  >
                    {t('manageProfile.selectAvatar')}
                  </Button>
                  {avatarPreview || avatarUrl ? (
                    <Button mode="text" onPress={handleRemoveAvatar} textColor={colors.error}>
                      {t('manageProfile.removeAvatar')}
                    </Button>
                  ) : null}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('profile.edit.personalInfo')}</Text>
                <Text style={styles.sectionSubtitle}>
                  {t('manageProfile.personalDataSubtitle')}
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('EditProfile')}
                  textColor={colors.professional}
                  style={styles.sectionButton}
                >
                  {t('profile.edit.title')}
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('manageCategories.title')}</Text>
                <Text style={styles.sectionSubtitle}>
                  {t('manageProfile.categoriesSubtitle')}
                </Text>
                <View style={styles.chipGroup}>
                  {selectedServices.length === 0 ? (
                    <Text style={styles.emptyText}>{t('manageProfile.noCategories')}</Text>
                  ) : (
                    selectedServices.map((service) => (
                      <Chip key={service} style={styles.chipSelected} textStyle={styles.chipTextSelected}>
                        {service}
                      </Chip>
                    ))
                  )}
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ManageCategories')}
                  textColor={colors.professional}
                  style={styles.sectionButton}
                >
                  {t('manageProfile.manageCategories')}
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('manageRegions.title')}</Text>
                <Text style={styles.sectionSubtitle}>
                  {t('manageProfile.regionsSubtitle')}
                </Text>
                <View style={styles.chipGroup}>
                  {selectedRegions.length === 0 ? (
                    <Text style={styles.emptyText}>{t('manageProfile.noRegions')}</Text>
                  ) : (
                    selectedRegions.map((region) => (
                      <Chip key={region} mode="outlined" style={styles.regionChip}>
                        {region}
                      </Chip>
                    ))
                  )}
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ManageRegions')}
                  textColor={colors.professional}
                  style={styles.sectionButton}
                >
                  {t('manageProfile.manageRegions')}
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('manageProfile.description')}</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={5}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('manageProfile.descriptionPlaceholder')}
                  style={styles.textInput}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('manageProfile.portfolio')}</Text>
                <Text style={styles.sectionSubtitle}>
                  {t('manageProfile.portfolioSubtitle', { max: MAX_PORTFOLIO_ITEMS })}
                </Text>
                <ImagePicker
                  images={portfolioItems}
                  onChange={setPortfolioItems}
                  maxImages={MAX_PORTFOLIO_ITEMS}
                  title=""
                  subtitle=""
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('professional.credits')}</Text>
                <Text style={styles.creditsValue}>{t('manageProfile.credits', { credits })}</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('BuyCredits')}
                  textColor={colors.professional}
                  style={styles.buyCreditsButton}
                >
                  {t('professional.buyCredits')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('ProfessionalProfile')}
                  textColor={colors.professional}
                  style={styles.viewProfileButton}
                >
                  {t('manageProfile.viewPublicProfile')}
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Notifications')}
                  textColor={colors.professional}
                  style={styles.viewProfileButton}
                >
                  {t('notifications.title')}
                </Button>
              </View>

              {error ? <HelperText type="error">{error}</HelperText> : null}

              <View style={styles.saveRow}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                  buttonColor={colors.professional}
                  style={styles.saveButton}
                >
                  {t('manageProfile.save')}
                </Button>
              </View>

              <Button
                mode="outlined"
                icon="logout"
                onPress={handleLogout}
                textColor={colors.error}
                style={styles.logoutButton}
              >
                {t('manageProfile.logout')}
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  loading: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarActions: {
    gap: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipSelected: {
    backgroundColor: colors.professional,
  },
  chipTextSelected: {
    color: colors.textLight,
  },
  regionChip: {
    borderColor: colors.professional,
  },
  textInput: {
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  creditsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.professional,
  },
  buyCreditsButton: {
    alignSelf: 'flex-start',
  },
  viewProfileButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 12,
  },
  saveButton: {
    borderRadius: 12,
  },
  saveRow: {
    alignItems: 'flex-start',
  },
  sectionButton: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  logoutButton: {
    marginTop: 24,
    borderRadius: 12,
    borderColor: colors.error,
  },
});


