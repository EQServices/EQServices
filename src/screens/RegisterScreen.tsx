import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { TextInput, Button, Text, Card, RadioButton, HelperText, Chip } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { UserType } from '../types';
import { LocationPicker } from '../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../services/locations';
import { SERVICE_CATEGORY_GROUPS } from '../constants/categories';

export const RegisterScreen = ({ navigation }: any) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [phone, setPhone] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [professionalRegions, setProfessionalRegions] = useState<string[]>([]);
  const [professionalRegionSelection, setProfessionalRegionSelection] = useState<LocationSelection>({});
  const [professionalRegionError, setProfessionalRegionError] = useState<string | null>(null);
  const [professionalServices, setProfessionalServices] = useState<string[]>([]);
  const [professionalServicesError, setProfessionalServicesError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const serviceGroups = useMemo(
    () => SERVICE_CATEGORY_GROUPS.map((group) => ({ name: group.name, services: [...group.services] })),
    [],
  );

  const toggleProfessionalService = (service: string) => {
    setProfessionalServices((prev) =>
      prev.includes(service) ? prev.filter((entry) => entry !== service) : [...prev, service],
    );
  };

  const handleAddProfessionalRegion = () => {
    if (!professionalRegionSelection.districtId || !professionalRegionSelection.districtName) {
      setProfessionalRegionError('Selecione um distrito.');
      return;
    }

    const label = professionalRegionSelection.districtName;
    if (professionalRegions.includes(label)) {
      setProfessionalRegionError('Distrito já adicionado.');
      return;
    }

    setProfessionalRegions((prev) => [...prev, label]);
    setProfessionalRegionSelection({});
    setProfessionalRegionError(null);
  };

  const handleRemoveProfessionalRegion = (region: string) => {
    setProfessionalRegions((prev) => prev.filter((entry) => entry !== region));
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (phone.trim().length > 0 && !/^\d{9}$/.test(phone.trim())) {
      setError('O telemóvel deve conter 9 dígitos numéricos');
      return;
    }

    if (!locationSelection.parishId || !locationSelection.municipalityId || !locationSelection.districtId) {
      setLocationError('Selecione distrito, concelho e freguesia.');
      setError('Informe uma localização válida.');
      return;
    }

    const locationLabel = formatLocationSelection(locationSelection);
    if (!locationLabel) {
      setLocationError('Seleção inválida. Escolha novamente a freguesia.');
      setError('Informe uma localização válida.');
      return;
    }

    setLocationError(null);
    setProfessionalRegionError(null);
    setProfessionalServicesError(null);

    if (userType === 'professional') {
      let hasProfessionalErrors = false;

      if (professionalRegions.length === 0) {
        setProfessionalRegionError('Adicione pelo menos um distrito de atendimento.');
        hasProfessionalErrors = true;
      }

      if (professionalServices.length === 0) {
        setProfessionalServicesError('Selecione pelo menos um serviço/categoria.');
        hasProfessionalErrors = true;
      }

      if (hasProfessionalErrors) {
        setError('Preencha os dados profissionais obrigatórios.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setLocationError(null);

    try {
      await signUp({
        email: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
        phone: phone.trim(),
        userType,
        location: {
          districtId: locationSelection.districtId!,
          municipalityId: locationSelection.municipalityId!,
          parishId: locationSelection.parishId!,
          label: locationLabel,
        },
        professionalCategories: userType === 'professional' ? professionalServices : undefined,
        professionalRegions: userType === 'professional' ? professionalRegions : undefined,
      });
      navigation.navigate('Login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Criar Conta</Text>

            <TextInput
              label="Nome"
              value={firstName}
              onChangeText={setFirstName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Apelido"
              value={lastName}
              onChangeText={setLastName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              label="Confirmar senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <TextInput
              label="Telemóvel (9 dígitos)"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={9}
            />

            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>Localização principal</Text>
              <Text style={styles.sectionSubtitle}>
                Informe onde está localizado. Utilize o autocomplete para selecionar freguesia, concelho e distrito.
              </Text>
              <LocationPicker
                value={locationSelection}
                onChange={(selection) => {
                  setLocationSelection(selection);
                  setLocationError(null);
                }}
                mode="parish"
                caption="Selecione distrito, concelho e freguesia."
                error={locationError || undefined}
              />
              {locationError ? <HelperText type="error">{locationError}</HelperText> : null}
            </View>

            <Text style={styles.label}>Tipo de conta:</Text>
            <RadioButton.Group
              onValueChange={(value) => {
                const nextType = value as UserType;
                setUserType(nextType);
                if (nextType !== 'professional') {
                  setProfessionalRegionError(null);
                  setProfessionalServicesError(null);
                }
              }}
              value={userType}
            >
              <View style={styles.radioContainer}>
                <RadioButton.Item label="Cliente" value="client" />
                <RadioButton.Item label="Profissional" value="professional" />
              </View>
            </RadioButton.Group>

            {userType === 'professional' ? (
              <>
                <View style={styles.professionalSection}>
                  <Text style={styles.sectionTitle}>Distritos de atendimento</Text>
                  <Text style={styles.sectionSubtitle}>
                    Adicione os distritos onde irá atender. Pode informar vários distritos.
                  </Text>
                  <LocationPicker
                    value={professionalRegionSelection}
                    onChange={(selection) => {
                      setProfessionalRegionSelection(selection);
                      setProfessionalRegionError(null);
                    }}
                    mode="district"
                    caption="Selecione um distrito e depois clique em adicionar."
                    error={professionalRegionError || undefined}
                  />
                  <Button
                    mode="outlined"
                    onPress={handleAddProfessionalRegion}
                    style={styles.addRegionButton}
                    textColor={colors.primary}
                  >
                    Adicionar distrito
                  </Button>
                  <View style={styles.chipGroup}>
                    {professionalRegions.length === 0 ? (
                      <Text style={styles.emptyText}>Nenhum distrito adicionado.</Text>
                    ) : (
                      professionalRegions.map((region) => (
                        <Chip
                          key={region}
                          onPress={() => handleRemoveProfessionalRegion(region)}
                          mode="outlined"
                          style={styles.regionChip}
                        >
                          {region}
                        </Chip>
                      ))
                    )}
                  </View>
                  {professionalRegionError ? <HelperText type="error">{professionalRegionError}</HelperText> : null}
                </View>

                <View style={styles.professionalSection}>
                  <Text style={styles.sectionTitle}>Serviços oferecidos</Text>
                  <Text style={styles.sectionSubtitle}>Selecione pelo menos uma categoria em que atua.</Text>
                  <View style={styles.serviceGroups}>
                    {serviceGroups.map((group) => (
                      <View key={group.name} style={styles.serviceGroupBlock}>
                        <Text style={styles.groupTitle}>{group.name}</Text>
                        <View style={styles.chipGroup}>
                          {group.services.map((service) => {
                            const selected = professionalServices.includes(service);
                            return (
                              <Chip
                                key={service}
                                selected={selected}
                                onPress={() => toggleProfessionalService(service)}
                                style={selected ? styles.serviceChipSelected : styles.serviceChip}
                                textStyle={selected ? styles.serviceChipTextSelected : undefined}
                              >
                                {service}
                              </Chip>
                            );
                          })}
                        </View>
                      </View>
                    ))}
                  </View>
                  {professionalServicesError ? <HelperText type="error">{professionalServicesError}</HelperText> : null}
                </View>
              </>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.primary}
            >
              Cadastrar
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              Já tem conta? Faça login
            </Button>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  card: {
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.text,
  },
  locationSection: {
    marginBottom: 16,
    gap: 8,
  },
  radioContainer: {
    marginBottom: 16,
  },
  professionalSection: {
    marginTop: 16,
    gap: 12,
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
  addRegionButton: {
    alignSelf: 'flex-start',
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionChip: {
    borderColor: colors.primary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  serviceGroups: {
    gap: 16,
  },
  serviceGroupBlock: {
    gap: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  serviceChip: {
    borderColor: colors.border,
  },
  serviceChipSelected: {
    backgroundColor: colors.primary,
  },
  serviceChipTextSelected: {
    color: colors.textLight,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
  },
});

