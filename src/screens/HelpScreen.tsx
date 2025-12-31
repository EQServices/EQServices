import React from 'react';
import { ScrollView, StyleSheet, Linking } from 'react-native';
import { Text, Card, List, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

export const HelpScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  
  const handleContactSupport = () => {
    Linking.openURL(`mailto:suporte@eqservices.pt?subject=${encodeURIComponent(t('help.contactSupport'))}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{t('help.title')}</Text>
          <Text style={styles.subtitle}>{t('help.subtitle')}</Text>

          <Text style={styles.sectionTitle}>{t('help.faq')}</Text>
          
          <Card style={styles.faqCard} onPress={() => navigation.navigate('FAQ')}>
            <Card.Content>
              <Text style={styles.faqTitle}>{t('help.faq1Title')}</Text>
              <Text style={styles.faqText}>
                {t('help.faq1Text')}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.faqCard}>
            <Card.Content>
              <Text style={styles.faqTitle}>{t('help.faq2Title')}</Text>
              <Text style={styles.faqText}>
                {t('help.faq2Text')}
              </Text>
            </Card.Content>
          </Card>

          <Card style={styles.faqCard}>
            <Card.Content>
              <Text style={styles.faqTitle}>{t('help.faq3Title')}</Text>
              <Text style={styles.faqText}>
                {t('help.faq3Text')}
              </Text>
            </Card.Content>
          </Card>

          <Text style={styles.sectionTitle}>{t('help.guides')}</Text>
          
          <List.Item
            title={t('help.clientGuide')}
            description={t('help.clientGuideDesc')}
            left={(props) => <List.Icon {...props} icon="account-circle" color={colors.primary} />}
            onPress={() => navigation.navigate('ClientGuide')}
            style={styles.listItem}
          />

          <List.Item
            title={t('help.professionalGuide')}
            description={t('help.professionalGuideDesc')}
            left={(props) => <List.Icon {...props} icon="briefcase" color={colors.professional} />}
            onPress={() => navigation.navigate('ProfessionalGuide')}
            style={styles.listItem}
          />

          <Text style={styles.sectionTitle}>{t('help.contacts')}</Text>
          
          <Button
            mode="contained"
            onPress={handleContactSupport}
            style={styles.contactButton}
            icon="email"
          >
            {t('help.contactSupport')}
          </Button>

          <Text style={styles.contactText}>
            {t('help.supportEmail')}
          </Text>
          <Text style={styles.contactText}>
            {t('help.responseTime')}
          </Text>

          <Text style={styles.sectionTitle}>{t('help.documents')}</Text>
          
          <List.Item
            title={t('help.privacyPolicy')}
            left={(props) => <List.Icon {...props} icon="shield-lock" color={colors.primary} />}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            style={styles.listItem}
          />

          <List.Item
            title={t('help.termsOfService')}
            left={(props) => <List.Icon {...props} icon="file-document" color={colors.primary} />}
            onPress={() => navigation.navigate('TermsOfService')}
            style={styles.listItem}
          />

          <List.Item
            title={t('help.cookiePolicy')}
            left={(props) => <List.Icon {...props} icon="cookie" color={colors.primary} />}
            onPress={() => navigation.navigate('CookiePolicy')}
            style={styles.listItem}
          />
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
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  faqCard: {
    marginBottom: 12,
    elevation: 1,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  faqText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  listItem: {
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 8,
  },
  contactButton: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: colors.primary,
  },
  contactText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
});

