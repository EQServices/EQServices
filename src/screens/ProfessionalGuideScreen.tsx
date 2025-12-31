import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { colors } from '../theme/colors';
import { AppLogo } from '../components/AppLogo';

export const ProfessionalGuideScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <AppLogo size={120} withBackground />
        <Text style={styles.title}>Guia do Profissional</Text>
        <Text style={styles.subtitle}>Como conseguir clientes e crescer seu negócio</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🚀 Primeiros Passos</Text>
          <Text style={styles.text}>
            1. Crie sua conta profissional{'\n'}
            2. Complete seu perfil 100%{'\n'}
            3. Adicione foto profissional{'\n'}
            4. Selecione suas especialidades{'\n'}
            5. Escolha suas regiões de atuação{'\n'}
            6. Configure notificações
          </Text>
          <Text style={styles.tip}>
            💡 Um perfil completo recebe 3x mais propostas aceitas!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💎 Sistema de Créditos</Text>
          <Text style={styles.text}>
            Créditos são a moeda da plataforma. Você usa créditos para desbloquear leads e ver os dados de contacto dos clientes.
          </Text>
          <Text style={styles.subsectionTitle}>Pacotes disponíveis:</Text>
          <Text style={styles.text}>
            • Pay as you go: 1 moeda por €1{'\n'}
            • Pacote Inicial: 20 moedas por €19 (5% desconto){'\n'}
            • Pacote Básico: 50 moedas por €45 (10% desconto){'\n'}
            • Pacote Premium: 100 moedas por €80 (20% desconto)
          </Text>
          <Text style={styles.tip}>
            💡 Os créditos nunca expiram e podem ser usados a qualquer momento!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 Encontrar e Desbloquear Leads</Text>
          <Text style={styles.text}>
            Você pode ver uma pré-visualização gratuita de cada lead antes de desbloquear. Isso inclui:
          </Text>
          <Text style={styles.text}>
            ✅ Título do serviço{'\n'}
            ✅ Categoria{'\n'}
            ✅ Descrição completa{'\n'}
            ✅ Localização{'\n'}
            ✅ Orçamento estimado{'\n'}
            ✅ Fotos{'\n'}
            ✅ Custo em créditos
          </Text>
          <Text style={styles.subsectionTitle}>Antes de desbloquear, pergunte-se:</Text>
          <Text style={styles.text}>
            • Posso fazer este serviço?{'\n'}
            • Vale a pena financeiramente?{'\n'}
            • Consigo atender a região?{'\n'}
            • Tenho chances de ganhar?
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📝 Enviar Propostas Vencedoras</Text>
          <Text style={styles.subsectionTitle}>Uma proposta perfeita inclui:</Text>
          <Text style={styles.text}>
            1. Preço justo e competitivo{'\n'}
            2. Descrição detalhada do que vai fazer{'\n'}
            3. Prazo realista{'\n'}
            4. Materiais incluídos{'\n'}
            5. Garantia oferecida{'\n'}
            6. Diferenciais profissionais
          </Text>
          <Text style={styles.tip}>
            💡 Propostas detalhadas e profissionais têm muito mais chance de serem aceitas!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>⭐ Construir Reputação</Text>
          <Text style={styles.text}>
            Avaliações são muito importantes! Clientes escolhem profissionais com 4.5+ estrelas.
          </Text>
          <Text style={styles.subsectionTitle}>Como conseguir 5 estrelas:</Text>
          <Text style={styles.text}>
            ✅ Qualidade do trabalho{'\n'}
            ✅ Cumprimento de prazos{'\n'}
            ✅ Profissionalismo{'\n'}
            ✅ Limpeza e organização{'\n'}
            ✅ Comunicação rápida
          </Text>
          <Text style={styles.tip}>
            💡 Após concluir o serviço, peça uma avaliação ao cliente!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🚀 Maximizar Resultados</Text>
          <Text style={styles.text}>
            ✅ Responda em até 2 horas{'\n'}
            ✅ Mantenha créditos disponíveis{'\n'}
            ✅ Envie propostas personalizadas{'\n'}
            ✅ Complete seu perfil 100%{'\n'}
            ✅ Mostre exemplos de trabalhos anteriores{'\n'}
            ✅ Seja profissional na comunicação
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Elastiquality - Cresça Seu Negócio! 💙
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
    color: colors.secondary,
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
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tip: {
    fontSize: 14,
    color: colors.secondary,
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 20,
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

