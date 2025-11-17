import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, HelperText, Switch, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { colors } from '../theme/colors';
import * as ImagePickerLib from 'expo-image-picker';
import { uploadAvatarImage } from '../services/storage';
import { useThemeMode } from '../contexts/ThemeContext';
import { LocationPicker } from '../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../services/locations';
import { Coordinates } from '../services/geolocation';

export const EditProfileScreen = ({ navigation }: any) => {
  const { user, updateUserContext } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const isDarkMode = mode === 'dark';
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const buildSelectionFromLabel = (label?: string | null): LocationSelection => {
    if (!label) return {};
    const parts = label.split(',').map((part) => part.trim()).filter(Boolean);
    if (parts.length === 3) {
      const [parishName, municipalityName, districtName] = parts;
      return { parishName, municipalityName, districtName };
    }
    if (parts.length === 2) {
      const [municipalityName, districtName] = parts;
      return { municipalityName, districtName };
    }
    if (parts.length === 1) {
      return { districtName: parts[0] };
    }
    return {};
  };

  const fetchLocationSelection = async (
    districtId?: string | null,
    municipalityId?: string | null,
    parishId?: string | null,
    locationLabel?: string | null,
  ): Promise<LocationSelection> => {
    if (parishId) {
      const { data, error } = await supabase
        .from('pt_parishes')
        .select(
          `
          id,
          name,
          municipality:pt_municipalities (
            id,
            name,
            district:pt_districts (
              id,
              name
            )
          )
        `,
        )
        .eq('id', parishId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          parishId: data.id ?? undefined,
          parishName: data.name ?? undefined,
          municipalityId: data.municipality?.id ?? undefined,
          municipalityName: data.municipality?.name ?? undefined,
          districtId: data.municipality?.district?.id ?? undefined,
          districtName: data.municipality?.district?.name ?? undefined,
        };
      }
    }

    if (municipalityId) {
      const { data, error } = await supabase
        .from('pt_municipalities')
        .select(
          `
          id,
          name,
          district:pt_districts (
            id,
            name
          )
        `,
        )
        .eq('id', municipalityId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          municipalityId: data.id ?? undefined,
          municipalityName: data.name ?? undefined,
          districtId: data.district?.id ?? undefined,
          districtName: data.district?.name ?? undefined,
        };
      }
    }

    if (districtId) {
      const { data, error } = await supabase
        .from('pt_districts')
        .select('id, name')
        .eq('id', districtId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          districtId: data.id ?? undefined,
          districtName: data.name ?? undefined,
        };
      }
    }

    return buildSelectionFromLabel(locationLabel);
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone, avatar_url, district_id, municipality_id, parish_id, location_label, latitude, longitude')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setAvatarUrl(data.avatar_url ?? null);
          setAvatarPreview(data.avatar_url ?? null);
          setNewAvatarUri(null);
          setRemoveAvatar(false);

          try {
            const selection = await fetchLocationSelection(
              data.district_id,
              data.municipality_id,
              data.parish_id,
              data.location_label,
            );
            setLocationSelection({
              districtId: data.district_id ?? undefined,
              municipalityId: data.municipality_id ?? undefined,
              parishId: data.parish_id ?? undefined,
              ...selection,
            });
            setLocationError(null);
            
            // Carregar coordenadas se existirem
            if (data.latitude && data.longitude) {
              setCoordinates({
                latitude: parseFloat(String(data.latitude)),
                longitude: parseFloat(String(data.longitude)),
              });
            }
          } catch (locationErr: any) {
            console.error('Erro ao carregar localização do perfil:', locationErr);
            setLocationSelection({
              districtId: data.district_id ?? undefined,
              municipalityId: data.municipality_id ?? undefined,
              parishId: data.parish_id ?? undefined,
              ...buildSelectionFromLabel(data.location_label),
            });
            setLocationError('Não foi possível carregar a morada atual. Selecione novamente.');
            
            // Carregar coordenadas se existirem mesmo em caso de erro
            if (data.latitude && data.longitude) {
              setCoordinates({
                latitude: parseFloat(String(data.latitude)),
                longitude: parseFloat(String(data.longitude)),
              });
            }
          }
        }
        setProfileError(null);
      } catch (err: any) {
        console.error('Erro ao carregar perfil:', err);
        setProfileError(err.message || 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const handleSelectAvatar = async () => {
    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso às suas fotos para permitir o upload. Verifique as permissões nas definições do dispositivo.',
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

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    if (!name.trim()) {
      setProfileError('Informe o seu nome.');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);
      setProfileSuccess(null);
      setLocationError(null);

      const cleanPhone = phone.trim();
      let finalAvatarUrl = avatarUrl;

      // Upload do avatar primeiro, se houver nova imagem
      if (removeAvatar) {
        finalAvatarUrl = null;
      } else if (newAvatarUri) {
        try {
          const upload = await uploadAvatarImage(user.id, 'client', newAvatarUri);
          finalAvatarUrl = upload.publicUrl;
        } catch (uploadError: any) {
          console.error('Erro ao fazer upload do avatar:', uploadError);
          setProfileError(
            uploadError.message || 'Não foi possível fazer upload da imagem. Tente novamente.',
          );
          return;
        }
      }

      const formattedLocation = formatLocationSelection(locationSelection);

      // Preparar dados de atualização
      const updateData: any = {
        name: name.trim(),
        phone: cleanPhone.length > 0 ? cleanPhone : null,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      };

      // Adicionar campos de localização apenas se existirem
      if (locationSelection.districtId) {
        updateData.district_id = locationSelection.districtId;
      } else {
        updateData.district_id = null;
      }

      if (locationSelection.municipalityId) {
        updateData.municipality_id = locationSelection.municipalityId;
      } else {
        updateData.municipality_id = null;
      }

      if (locationSelection.parishId) {
        updateData.parish_id = locationSelection.parishId;
      } else {
        updateData.parish_id = null;
      }

      updateData.location_label = formattedLocation.length > 0 ? formattedLocation : null;
      
      // Adicionar coordenadas se disponíveis
      if (coordinates) {
        updateData.latitude = coordinates.latitude;
        updateData.longitude = coordinates.longitude;
      } else {
        // Se não há coordenadas mas há localização selecionada, limpar coordenadas antigas
        updateData.latitude = null;
        updateData.longitude = null;
      }

      const { error, data } = await supabase.from('users').update(updateData).eq('id', user.id).select();

      if (error) {
        console.error('Erro ao atualizar perfil no Supabase:', error);
        throw error;
      }

      updateUserContext({
        name: name.trim(),
        phone: cleanPhone.length > 0 ? cleanPhone : undefined,
        avatarUrl: finalAvatarUrl ?? undefined,
        districtId: locationSelection.districtId ?? undefined,
        municipalityId: locationSelection.municipalityId ?? undefined,
        parishId: locationSelection.parishId ?? undefined,
        locationLabel: formattedLocation.length > 0 ? formattedLocation : undefined,
      });

      setAvatarUrl(finalAvatarUrl ?? null);
      setAvatarPreview(finalAvatarUrl ?? null);
      setNewAvatarUri(null);
      setRemoveAvatar(false);

      setProfileSuccess('Perfil atualizado com sucesso.');
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      const errorMessage =
        err.message ||
        (err.code === 'PGRST301'
          ? 'Erro de permissão. Verifique se está autenticado.'
          : 'Não foi possível atualizar o perfil.');
      setProfileError(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.id) return;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Senha atualizada com sucesso.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Erro ao atualizar senha:', err);
      setPasswordError(err.message || 'Não foi possível atualizar a senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={{ gap: 16 }}>
          <Text style={styles.title}>Editar Perfil</Text>

          {loading ? (
            <Text style={styles.loading}>A carregar dados...</Text>
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
                    textColor={colors.primary}
                    style={styles.avatarButton}
                  >
                    Alterar avatar
                  </Button>
                  {avatarPreview || avatarUrl ? (
                    <Button mode="text" onPress={handleRemoveAvatar} textColor={colors.error}>
                      Remover avatar
                    </Button>
                  ) : null}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informações pessoais</Text>
                <TextInput
                  label="Nome"
                  mode="outlined"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={email}
                  editable={false}
                  style={styles.input}
                  right={<TextInput.Affix text="não editável" />}
                />
                <TextInput
                  label="Telemóvel (opcional)"
                  mode="outlined"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
                <LocationPicker
                  value={locationSelection}
                  onChange={(selection) => {
                    setLocationSelection(selection);
                    setLocationError(null);
                  }}
                  onCoordinatesChange={(coords) => {
                    setCoordinates(coords);
                  }}
                  enableGPS={Platform.OS !== 'web'}
                  error={locationError ?? undefined}
                />
                {profileError ? <HelperText type="error">{profileError}</HelperText> : null}
                {profileSuccess ? <HelperText type="info">{profileSuccess}</HelperText> : null}
                <Button
                  mode="contained"
                  onPress={handleSaveProfile}
                  loading={savingProfile}
                  disabled={savingProfile}
                  style={styles.primaryButton}
                >
                  Guardar alterações
                </Button>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alterar senha</Text>
                <TextInput
                  label="Nova senha"
                  mode="outlined"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                />
                <TextInput
                  label="Confirmar nova senha"
                  mode="outlined"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
                {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
                {passwordSuccess ? <HelperText type="info">{passwordSuccess}</HelperText> : null}
                <Button
                  mode="outlined"
                  onPress={handleChangePassword}
                  loading={savingPassword}
                  disabled={savingPassword}
                  style={styles.secondaryButton}
                  textColor={colors.primary}
                >
                  Atualizar senha
                </Button>
              </View>
            </>
          )}
        </Card.Content>
      </Card>
      <Card style={[styles.card, styles.preferenceCard]}>
        <Card.Content>
          <View style={styles.preferenceRow}>
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceTitle}>Modo escuro</Text>
              <Text style={styles.preferenceSubtitle}>
                Alterna a interface para tons escuros. A aplicação seguirá o sistema automaticamente, mas
                pode ser ajustado manualmente aqui.
              </Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} color={colors.primary} />
          </View>
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
    elevation: 2,
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
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarActions: {
    gap: 8,
  },
  avatarButton: {
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: colors.background,
  },
  primaryButton: {
    borderRadius: 12,
  },
  secondaryButton: {
    borderRadius: 12,
  },
  preferenceCard: {
    marginTop: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  preferenceText: {
    flex: 1,
    gap: 6,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  preferenceSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});

export default EditProfileScreen;

