import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View, Image, Linking, Platform } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme/colors';
import { handlePasswordResetFromQuery } from '../../utils/handlePasswordReset';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const CREDIT_PACKAGES = useMemo(() => [
    { name: t('landing.packages.initial'), credits: 20, price: 19, description: t('landing.packages.initialDescription') },
    { name: t('landing.packages.basic'), credits: 50, price: 45, description: t('landing.packages.basicDescription') },
    { name: t('landing.packages.premium'), credits: 100, price: 80, description: t('landing.packages.premiumDescription') },
    { name: t('landing.packages.payAsYouGo'), credits: 1, price: 1, description: t('landing.packages.payAsYouGoDescription') },
  ], [t]);

  const CLIENT_STEPS = useMemo(() => [
    { title: t('landing.clientSteps.step1Title'), text: t('landing.clientSteps.step1Text') },
    { title: t('landing.clientSteps.step2Title'), text: t('landing.clientSteps.step2Text') },
    { title: t('landing.clientSteps.step3Title'), text: t('landing.clientSteps.step3Text') },
  ], [t]);

  const PRO_STEPS = useMemo(() => [
    { title: t('landing.professionalSteps.step1Title'), text: t('landing.professionalSteps.step1Text') },
    { title: t('landing.professionalSteps.step2Title'), text: t('landing.professionalSteps.step2Text') },
    { title: t('landing.professionalSteps.step3Title'), text: t('landing.professionalSteps.step3Text') },
  ], [t]);

  // Processar token de reset de senha ou magic link se vier via query parameters
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const type = urlParams.get('type');
      const hash = window.location.hash;
      
      // Se há token de recovery ou magic link, processar e redirecionar
      if ((token && (type === 'recovery' || type === 'magiclink')) ||
          (hash && (hash.includes('type=recovery') || hash.includes('type=magiclink')))) {
        handlePasswordResetFromQuery().catch((error) => {
          console.error('Erro ao processar token:', error);
        });
      }
    }
  }, []);

  const handleOpenPolicy = (path: string) => {
    if (Platform.OS === 'web') {
      // Na web, usar window.location para navegar internamente
      // Linking.openURL requer URLs absolutas, então usamos window.location
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    } else {
      // No mobile, primeiro fazer o usuário entrar no app
      // As políticas estarão disponíveis através do AuthStack após entrar
      onEnterApp();
      
      // Tentar usar deep linking após um pequeno delay para garantir
      // que a navegação está pronta
      setTimeout(() => {
        const baseUrl = 'https://elastiquality.pt';
        Linking.openURL(`${baseUrl}${path}`).catch(() => {
          // Se o deep linking falhar, o usuário já entrou no app
          // e pode acessar as políticas através do menu de configurações
          console.log('Deep linking não disponível. Políticas disponíveis após entrar no app.');
        });
      }, 1000);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroSection}>
        <View style={styles.heroImageWrapper}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.heroImage} resizeMode="contain" />
        </View>
        <View style={styles.heroText}>
          <Text style={styles.tag}>{t('landing.tag')}</Text>
          <Text style={styles.title}>{t('landing.title')}</Text>
          <Text style={styles.subtitle}>
            {t('landing.subtitle')}
          </Text>
          <View style={styles.ctaRow}>
            <Button
              mode="contained"
              onPress={onEnterApp}
              buttonColor={colors.primary}
              style={styles.ctaButton}
            >
              {t('landing.clientButton')}
            </Button>
            <Button mode="outlined" onPress={onEnterApp} textColor={colors.primaryDark} style={styles.ctaButton}>
              {t('landing.professionalButton')}
            </Button>
          </View>
          <Text style={styles.helperText}>{t('landing.helperText')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('landing.howItWorksClients')}</Text>
        <View style={styles.cardsRow}>
          {CLIENT_STEPS.map((step) => (
            <Card key={step.title} style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.cardHeading}>{step.title}</Text>
                <Text style={styles.cardText}>{step.text}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.sectionAlt}>
        <Text style={styles.sectionTitle}>{t('landing.howItWorksProfessionals')}</Text>
        <View style={styles.cardsRow}>
          {PRO_STEPS.map((step) => (
            <Card key={step.title} style={styles.infoCardAlt}>
              <Card.Content>
                <Text style={styles.cardHeading}>{step.title}</Text>
                <Text style={styles.cardText}>{step.text}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('landing.whyChoose')}</Text>
        <View style={styles.featuresGrid}>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>{t('landing.features.qualifiedLeads')}</Text>
              <Text style={styles.cardText}>
                {t('landing.features.qualifiedLeadsText')}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>{t('landing.features.transparentReputation')}</Text>
              <Text style={styles.cardText}>
                {t('landing.features.transparentReputationText')}
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>{t('landing.features.realTimeManagement')}</Text>
              <Text style={styles.cardText}>
                {t('landing.features.realTimeManagementText')}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <View style={styles.sectionAlt}>
        <Text style={styles.sectionTitle}>{t('landing.creditPlans')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('landing.creditPlansSubtitle')}
        </Text>
        <View style={styles.cardsRow}>
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.name} style={styles.packageCard}>
              <Card.Content>
                <Text style={styles.packageTitle}>{pkg.name}</Text>
                <Text style={styles.packagePrice}>{pkg.credits} {t('landing.packages.credits')}</Text>
                <Text style={styles.packageValue}>€ {pkg.price.toFixed(2)}</Text>
                <Text style={styles.cardText}>{pkg.description}</Text>
                <Button mode="contained-tonal" onPress={onEnterApp} style={styles.packageButton}>
                  {t('landing.packages.buyCredits')}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
        <Text style={styles.helperText}>{t('landing.packages.expiryInfo')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('landing.readyToStart')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('landing.readyToStartSubtitle')}
        </Text>
        <View style={styles.ctaRow}>
          <Button
            mode="contained"
            onPress={onEnterApp}
            buttonColor={theme.colors.primary}
            style={styles.ctaButtonWide}
          >
            {t('landing.accessPlatform')}
          </Button>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>{t('landing.footerTitle')}</Text>
        <Text style={styles.footerText}>{t('landing.footerText')}</Text>
        <Text style={styles.footerText}>{t('landing.support')}</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink} onPress={() => handleOpenPolicy('/privacy')}>
            {t('landing.privacyPolicy')}
          </Text>
          <Text style={styles.footerLinkSeparator}> • </Text>
          <Text style={styles.footerLink} onPress={() => handleOpenPolicy('/terms')}>
            {t('landing.termsOfService')}
          </Text>
          <Text style={styles.footerLinkSeparator}> • </Text>
          <Text style={styles.footerLink} onPress={() => handleOpenPolicy('/cookies')}>
            {t('landing.cookiePolicy')}
          </Text>
        </View>
        <Text style={styles.footerCopy}>{t('landing.copyright', { year: new Date().getFullYear() })}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    gap: 32,
  },
  heroSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    padding: 32,
    gap: 32,
  },
  heroImageWrapper: {
    flex: 0,
    minWidth: 240,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
    minWidth: 280,
    gap: 16,
  },
  heroImage: {
    width: 260,
    height: 260,
  },
  tag: {
    color: colors.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  ctaButtonWide: {
    borderRadius: 999,
    paddingHorizontal: 24,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    gap: 24,
  },
  sectionAlt: {
    gap: 24,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  infoCard: {
    flexBasis: 260,
    flexGrow: 1,
    backgroundColor: colors.background,
    borderRadius: 16,
  },
  infoCardAlt: {
    flexBasis: 260,
    flexGrow: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  featureCard: {
    flexBasis: 260,
    flexGrow: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  packageCard: {
    flexBasis: 260,
    flexGrow: 1,
    borderRadius: 16,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  packageValue: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 8,
  },
  packageButton: {
    marginTop: 12,
    borderRadius: 12,
  },
  footer: {
    paddingVertical: 32,
    gap: 8,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerCopy: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textSecondary,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  footerLink: {
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
    cursor: 'pointer',
  },
  footerLinkSeparator: {
    fontSize: 12,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
});


