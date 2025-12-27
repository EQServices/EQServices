import React from 'react';
import { View, ScrollView, StyleSheet, Linking, Platform } from 'react-native';
import { Text, Card, List, Button, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { AppLogo } from '../components/AppLogo';

export const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const openLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Erro ao abrir link:', error);
    }
  };

  const openEmail = () => {
    Linking.openURL('mailto:suporte@elastiquality.pt?subject=Ajuda - Elastiquality');
  };

  const openWhatsApp = () => {
    // Substitua pelo número real quando disponível
    const phoneNumber = '351912345678';
    const message = 'Olá, preciso de ajuda com a Elastiquality';
    const url = Platform.OS === 'ios' 
      ? `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
      : `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      alert('WhatsApp não está instalado no seu dispositivo');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <AppLogo size={150} withBackground />
        <Text style={styles.title}>Central de Ajuda</Text>
        <Text style={styles.subtitle}>
          Encontre respostas para suas dúvidas
        </Text>
      </View>

      {/* Documentação */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📚 Documentação</Text>
          
          <List.Item
            title="Perguntas Frequentes (FAQ)"
            description="Respostas para as dúvidas mais comuns"
            left={props => <List.Icon {...props} icon="help-circle" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation?.navigate('FAQ')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Guia do Cliente"
            description="Como criar pedidos e contratar profissionais"
            left={props => <List.Icon {...props} icon="account" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ClientGuide')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Guia do Profissional"
            description="Como conseguir clientes e crescer seu negócio"
            left={props => <List.Icon {...props} icon="briefcase" color={colors.primary} />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ProfessionalGuide')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Tópicos Rápidos */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🔍 Tópicos Rápidos</Text>
          
          <List.Item
            title="Como criar um pedido?"
            left={props => <List.Icon {...props} icon="file-document-edit" />}
            onPress={() => navigation?.navigate('FAQ')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Como comprar créditos?"
            left={props => <List.Icon {...props} icon="credit-card" />}
            onPress={() => navigation?.navigate('FAQ')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Como enviar uma proposta?"
            left={props => <List.Icon {...props} icon="send" />}
            onPress={() => navigation?.navigate('FAQ')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Como avaliar um serviço?"
            left={props => <List.Icon {...props} icon="star" />}
            onPress={() => navigation?.navigate('FAQ')}
            style={styles.listItem}
          />

          <Divider />

          <List.Item
            title="Problemas técnicos"
            left={props => <List.Icon {...props} icon="alert-circle" />}
            onPress={() => navigation?.navigate('FAQ')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Contacto */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📞 Precisa de Mais Ajuda?</Text>
          <Text style={styles.contactText}>
            Nossa equipe está pronta para ajudar!
          </Text>

          <Button
            mode="contained"
            icon="email"
            onPress={openEmail}
            style={styles.contactButton}
            buttonColor={colors.primary}
          >
            Enviar Email
          </Button>

          <Button
            mode="outlined"
            icon="whatsapp"
            onPress={openWhatsApp}
            style={styles.contactButton}
          >
            WhatsApp
          </Button>

          <Text style={styles.scheduleText}>
            📅 Horário de Atendimento:{'\n'}
            Segunda a Sexta: 9h - 18h{'\n'}
            Sábado: 9h - 13h
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Elastiquality - Conectando Qualidade e Confiança 💙
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 15,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
  },
  card: {
    margin: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 5,
  },
  contactText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  contactButton: {
    marginVertical: 8,
  },
  scheduleText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


