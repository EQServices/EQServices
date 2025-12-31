import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Linking, Alert } from 'react-native';
import { TextInput, Button, Text, Card, useTheme, Checkbox, Divider, Dialog, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { AppLogo } from '../components/AppLogo';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useBiometry } from '../hooks/useBiometry';
import { sendPasswordResetEmail } from '../services/emailVerification';

export const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { signIn } = useAuth();
  const theme = useTheme();
  const {
    available: biometryAvailable,
    biometryType,
    hasCredentials,
    enabled: biometryEnabled,
    loading: biometryCheckLoading,
    authenticate: authenticateBiometry,
    saveCredentials,
  } = useBiometry();
  const styles = useThemedStyles((currentTheme) => ({
    container: {
      flex: 1,
      backgroundColor: currentTheme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
      cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    },
    subtitle: {
      fontSize: 16,
      color: currentTheme.colors.onSurfaceVariant ?? currentTheme.colors.outline,
    },
    card: {
      elevation: 4,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: currentTheme.colors.onSurface,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 8,
      paddingVertical: 6,
    },
    linkButton: {
      marginTop: 8,
    },
    error: {
      color: currentTheme.colors.error,
      marginBottom: 12,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    checkboxLabel: {
      fontSize: 14,
      color: currentTheme.colors.onSurface,
      marginLeft: 8,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
    },
    dividerText: {
      marginHorizontal: 12,
      fontSize: 14,
      color: currentTheme.colors.onSurfaceVariant ?? currentTheme.colors.outline,
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginTop: -8,
      marginBottom: 8,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: currentTheme.colors.primary,
    },
  }));

  // Tentar login biométrico ao carregar tela (se disponível e habilitado)
  useEffect(() => {
    const tryBiometricLogin = async () => {
      if (
        Platform.OS === 'web' ||
        !biometryAvailable ||
        !biometryEnabled ||
        !hasCredentials ||
        biometryCheckLoading
      ) {
        return;
      }

      // Aguardar um pouco para não interferir com a UI inicial
      setTimeout(async () => {
        try {
          setBiometricLoading(true);
          const credentials = await authenticateBiometry(
            t('auth.signInWithBiometry', { biometry: biometryType.name }),
          );

          if (credentials) {
            await signIn(credentials.email, credentials.password);
          }
        } catch (err: any) {
          // Silenciosamente falhar - usuário pode fazer login manual
          console.log('Login biométrico cancelado ou falhou:', err);
        } finally {
          setBiometricLoading(false);
        }
      }, 500);
    };

    tryBiometricLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometryAvailable, biometryEnabled, hasCredentials, biometryCheckLoading]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);

      // Salvar credenciais se "Lembrar-me" estiver marcado
      if (rememberMe && biometryAvailable) {
        await saveCredentials(email, password);
      }
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometryAvailable || !hasCredentials) {
      setError(t('auth.biometricUnavailable'));
      return;
    }

    setBiometricLoading(true);
    setError('');

    try {
      const credentials = await authenticateBiometry(
        t('auth.signInWithBiometry', { biometry: biometryType.name }),
      );

      if (credentials) {
        await signIn(credentials.email, credentials.password);
      }
    } catch (err: any) {
      setError(err.message || t('auth.biometricError'));
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert(t('common.error'), t('auth.provideEmail'));
      return;
    }

    setResetLoading(true);
    try {
      const result = await sendPasswordResetEmail(resetEmail.trim());
      if (result.success) {
        Alert.alert(
          t('auth.resetEmailSent'),
          t('auth.resetEmailMessage'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                setShowForgotPassword(false);
                setResetEmail('');
              },
            },
          ],
        );
      } else {
        Alert.alert(t('common.error'), result.error || t('auth.resetEmailError'));
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('auth.resetEmailError'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable
          onPress={() => {
            if (Platform.OS === 'web') {
              const win = (globalThis as any).window;
              if (win) {
                win.location.href = '/';
              }
            } else {
              Linking.openURL('/');
            }
          }}
          style={styles.logoContainer}
        >
          <AppLogo size={200} withBackground />
          <Text style={styles.subtitle}>{t('auth.connecting')}</Text>
        </Pressable>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>{t('auth.enter')}</Text>

            <TextInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Button
              mode="text"
              onPress={() => {
                setResetEmail(email);
                setShowForgotPassword(true);
              }}
              style={styles.forgotPasswordButton}
              textColor={theme.colors.primary}
            >
              {t('auth.forgotPassword')}
            </Button>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {/* Botão de login biométrico */}
            {biometryAvailable && hasCredentials && biometryEnabled && Platform.OS !== 'web' && (
              <>
                <Button
                  mode="outlined"
                  onPress={handleBiometricLogin}
                  loading={biometricLoading}
                  disabled={loading || biometricLoading}
                  style={styles.button}
                  icon={biometryType.type === 'FACIAL_RECOGNITION' ? 'face-recognition' : 'fingerprint'}
                >
                  {t('auth.signInWithBiometry', { biometry: biometryType.name })}
                </Button>
                <View style={styles.dividerContainer}>
                  <Divider style={styles.divider} />
                  <Text style={styles.dividerText}>{t('auth.or')}</Text>
                  <Divider style={styles.divider} />
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading || biometricLoading}
              style={styles.button}
              buttonColor={theme.colors.primary}
            >
              {t('auth.signIn')}
            </Button>

            {/* Checkbox "Lembrar-me" */}
            {biometryAvailable && Platform.OS !== 'web' && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                />
                <Text style={styles.checkboxLabel}>
                  {t('auth.rememberMe')} ({t('common.use')} {biometryType.name} {t('auth.nextLogin')})
                </Text>
              </View>
            )}

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              {t('auth.noAccount')} {t('auth.register')}
            </Button>
          </Card.Content>
        </Card>

        <Portal>
          <Dialog visible={showForgotPassword} onDismiss={() => setShowForgotPassword(false)}>
            <Dialog.Title>{t('auth.resetPassword')}</Dialog.Title>
            <Dialog.Content>
              <Text style={{ marginBottom: 16 }}>
                {t('auth.resetEmailMessage')}
              </Text>
              <TextInput
                label={t('auth.email')}
                value={resetEmail}
                onChangeText={setResetEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowForgotPassword(false)}>{t('common.cancel')}</Button>
              <Button onPress={handleForgotPassword} loading={resetLoading} disabled={resetLoading}>
                {t('common.submit')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
