import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Card, HelperText } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { supabase } from '../config/supabase';
import { AppLogo } from '../components/AppLogo';
import * as Linking from 'expo-linking';

export const ResetPasswordScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [processingToken, setProcessingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Processar o token do link de reset quando a tela carrega
    const processResetToken = async () => {
      try {
        // Verificar se há hash na URL com token de recovery OU erro
        let hasRecoveryToken = false;
        let hasQueryToken = false;
        let hasError = false;
        let errorMessage = '';
        
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // Verificar hash (formato: #access_token=...&type=recovery OU #error=...)
          const hash = window.location.hash;
          hasRecoveryToken = hash.includes('access_token') && hash.includes('type=recovery');
          
          // Verificar se há erro no hash
          if (hash.includes('error=')) {
            hasError = true;
            const errorParams = new URLSearchParams(hash.substring(1));
            const errorCode = errorParams.get('error_code');
            const errorDesc = errorParams.get('error_description');
            
            if (errorCode === 'otp_expired') {
              errorMessage = t('resetPassword.expired');
            } else if (errorCode === 'access_denied') {
              errorMessage = t('resetPassword.invalidOrUsed');
            } else {
              errorMessage = errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) : t('resetPassword.invalidOrExpiredGeneric');
            }
          }
          
          // Verificar query parameters (formato: ?token=...&type=recovery)
          const urlParams = new URLSearchParams(window.location.search);
          const queryToken = urlParams.get('token');
          const queryType = urlParams.get('type');
          hasQueryToken = !!queryToken && queryType === 'recovery';
          
          // Se há erro, mostrar mensagem e parar processamento
          if (hasError) {
            setError(errorMessage);
            setProcessingToken(false);
            // Limpar hash da URL
            window.history.replaceState({}, '', window.location.pathname);
            return;
          }
          
          if (hasRecoveryToken) {
            console.log('Token de recovery detectado no hash da URL');
            // O Supabase processa automaticamente quando detectSessionInUrl está true
            // Aguardar um pouco para o processamento
            await new Promise(resolve => setTimeout(resolve, 500));
          } else if (hasQueryToken && queryToken) {
            console.log('Token de recovery detectado nos query parameters');
            // Processar token via query parameters
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: queryToken,
              type: 'recovery',
            });
            
            if (error) {
              console.error('Erro ao verificar token:', error);
              
              // Verificar se é erro de expiração
              if (error.message.includes('expired') || error.message.includes('invalid')) {
                setError(t('resetPassword.invalidOrExpiredGeneric'));
                setProcessingToken(false);
                // Limpar query parameters da URL
                window.history.replaceState({}, '', window.location.pathname);
                return;
              }
              
              // Tentar verificar sessão mesmo com erro (pode ter sido processado pelo Supabase)
              await new Promise(resolve => setTimeout(resolve, 1000));
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  setTokenValid(true);
                  // Limpar query parameters da URL
                  window.history.replaceState({}, '', window.location.pathname);
                  return;
                }
              }
              setError(t('resetPassword.processingError'));
              setProcessingToken(false);
              return;
            }
            
            if (data) {
              console.log('Token verificado com sucesso via query parameters');
              // Aguardar um pouco para garantir que a sessão foi criada
              await new Promise(resolve => setTimeout(resolve, 500));
              // Limpar query parameters da URL
              window.history.replaceState({}, '', window.location.pathname);
            }
          }
        }

        // Verificar sessão após processamento
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError);
          setError(t('resetPassword.processingError'));
          setProcessingToken(false);
          return;
        }

        if (session) {
          // Verificar se o usuário está autenticado (indica que o token foi processado)
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('Erro ao obter usuário:', userError);
            setError(t('resetPassword.processingError'));
            setProcessingToken(false);
            return;
          }

          if (user) {
            console.log('Token de reset processado com sucesso');
            setTokenValid(true);
          } else {
            setError(t('resetPassword.requestNewLinkGeneric'));
          }
        } else {
          // Se não há sessão e não há token na URL, verificar se chegou aqui após redirect do Supabase
          // O Supabase pode ter processado o token e redirecionado sem deixar token na URL
          if (!hasRecoveryToken && !hasQueryToken) {
            // Verificar se há sessão mesmo sem token (pode ter sido criada pelo Supabase antes do redirect)
            console.log('Sem token na URL, verificando se há sessão criada pelo Supabase...');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar processamento
            
            const { data: { session: checkSession } } = await supabase.auth.getSession();
            if (checkSession) {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                console.log('Sessão encontrada após redirect do Supabase');
                setTokenValid(true);
                setProcessingToken(false);
                return;
              }
            }
            
            setError(t('resetPassword.requestNewLink'));
          } else {
            // Há token mas não foi processado - tentar novamente
            console.log('Token detectado mas não processado, tentando novamente...');
            setTimeout(async () => {
              const { data: { session: retrySession } } = await supabase.auth.getSession();
              if (retrySession) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  setTokenValid(true);
                } else {
                  setError(t('resetPassword.requestNewLinkGeneric'));
                }
              } else {
                setError(t('resetPassword.processingError'));
              }
              setProcessingToken(false);
            }, 2000);
            return; // Não definir processingToken como false ainda
          }
        }
      } catch (err: any) {
        console.error('Erro ao processar token de reset:', err);
        setError(t('resetPassword.processingError'));
      } finally {
        setProcessingToken(false);
      }
    };

    // Escutar mudanças de autenticação para detectar quando o token é processado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');
      
      // Detectar qualquer evento que crie uma sessão (PASSWORD_RECOVERY, SIGNED_IN, TOKEN_REFRESHED)
      if (session && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('Sessão criada via evento:', event);
        const checkUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('Usuário encontrado, token válido');
            setTokenValid(true);
            setProcessingToken(false);
          }
        };
        checkUser();
      }
    });

    processResetToken();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    setFieldErrors({});
    setError('');

    // Validações
    const missingFields: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    if (!password) {
      missingFields.push(t('resetPassword.newPassword'));
      newFieldErrors.password = t('resetPassword.requiredField');
    }
    if (!confirmPassword) {
      missingFields.push(t('resetPassword.confirmNewPassword'));
      newFieldErrors.confirmPassword = t('resetPassword.requiredField');
    }

    if (missingFields.length > 0) {
      setFieldErrors(newFieldErrors);
      setError(t('resetPassword.fillFields', { fields: missingFields.join(', ') }));
      return;
    }

    if (password.length < 6) {
      setError(t('resetPassword.passwordMinLength'));
      newFieldErrors.password = t('resetPassword.minLength');
      setFieldErrors(newFieldErrors);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('resetPassword.passwordsDontMatch'));
      newFieldErrors.confirmPassword = t('resetPassword.passwordsDontMatch');
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Atualizar senha usando o Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      Alert.alert(
        t('resetPassword.passwordChanged'),
        t('resetPassword.passwordChangedMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Fazer logout para garantir que o usuário faça login novamente
              supabase.auth.signOut();
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Erro ao alterar senha:', err);
      setError(err.message || t('resetPassword.changePasswordError'));
    } finally {
      setLoading(false);
    }
  };

  if (processingToken) {
    return (
      <View style={styles.centered}>
        <AppLogo size={200} withBackground />
        <Text style={styles.loadingText}>{t('resetPassword.processing')}</Text>
      </View>
    );
  }

  if (!tokenValid) {
    return (
      <View style={styles.centered}>
        <AppLogo size={200} withBackground />
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.error}>{error || t('resetPassword.invalidOrExpired')}</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Login')}
              style={styles.button}
              buttonColor={colors.primary}
            >
              {t('resetPassword.backToLogin')}
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

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
            <Text style={styles.cardTitle}>{t('resetPassword.title')}</Text>
            <Text style={styles.subtitle}>
              {t('resetPassword.subtitle')}
            </Text>

            <TextInput
              label={`${t('resetPassword.newPassword')} *`}
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
              label={`${t('resetPassword.confirmNewPassword')} *`}
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

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading}
              style={styles.button}
              buttonColor={colors.primary}
            >
              {t('resetPassword.changePassword')}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
              style={styles.cancelButton}
              textColor={colors.textSecondary}
            >
              {t('common.cancel')}
            </Button>

            <Text style={styles.infoText}>
              {t('resetPassword.requiredFields')}
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  cancelButton: {
    marginTop: 8,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

