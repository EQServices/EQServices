import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const COOKIE_CONSENT_KEY = '@elastiquality:cookie_consent';

interface CookieConsentBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onAccept, onDecline }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch (error) {
      console.error('Erro ao verificar consentimento de cookies:', error);
      // Em caso de erro, mostrar o banner por segurança
      setVisible(true);
    }
  };

  const handleAccept = async () => {
    try {
      await AsyncStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
      setVisible(false);
      onAccept?.();
    } catch (error) {
      console.error('Erro ao salvar consentimento:', error);
    }
  };

  const handleDecline = async () => {
    try {
      await AsyncStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
      setVisible(false);
      onDecline?.();
    } catch (error) {
      console.error('Erro ao salvar recusa:', error);
    }
  };

  const handleOpenCookiesPolicy = async () => {
    try {
      if (Platform.OS === 'web') {
        // Na web, usar window.location para navegação interna ou deep linking
        if (typeof window !== 'undefined') {
          const baseUrl = window.location.origin;
          await Linking.openURL(`${baseUrl}/cookies`);
        }
      } else {
        // No mobile, usar deep linking
        await Linking.openURL('https://www.eqservices.pt/cookies');
      }
    } catch (error) {
      console.error('Erro ao abrir política de cookies:', error);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>🍪 Cookies e Privacidade</Text>
          <Text style={styles.text}>
            Utilizamos cookies para melhorar a sua experiência, analisar o tráfego do site e personalizar conteúdo.
            Ao continuar a navegar, concorda com a nossa{' '}
            <Text style={styles.link} onPress={handleOpenCookiesPolicy}>
              Política de Cookies
            </Text>
            .
          </Text>
          <View style={styles.buttons}>
            <Button
              mode="outlined"
              onPress={handleDecline}
              style={styles.declineButton}
              textColor={colors.textSecondary}
            >
              Recusar
            </Button>
            <Button
              mode="contained"
              onPress={handleAccept}
              style={styles.acceptButton}
              buttonColor={colors.primary}
            >
              Aceitar
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: 16,
    backgroundColor: Platform.OS === 'web' ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(4px)',
    }),
  },
  card: {
    elevation: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
});

