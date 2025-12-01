import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable, Linking, Alert } from 'react-native';
import { TextInput, Button, Text, Card, useTheme, Checkbox, Divider, Dialog, Portal } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { AppLogo } from '../components/AppLogo';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useBiometry } from '../hooks/useBiometry';
import { sendPasswordResetEmail } from '../services/emailVerification';

export const LoginScreen = ({ navigation }: any) => {
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
            `Use ${biometryType.name} para fazer login`,
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
      setError('Por favor, preencha todos os campos');
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
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometryAvailable || !hasCredentials) {
      setError('Biometria não disponível ou nenhuma credencial salva.');
      return;
    }

    setBiometricLoading(true);
    setError('');

    try {
      const credentials = await authenticateBiometry(
        `Use ${biometryType.name} para fazer login`,
      );

      if (credentials) {
        await signIn(credentials.email, credentials.password);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login biométrico');
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }

    setResetLoading(true);
    try {
      const result = await sendPasswordResetEmail(resetEmail.trim());
      if (result.success) {
        Alert.alert(
          'Email enviado',
          'Verifique sua caixa de entrada. Enviamos um link para redefinir sua senha.',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowForgotPassword(false);
                setResetEmail('');
              },
            },
          ],
        );
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível enviar o email de recuperação');
      }
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Erro ao enviar email de recuperação');
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
          <Text style={styles.subtitle}>Conectando clientes a profissionais</Text>
        </Pressable>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Entrar</Text>

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

            <Button
              mode="text"
              onPress={() => {
                setResetEmail(email);
                setShowForgotPassword(true);
              }}
              style={styles.forgotPasswordButton}
              textColor={theme.colors.primary}
            >
              Esqueceu a senha?
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
                  Entrar com {biometryType.name}
                </Button>
                <View style={styles.dividerContainer}>
                  <Divider style={styles.divider} />
                  <Text style={styles.dividerText}>ou</Text>
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
              Entrar
            </Button>

            {/* Checkbox "Lembrar-me" */}
            {biometryAvailable && Platform.OS !== 'web' && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={rememberMe ? 'checked' : 'unchecked'}
                  onPress={() => setRememberMe(!rememberMe)}
                />
                <Text style={styles.checkboxLabel}>
                  Lembrar-me (usar {biometryType.name} no próximo login)
                </Text>
              </View>
            )}

            <Button
              mode="text"
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              Não tem conta? Cadastre-se
            </Button>
          </Card.Content>
        </Card>

        <Portal>
          <Dialog visible={showForgotPassword} onDismiss={() => setShowForgotPassword(false)}>
            <Dialog.Title>Recuperar senha</Dialog.Title>
            <Dialog.Content>
              <Text style={{ marginBottom: 16 }}>
                Informe seu email e enviaremos um link para redefinir sua senha.
              </Text>
              <TextInput
                label="Email"
                value={resetEmail}
                onChangeText={setResetEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowForgotPassword(false)}>Cancelar</Button>
              <Button onPress={handleForgotPassword} loading={resetLoading} disabled={resetLoading}>
                Enviar
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
