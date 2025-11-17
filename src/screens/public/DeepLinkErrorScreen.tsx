import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { colors } from '../../theme/colors';

interface DeepLinkErrorScreenProps {
  navigation: any;
  route?: {
    params?: {
      error?: string;
      linkType?: string;
    };
  };
}

export const DeepLinkErrorScreen: React.FC<DeepLinkErrorScreenProps> = ({ navigation, route }) => {
  const error = route?.params?.error || 'Link inválido ou expirado';
  const linkType = route?.params?.linkType || 'desconhecido';

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Login');
    }
  };

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.icon}>🔗</Text>
          <Text style={styles.title}>Link Inválido</Text>
          <Text style={styles.message}>{error}</Text>
          <Text style={styles.subtitle}>
            Tipo de link: {linkType}
          </Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleGoBack} style={styles.button}>
              Voltar
            </Button>
            <Button mode="outlined" onPress={handleGoHome} style={styles.button}>
              Ir para Login
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
});

