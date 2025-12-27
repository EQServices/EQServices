import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, List } from 'react-native-paper';
import { colors } from '../theme/colors';
import { AppLogo } from '../components/AppLogo';

export const ClientGuideScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <AppLogo size={120} withBackground />
        <Text style={styles.title}>Guia do Cliente</Text>
        <Text style={styles.subtitle}>Como criar pedidos e contratar profissionais</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📝 Criar Pedido de Serviço</Text>
          <Text style={styles.text}>
            1. Faça login na sua conta{'\n'}
            2. Clique em "Novo Pedido"{'\n'}
            3. Preencha todas as informações:{'\n'}
            {'   '}• Título do serviço (seja específico){'\n'}
            {'   '}• Categoria{'\n'}
            {'   '}• Descrição detalhada{'\n'}
            {'   '}• Localização{'\n'}
            {'   '}• Orçamento estimado (opcional){'\n'}
            {'   '}• Fotos (opcional, mas recomendado){'\n'}
            4. Clique em "Publicar"
          </Text>
          <Text style={styles.tip}>
            💡 Dica: Quanto mais detalhado for o pedido, mais propostas você receberá!
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📬 Receber e Avaliar Propostas</Text>
          <Text style={styles.text}>
            Normalmente você recebe propostas dentro de 24 horas. Profissionais qualificados na sua região serão notificados automaticamente.
          </Text>
          <Text style={styles.subsectionTitle}>O que avaliar em uma proposta:</Text>
          <Text style={styles.text}>
            ✅ Preço - Está dentro do seu orçamento?{'\n'}
            ✅ Descrição - O profissional entendeu o serviço?{'\n'}
            ✅ Prazo - Quanto tempo levará?{'\n'}
            ✅ Perfil - Quantas estrelas tem? Quantos serviços já realizou?{'\n'}
            ✅ Comunicação - Respondeu rapidamente?
          </Text>
          <Text style={styles.tip}>
            💡 Dica: Nem sempre o mais barato é o melhor! Considere qualidade, avaliações e experiência.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💬 Comunicar com Profissionais</Text>
          <Text style={styles.text}>
            Use o chat integrado para conversar diretamente com os profissionais. Tire todas as dúvidas antes de contratar.
          </Text>
          <Text style={styles.subsectionTitle}>O que perguntar:</Text>
          <Text style={styles.text}>
            • Os materiais estão incluídos no preço?{'\n'}
            • Pode começar na próxima semana?{'\n'}
            • Quanto tempo levará cada etapa?{'\n'}
            • Já fez serviços semelhantes?{'\n'}
            • Oferece garantia?
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>✅ Contratar e Avaliar</Text>
          <Text style={styles.text}>
            1. Escolha a melhor proposta{'\n'}
            2. Clique em "Aceitar Proposta"{'\n'}
            3. Confirme os detalhes{'\n'}
            4. Combine data e hora com o profissional{'\n'}
            5. Após o serviço, avalie o profissional
          </Text>
          <Text style={styles.subsectionTitle}>Como avaliar:</Text>
          <Text style={styles.text}>
            1. Acesse o pedido concluído{'\n'}
            2. Clique em "Avaliar Serviço"{'\n'}
            3. Dê uma nota de 1 a 5 estrelas{'\n'}
            4. Escreva um comentário (opcional){'\n'}
            5. Envie a avaliação
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🎯 Dicas para Melhores Resultados</Text>
          <Text style={styles.text}>
            ✅ Seja específico na descrição{'\n'}
            ✅ Adicione fotos de qualidade{'\n'}
            ✅ Defina orçamento realista{'\n'}
            ✅ Escolha categoria correta{'\n'}
            ✅ Não escolha apenas pelo preço{'\n'}
            ✅ Leia avaliações de outros clientes{'\n'}
            ✅ Compare pelo menos 3 propostas{'\n'}
            ✅ Avalie honestamente após o serviço
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Elastiquality - Encontre Profissionais de Qualidade! 💙
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
    color: colors.primary,
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

