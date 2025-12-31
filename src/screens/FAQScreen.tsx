import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, List, Divider } from 'react-native-paper';
import { colors } from '../theme/colors';
import { AppLogo } from '../components/AppLogo';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  // Tópicos Rápidos
  {
    question: 'Como criar um pedido?',
    answer: `1. Faça login na sua conta
2. Clique em "Novo Pedido"
3. Preencha:
   - Título do serviço (seja específico)
   - Categoria
   - Descrição detalhada
   - Localização
   - Orçamento estimado (opcional)
   - Fotos (opcional, mas recomendado)
4. Clique em "Publicar"

Dica: Quanto mais detalhado for o pedido, mais propostas você receberá!`,
    category: 'Cliente',
  },
  {
    question: 'Como comprar créditos?',
    answer: `1. Acesse "Comprar Créditos" no menu
2. Escolha um pacote:
   - Pay as you go: 1 moeda por €1
   - Pacote Inicial: 20 moedas por €19 (5% desconto)
   - Pacote Básico: 50 moedas por €45 (10% desconto)
   - Pacote Premium: 100 moedas por €80 (20% desconto)
3. Pague com cartão de crédito/débito, Apple Pay ou Google Pay
4. Créditos adicionados instantaneamente

Os créditos nunca expiram e podem ser usados a qualquer momento.`,
    category: 'Profissional',
  },
  {
    question: 'Como enviar uma proposta?',
    answer: `1. Desbloqueie o lead de interesse (gasta créditos)
2. Clique em "Enviar Proposta"
3. Preencha:
   - Preço do serviço (seja transparente)
   - Descrição detalhada do que vai fazer
   - Prazo estimado (seja realista)
   - Materiais incluídos
4. Envie a proposta
5. Aguarde resposta do cliente

Dica: Propostas detalhadas e profissionais têm muito mais chance de serem aceitas!`,
    category: 'Profissional',
  },
  {
    question: 'Como avaliar um serviço?',
    answer: `Após a conclusão do serviço:
1. Acesse o pedido concluído
2. Clique em "Avaliar Serviço"
3. Dê uma nota de 1 a 5 estrelas
4. Escreva um comentário (opcional, mas recomendado)
5. Envie a avaliação

Avalie considerando:
- Qualidade do trabalho
- Cumprimento de prazos
- Profissionalismo
- Limpeza e organização
- Comunicação`,
    category: 'Cliente',
  },
  {
    question: 'Problemas técnicos',
    answer: `Se estiver com problemas técnicos:

1. Verifique sua conexão com a internet
2. Feche e abra o app novamente
3. Limpe o cache do navegador (se estiver usando web)
4. Atualize para a versão mais recente
5. Reinicie seu dispositivo

Se o problema persistir:
- Email: suporte@elastiquality.pt
- Horário: Segunda a Sexta, 9h-18h

Ao reportar, inclua:
- Descrição do problema
- Passos para reproduzir
- Screenshots (se possível)
- Modelo do dispositivo e versão do app`,
    category: 'Geral',
  },
  // Perguntas Adicionais do FAQ
  {
    question: 'O que é a Elastiquality?',
    answer: `A Elastiquality é uma plataforma que conecta clientes que precisam de serviços com profissionais qualificados em Portugal. Facilitamos o encontro entre quem precisa e quem pode realizar serviços de qualidade.

A plataforma é gratuita para clientes. Profissionais pagam apenas pelos leads que desbloqueiam (sistema de créditos).`,
    category: 'Geral',
  },
  {
    question: 'A plataforma é gratuita?',
    answer: `Sim e não, depende do seu perfil:

- Para Clientes: Sim, completamente gratuito! Você pode criar pedidos, receber propostas e contratar profissionais sem pagar nada.

- Para Profissionais: Gratuito para criar conta. Você paga apenas pelos leads que desbloquear (sistema de créditos).`,
    category: 'Geral',
  },
  {
    question: 'Quanto tempo demora para receber propostas?',
    answer: `Normalmente você começa a receber propostas dentro de 24 horas. Profissionais qualificados na sua região serão notificados automaticamente.

Para receber mais propostas:
- Seja específico na descrição
- Adicione fotos
- Defina um orçamento realista
- Escolha a categoria correta`,
    category: 'Cliente',
  },
  {
    question: 'Como escolher o melhor profissional?',
    answer: `Considere estes fatores:

✅ Avaliações de outros clientes
✅ Preço da proposta
✅ Prazo estimado
✅ Descrição detalhada do serviço
✅ Perfil e experiência do profissional
✅ Tempo de resposta

Dica: Nem sempre o mais barato é o melhor! Considere qualidade, avaliações e experiência.`,
    category: 'Cliente',
  },
  {
    question: 'O que são créditos?',
    answer: `Créditos são a moeda da plataforma para profissionais. Você usa créditos para desbloquear leads (pedidos de serviço) e ver os dados de contacto dos clientes.

O custo varia de acordo com a categoria e região:
- Leads simples: 3-5 créditos
- Leads médios: 5-8 créditos
- Leads complexos: 8-15 créditos

Os créditos nunca expiram e podem ser usados a qualquer momento.`,
    category: 'Profissional',
  },
  {
    question: 'Os pagamentos são seguros?',
    answer: `Sim, 100% seguros! Usamos o Stripe, uma das plataformas de pagamento mais seguras do mundo. Seus dados de cartão são criptografados e nunca armazenados em nossos servidores.

Aceitamos:
- Cartão de Crédito (Visa, Mastercard, American Express)
- Cartão de Débito
- Apple Pay
- Google Pay`,
    category: 'Geral',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: `Sim! Implementamos as melhores práticas de segurança:

🔒 Criptografia SSL/TLS em todas as comunicações
🔒 Dados criptografados no banco de dados
🔒 Autenticação segura com Supabase
🔒 Conformidade com RGPD (Regulamento Geral de Proteção de Dados)

Não compartilhamos seus dados com terceiros e você controla quem vê suas informações.`,
    category: 'Geral',
  },
];

export const FAQScreen: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cliente':
        return colors.primary;
      case 'Profissional':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <AppLogo size={120} withBackground />
        <Text style={styles.title}>Perguntas Frequentes</Text>
        <Text style={styles.subtitle}>Encontre respostas para suas dúvidas</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🔍 Tópicos Rápidos</Text>
          {FAQ_DATA.filter((item) => ['Como criar um pedido?', 'Como comprar créditos?', 'Como enviar uma proposta?', 'Como avaliar um serviço?', 'Problemas técnicos'].includes(item.question)).map((item, index) => {
            const globalIndex = FAQ_DATA.indexOf(item);
            const isExpanded = expandedItems.has(globalIndex);
            return (
              <View key={index}>
                <List.Item
                  title={item.question}
                  left={(props) => <List.Icon {...props} icon="help-circle" color={getCategoryColor(item.category)} />}
                  right={(props) => <List.Icon {...props} icon={isExpanded ? 'chevron-up' : 'chevron-down'} />}
                  onPress={() => toggleItem(globalIndex)}
                  style={styles.listItem}
                  titleStyle={styles.questionText}
                />
                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
                {index < 4 && <Divider />}
              </View>
            );
          })}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📚 Mais Perguntas</Text>
          {FAQ_DATA.filter((item) => !['Como criar um pedido?', 'Como comprar créditos?', 'Como enviar uma proposta?', 'Como avaliar um serviço?', 'Problemas técnicos'].includes(item.question)).map((item, index) => {
            const globalIndex = FAQ_DATA.indexOf(item);
            const isExpanded = expandedItems.has(globalIndex);
            return (
              <View key={index}>
                <List.Item
                  title={item.question}
                  left={(props) => <List.Icon {...props} icon="help-circle-outline" color={getCategoryColor(item.category)} />}
                  right={(props) => <List.Icon {...props} icon={isExpanded ? 'chevron-up' : 'chevron-down'} />}
                  onPress={() => toggleItem(globalIndex)}
                  style={styles.listItem}
                  titleStyle={styles.questionText}
                />
                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
                {index < FAQ_DATA.filter((item) => !['Como criar um pedido?', 'Como comprar créditos?', 'Como enviar uma proposta?', 'Como avaliar um serviço?', 'Problemas técnicos'].includes(item.question)).length - 1 && <Divider />}
              </View>
            );
          })}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>📞 Precisa de Mais Ajuda?</Text>
          <Text style={styles.contactText}>
            Nossa equipe está pronta para ajudar!
          </Text>
          <Text style={styles.contactInfo}>
            📧 Email: suporte@elastiquality.pt{'\n'}
            📅 Horário: Segunda a Sexta, 9h-18h{'\n'}
            Sábado: 9h-13h
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
    paddingVertical: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  contactText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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

