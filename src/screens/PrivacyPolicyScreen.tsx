import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

export const PrivacyPolicyScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{t('policies.privacy.title')}</Text>
          <Text style={styles.lastUpdated}>{t('policies.privacy.lastUpdated')}: {new Date().toLocaleDateString()}</Text>

          <Text style={styles.sectionTitle}>1. Introdução</Text>
          <Text style={styles.text}>
            O Elastiquality ("nós", "nosso" ou "aplicação") respeita a sua privacidade e está comprometido em proteger
            os seus dados pessoais. Esta política de privacidade explica como coletamos, usamos e protegemos as suas
            informações quando utiliza a nossa plataforma.
          </Text>

          <Text style={styles.sectionTitle}>2. Dados que Coletamos</Text>
          <Text style={styles.text}>
            Coletamos os seguintes tipos de dados pessoais:
          </Text>
          <Text style={styles.bulletPoint}>• Informações de conta: nome, email, telefone, tipo de utilizador</Text>
          <Text style={styles.bulletPoint}>• Informações de localização: distrito, concelho, freguesia</Text>
          <Text style={styles.bulletPoint}>• Informações de perfil: foto de perfil, descrição profissional</Text>
          <Text style={styles.bulletPoint}>• Dados de transação: histórico de compras e pagamentos</Text>
          <Text style={styles.bulletPoint}>• Dados de comunicação: mensagens trocadas na plataforma</Text>

          <Text style={styles.sectionTitle}>3. Como Usamos os Seus Dados</Text>
          <Text style={styles.text}>
            Utilizamos os seus dados pessoais para:
          </Text>
          <Text style={styles.bulletPoint}>• Fornecer e melhorar os nossos serviços</Text>
          <Text style={styles.bulletPoint}>• Processar transações e pagamentos</Text>
          <Text style={styles.bulletPoint}>• Facilitar a comunicação entre clientes e profissionais</Text>
          <Text style={styles.bulletPoint}>• Enviar notificações importantes sobre a sua conta</Text>
          <Text style={styles.bulletPoint}>• Cumprir obrigações legais e regulamentares</Text>

          <Text style={styles.sectionTitle}>4. Compartilhamento de Dados</Text>
          <Text style={styles.text}>
            Não vendemos os seus dados pessoais. Podemos compartilhar informações apenas nas seguintes situações:
          </Text>
          <Text style={styles.bulletPoint}>• Com outros utilizadores da plataforma (conforme necessário para o serviço)</Text>
          <Text style={styles.bulletPoint}>• Com prestadores de serviços que nos ajudam a operar a plataforma</Text>
          <Text style={styles.bulletPoint}>• Quando exigido por lei ou para proteger os nossos direitos</Text>

          <Text style={styles.sectionTitle}>5. Segurança dos Dados</Text>
          <Text style={styles.text}>
            Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados pessoais contra
            acesso não autorizado, alteração, divulgação ou destruição.
          </Text>

          <Text style={styles.sectionTitle}>6. Os Seus Direitos</Text>
          <Text style={styles.text}>
            De acordo com o RGPD, tem direito a:
          </Text>
          <Text style={styles.bulletPoint}>• Aceder aos seus dados pessoais</Text>
          <Text style={styles.bulletPoint}>• Retificar dados incorretos</Text>
          <Text style={styles.bulletPoint}>• Solicitar a eliminação dos seus dados</Text>
          <Text style={styles.bulletPoint}>• Opor-se ao processamento dos seus dados</Text>
          <Text style={styles.bulletPoint}>• Portabilidade dos dados</Text>

          <Text style={styles.sectionTitle}>7. Retenção de Dados</Text>
          <Text style={styles.text}>
            Mantemos os seus dados pessoais apenas pelo tempo necessário para cumprir os fins descritos nesta política,
            a menos que um período de retenção mais longo seja exigido ou permitido por lei.
          </Text>

          <Text style={styles.sectionTitle}>8. Cookies e Tecnologias Similares</Text>
          <Text style={styles.text}>
            Utilizamos cookies e tecnologias similares para melhorar a sua experiência, analisar o uso da plataforma e
            personalizar conteúdo.
          </Text>

          <Text style={styles.sectionTitle}>9. Alterações a Esta Política</Text>
          <Text style={styles.text}>
            Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre alterações significativas
            através da plataforma ou por email.
          </Text>

          <Text style={styles.sectionTitle}>10. Contacto</Text>
          <Text style={styles.text}>
            Para questões sobre esta política de privacidade ou para exercer os seus direitos, contacte-nos em:
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

