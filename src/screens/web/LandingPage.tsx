import React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { colors } from '../../theme/colors';

interface LandingPageProps {
  onEnterApp: () => void;
}

const CREDIT_PACKAGES = [
  { name: 'Pacote Básico', credits: 50, price: 45, description: 'Ideal para começar a captar novos clientes (10% de desconto).' },
  { name: 'Pacote Premium', credits: 100, price: 80, description: 'Melhor custo-benefício com 20% de desconto.' },
  { name: 'Pay as you go', credits: 1, price: 1, description: 'Compre moedas conforme a demanda do seu negócio.' },
];

const CLIENT_STEPS = [
  { title: 'Descreva o serviço', text: 'Informe categoria, localização, detalhes e fotos para explicar o que precisa.' },
  { title: 'Receba propostas', text: 'Profissionais avaliados enviam orçamentos e você compara valores, prazos e reputação.' },
  { title: 'Feche direto', text: 'Converse pelo chat ou telefone, negocie e combine o serviço com total liberdade.' },
];

const PRO_STEPS = [
  { title: 'Cadastre-se e configure', text: 'Escolha categorias, regiões de atuação e monte o seu portfólio.' },
  { title: 'Compre créditos', text: 'Adquira moedas com cartão de crédito ou carteira digital para desbloquear contatos.' },
  { title: 'Conquiste novos clientes', text: 'Veja leads qualificados, desbloqueie os que interessam e envie propostas.' },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const theme = useTheme();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroSection}>
        <View style={styles.heroText}>
          <Text style={styles.tag}>Marketplace de serviços em Portugal</Text>
          <Text style={styles.title}>Conectamos clientes a profissionais de confiança</Text>
          <Text style={styles.subtitle}>
            Solicite um serviço sem custo ou desbloqueie novos leads para o seu negócio. O Elastiquality aproxima quem
            precisa de ajuda de quem sabe fazer.
          </Text>
          <View style={styles.ctaRow}>
            <Button
              mode="contained"
              onPress={onEnterApp}
              buttonColor={colors.primary}
              style={styles.ctaButton}
            >
              Sou cliente
            </Button>
            <Button mode="outlined" onPress={onEnterApp} textColor={colors.primaryDark} style={styles.ctaButton}>
              Sou profissional
            </Button>
          </View>
          <Text style={styles.helperText}>Disponível em Web, Android e iOS. É grátis para solicitar orçamentos.</Text>
        </View>
        <View style={styles.heroImageWrapper}>
          <Image source={require('../../../assets/images/logo.png')} style={styles.heroImage} resizeMode="contain" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Como funciona para clientes</Text>
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
        <Text style={styles.sectionTitle}>Como funciona para profissionais</Text>
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
        <Text style={styles.sectionTitle}>Por que escolher o Elastiquality?</Text>
        <View style={styles.featuresGrid}>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>Leads qualificados</Text>
              <Text style={styles.cardText}>
                Usamos filtros por categoria, localização e demanda para entregar oportunidades alinhadas ao seu perfil.
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>Reputação transparente</Text>
              <Text style={styles.cardText}>
                Avaliações, histórico e portfólio ajudam clientes a decidir com mais confiança e destacar bons
                profissionais.
              </Text>
            </Card.Content>
          </Card>
          <Card style={styles.featureCard}>
            <Card.Content>
              <Text style={styles.featureTitle}>Gestão em tempo real</Text>
              <Text style={styles.cardText}>
                Acompanhe leads, propostas e gastos em um painel completo, com alertas via app, e-mail e push.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <View style={styles.sectionAlt}>
        <Text style={styles.sectionTitle}>Planos de créditos flexíveis</Text>
        <Text style={styles.sectionSubtitle}>
          Compre moedas e desbloqueie contatos qualificados. Cada lead exibe o custo antes do desbloqueio.
        </Text>
        <View style={styles.cardsRow}>
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.name} style={styles.packageCard}>
              <Card.Content>
                <Text style={styles.packageTitle}>{pkg.name}</Text>
                <Text style={styles.packagePrice}>{pkg.credits} moedas</Text>
                <Text style={styles.packageValue}>€ {pkg.price.toFixed(2)}</Text>
                <Text style={styles.cardText}>{pkg.description}</Text>
                <Button mode="contained-tonal" onPress={onEnterApp} style={styles.packageButton}>
                  Comprar créditos
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>
        <Text style={styles.helperText}>Moedas expiram em 3 meses. Pagamento por cartão, Apple Pay ou Google Pay.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pronto para começar?</Text>
        <Text style={styles.sectionSubtitle}>
          Clientes pedem sem custo. Profissionais desbloqueiam leads e aumentam a agenda de serviços.
        </Text>
        <View style={styles.ctaRow}>
          <Button
            mode="contained"
            onPress={onEnterApp}
            buttonColor={theme.colors.primary}
            style={styles.ctaButtonWide}
          >
            Acessar plataforma
          </Button>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>Elastiquality</Text>
        <Text style={styles.footerText}>Marketplace português que conecta clientes a profissionais locais.</Text>
        <Text style={styles.footerText}>Suporte: suporte@elastiquality.pt</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink} onPress={() => window.open('/privacy', '_blank')}>
            Política de Privacidade
          </Text>
          <Text style={styles.footerLinkSeparator}> • </Text>
          <Text style={styles.footerLink} onPress={() => window.open('/terms', '_blank')}>
            Termos de Uso
          </Text>
          <Text style={styles.footerLinkSeparator}> • </Text>
          <Text style={styles.footerLink} onPress={() => window.open('/cookies', '_blank')}>
            Política de Cookies
          </Text>
        </View>
        <Text style={styles.footerCopy}>© {new Date().getFullYear()} Elastiquality. Todos os direitos reservados.</Text>
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
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceLight,
    borderRadius: 24,
    padding: 32,
    gap: 32,
  },
  heroText: {
    flex: 1,
    minWidth: 280,
    gap: 16,
  },
  heroImageWrapper: {
    flex: 1,
    minWidth: 240,
    alignItems: 'center',
    justifyContent: 'center',
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


