import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { TextInput, Button, Text, Card, RadioButton, HelperText, Chip, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { UserType } from '../types';
import { LocationPicker } from '../components/LocationPicker';
import { LocationSelection, formatLocationSelection } from '../services/locations';
import { SERVICE_CATEGORY_GROUPS } from '../constants/categories';
import { Coordinates } from '../services/geolocation';
import { AppLogo } from '../components/AppLogo';

export const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<UserType>('client');
  const [phone, setPhone] = useState('');
  const [locationSelection, setLocationSelection] = useState<LocationSelection>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [professionalRegions, setProfessionalRegions] = useState<string[]>([]);
  const [professionalRegionSelection, setProfessionalRegionSelection] = useState<LocationSelection>({});
  const [professionalRegionError, setProfessionalRegionError] = useState<string | null>(null);
  const [professionalServices, setProfessionalServices] = useState<string[]>([]);
  const [professionalServicesError, setProfessionalServicesError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
      setProfessionalRegionError(t('register.selectDistrict'));
      return;
    }

    const label = professionalRegionSelection.districtName;
    if (professionalRegions.includes(label)) {
      setProfessionalRegionError(t('register.districtAlreadyAdded'));
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
    // Limpar erros anteriores
    setFieldErrors({});
    setError('');
    
    // Validar campos obrigatórios e identificar quais estão faltando
    const missingFields: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      missingFields.push(t('register.firstName'));
      newFieldErrors.firstName = t('register.requiredField');
    }
    if (!lastName.trim()) {
      missingFields.push(t('register.lastName'));
      newFieldErrors.lastName = t('register.requiredField');
    }
    if (!email.trim()) {
      missingFields.push(t('auth.email'));
      newFieldErrors.email = t('register.requiredField');
    }
    if (!password) {
      missingFields.push(t('auth.password'));
      newFieldErrors.password = t('register.requiredField');
    }
    if (!confirmPassword) {
      missingFields.push(t('auth.confirmPassword'));
      newFieldErrors.confirmPassword = t('register.requiredField');
    }

    if (missingFields.length > 0) {
      setFieldErrors(newFieldErrors);
      setError(t('register.fillFields', { fields: missingFields.join(', ') }));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.passwordsDontMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('register.passwordMinLength'));
      return;
    }

    if (phone.trim().length > 0 && !/^\d{9}$/.test(phone.trim())) {
      setError(t('register.phoneInvalid'));
      return;
    }

    // Para profissionais, apenas distrito é obrigatório. Para clientes, precisa de distrito, concelho e freguesia
    if (userType === 'professional') {
      if (!locationSelection.districtId || !locationSelection.districtName) {
        setLocationError(t('register.selectDistrict'));
        setError(t('register.validDistrictRequired'));
        return;
      }
    } else {
      if (!locationSelection.parishId || !locationSelection.municipalityId || !locationSelection.districtId) {
        setLocationError(t('register.selectLocationRequired'));
        setError(t('register.validLocationRequired'));
        return;
      }
    }

    const locationLabel = formatLocationSelection(locationSelection);
    if (!locationLabel) {
      if (userType === 'professional') {
        setLocationError(t('register.invalidSelectionDistrict'));
      } else {
        setLocationError(t('register.invalidSelectionParish'));
      }
      setError(t('register.validLocationRequired'));
      return;
    }

    setLocationError(null);
    setProfessionalRegionError(null);
    setProfessionalServicesError(null);

    if (userType === 'professional') {
      let hasProfessionalErrors = false;

      if (professionalRegions.length === 0) {
        setProfessionalRegionError(t('register.addAtLeastOneRegion'));
        hasProfessionalErrors = true;
      }

      if (professionalServices.length === 0) {
        setProfessionalServicesError(t('register.selectAtLeastOneService'));
        hasProfessionalErrors = true;
      }

    if (hasProfessionalErrors) {
      setError(t('register.fillProfessionalData'));
      return;
    }
  }

  if (!acceptedTerms) {
    setTermsError(t('register.mustAcceptTerms'));
    setError(t('register.mustAcceptTermsError'));
    return;
  }

  setLoading(true);
  setError('');
  setLocationError(null);
  setTermsError(null);

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
          municipalityId: userType === 'professional' ? undefined : locationSelection.municipalityId!,
          parishId: userType === 'professional' ? undefined : locationSelection.parishId!,
          label: locationLabel,
          latitude: coordinates?.latitude ?? null,
          longitude: coordinates?.longitude ?? null,
        },
        professionalCategories: userType === 'professional' ? professionalServices : undefined,
        professionalRegions: userType === 'professional' ? professionalRegions : undefined,
      });
      navigation.navigate('Login');
    } catch (err: any) {
      setError(err.message || t('register.registerError'));
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
          <AppLogo size={200} withBackground />
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{t('register.title')}</Text>

            <TextInput
              label={`${t('register.firstName')} *`}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (fieldErrors.firstName) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.firstName;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.firstName}
            />
            {fieldErrors.firstName && <HelperText type="error">{fieldErrors.firstName}</HelperText>}

            <TextInput
              label={`${t('register.lastName')} *`}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (fieldErrors.lastName) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.lastName;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              style={styles.input}
              error={!!fieldErrors.lastName}
            />
            {fieldErrors.lastName && <HelperText type="error">{fieldErrors.lastName}</HelperText>}

            <TextInput
              label={`${t('auth.email')} *`}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!!fieldErrors.email}
            />
            {fieldErrors.email && <HelperText type="error">{fieldErrors.email}</HelperText>}

            <TextInput
              label={`${t('auth.password')} *`}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.password;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!fieldErrors.password}
            />
            {fieldErrors.password && <HelperText type="error">{fieldErrors.password}</HelperText>}

            <TextInput
              label={`${t('auth.confirmPassword')} *`}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.confirmPassword;
                    return newErrors;
                  });
                }
              }}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              error={!!fieldErrors.confirmPassword}
            />
            {fieldErrors.confirmPassword && <HelperText type="error">{fieldErrors.confirmPassword}</HelperText>}

            <TextInput
              label={t('register.phone')}
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              maxLength={9}
            />

            <View style={styles.locationSection}>
              <Text style={styles.sectionTitle}>{t('register.mainLocation')} *</Text>
              <Text style={styles.sectionSubtitle}>
                {userType === 'professional' 
                  ? t('register.mainLocationSubtitleProfessional')
                  : t('register.mainLocationSubtitleClient')}
              </Text>
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
                mode={userType === 'professional' ? 'district' : 'parish'}
                caption={userType === 'professional' ? t('register.selectDistrict') : t('register.selectLocationRequired')}
                error={locationError || undefined}
              />
              {locationError ? <HelperText type="error">{locationError}</HelperText> : null}
            </View>

            <Text style={styles.label}>{t('register.accountType')}</Text>
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
                <RadioButton.Item label={t('auth.client')} value="client" />
                <RadioButton.Item label={t('auth.professional')} value="professional" />
              </View>
            </RadioButton.Group>

            {userType === 'professional' ? (
              <>
                <View style={styles.professionalSection}>
                  <Text style={styles.sectionTitle}>{t('register.serviceRegions')} *</Text>
                  <Text style={styles.sectionSubtitle}>
                    {t('register.serviceRegionsSubtitle')}
                  </Text>
                  <LocationPicker
                    value={professionalRegionSelection}
                    onChange={(selection) => {
                      setProfessionalRegionSelection(selection);
                      setProfessionalRegionError(null);
                    }}
                    mode="district"
                    caption={t('register.selectDistrictAndAdd')}
                    error={professionalRegionError || undefined}
                  />
                  <Button
                    mode="outlined"
                    onPress={handleAddProfessionalRegion}
                    style={styles.addRegionButton}
                    textColor={colors.primary}
                  >
                    {t('register.addRegion')}
                  </Button>
                  <View style={styles.chipGroup}>
                    {professionalRegions.length === 0 ? (
                      <Text style={styles.emptyText}>{t('register.noRegionsAdded')}</Text>
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
                  <Text style={styles.sectionTitle}>{t('register.servicesOffered')} *</Text>
                  <Text style={styles.sectionSubtitle}>{t('register.servicesSubtitle')}</Text>
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

            <View style={styles.termsSection}>
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={acceptedTerms ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setAcceptedTerms(!acceptedTerms);
                    setTermsError(null);
                    if (error && error.includes('aceitar')) {
                      setError('');
                    }
                  }}
                  color={colors.primary}
                />
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    {t('register.acceptTerms')}{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('TermsOfService')}
                    >
                      {t('register.termsOfService')}
                    </Text>
                    {' '}{t('register.and')}{' '}
                    <Text
                      style={styles.termsLink}
                      onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                      {t('register.privacyPolicy')}
                    </Text>
                  </Text>
                </View>
              </View>
              {termsError ? <HelperText type="error">{termsError}</HelperText> : null}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading || !acceptedTerms}
              style={styles.button}
              buttonColor={colors.primary}
            >
              {t('register.register')}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.linkButton}
            >
              {t('register.alreadyHaveAccount')}
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
  termsSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  termsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

