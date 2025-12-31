import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

export const CookiePolicyScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{t('policies.cookies.title')}</Text>
          <Text style={styles.lastUpdated}>{t('policies.cookies.lastUpdated')}: {new Date().toLocaleDateString()}</Text>

          <Text style={styles.sectionTitle}>1. O que são Cookies?</Text>
          <Text style={styles.text}>
            Cookies são pequenos ficheiros de texto que são colocados no seu dispositivo quando visita um website ou aplicação.
            Eles permitem que a plataforma reconheça o seu dispositivo e armazene algumas informações sobre as suas preferências
            ou ações passadas.
          </Text>

          <Text style={styles.sectionTitle}>2. Como Utilizamos Cookies</Text>
          <Text style={styles.text}>
            Utilizamos cookies para:
          </Text>
          <Text style={styles.bulletPoint}>• Garantir o funcionamento adequado da plataforma</Text>
          <Text style={styles.bulletPoint}>• Lembrar as suas preferências e configurações</Text>
          <Text style={styles.bulletPoint}>• Melhorar a sua experiência de utilização</Text>
          <Text style={styles.bulletPoint}>• Analisar como utiliza a plataforma</Text>
          <Text style={styles.bulletPoint}>• Personalizar conteúdo e anúncios</Text>

          <Text style={styles.sectionTitle}>3. Tipos de Cookies que Utilizamos</Text>
          <Text style={styles.text}>
            Utilizamos os seguintes tipos de cookies:
          </Text>
          <Text style={styles.bulletPoint}>• Cookies essenciais: necessários para o funcionamento da plataforma</Text>
          <Text style={styles.bulletPoint}>• Cookies de funcionalidade: permitem lembrar as suas escolhas</Text>
          <Text style={styles.bulletPoint}>• Cookies de análise: ajudam-nos a entender como os utilizadores interagem com a plataforma</Text>
          <Text style={styles.bulletPoint}>• Cookies de marketing: utilizados para fornecer anúncios relevantes</Text>

          <Text style={styles.sectionTitle}>4. Cookies de Terceiros</Text>
          <Text style={styles.text}>
            Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas páginas. Estes incluem:
          </Text>
          <Text style={styles.bulletPoint}>• Google Analytics: para análise de tráfego</Text>
          <Text style={styles.bulletPoint}>• Stripe: para processamento de pagamentos</Text>
          <Text style={styles.bulletPoint}>• Supabase: para autenticação e armazenamento de dados</Text>

          <Text style={styles.sectionTitle}>5. Gerir Cookies</Text>
          <Text style={styles.text}>
            Pode controlar e gerir cookies através das configurações do seu navegador. Pode configurar o seu navegador para
            recusar cookies ou para o alertar quando um cookie está a ser enviado. No entanto, se desativar cookies, algumas
            funcionalidades da plataforma podem não funcionar corretamente.
          </Text>

          <Text style={styles.sectionTitle}>6. Alterações a Esta Política</Text>
          <Text style={styles.text}>
            Podemos atualizar esta política de cookies periodicamente. Recomendamos que reveja esta página regularmente para
            se manter informado sobre como utilizamos cookies.
          </Text>

          <Text style={styles.sectionTitle}>7. Contacto</Text>
          <Text style={styles.text}>
            Para questões sobre a nossa utilização de cookies, contacte-nos em:
          </Text>
          <Text style={styles.contact}>Email: privacidade@eqservices.pt</Text>
          <Text style={styles.contact}>Suporte: suporte@eqservices.pt</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    marginLeft: 16,
    marginBottom: 4,
  },
  contact: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
});

