import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { colors } from '../theme/colors';

export const TermsOfServiceScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Termos de Uso</Text>
          <Text style={styles.lastUpdated}>Última atualização: {new Date().toLocaleDateString('pt-PT')}</Text>

          <Text style={styles.sectionTitle}>1. Aceitação dos Termos</Text>
          <Text style={styles.text}>
            Ao aceder e utilizar o Elastiquality, concorda em cumprir e estar vinculado a estes Termos de Uso. Se não
            concordar com qualquer parte destes termos, não deve utilizar a nossa plataforma.
          </Text>

          <Text style={styles.sectionTitle}>2. Descrição do Serviço</Text>
          <Text style={styles.text}>
            O Elastiquality é uma plataforma de marketplace que conecta clientes que procuram serviços com profissionais
            qualificados. A plataforma facilita a comunicação, negociação e execução de serviços.
          </Text>

          <Text style={styles.sectionTitle}>3. Registo de Conta</Text>
          <Text style={styles.text}>
            Para utilizar a plataforma, deve criar uma conta fornecendo informações precisas e atualizadas. É responsável
            por manter a confidencialidade das suas credenciais de acesso e por todas as atividades que ocorrem na sua conta.
          </Text>

          <Text style={styles.sectionTitle}>4. Tipos de Utilizadores</Text>
          <Text style={styles.text}>
            A plataforma suporta dois tipos de utilizadores:
          </Text>
          <Text style={styles.bulletPoint}>• Clientes: Utilizadores que solicitam serviços</Text>
          <Text style={styles.bulletPoint}>• Profissionais: Utilizadores que oferecem serviços</Text>
          <Text style={styles.text}>
            Pode ter apenas um tipo de conta por endereço de email.
          </Text>

          <Text style={styles.sectionTitle}>5. Uso da Plataforma</Text>
          <Text style={styles.text}>
            Compromete-se a:
          </Text>
          <Text style={styles.bulletPoint}>• Utilizar a plataforma apenas para fins legais</Text>
          <Text style={styles.bulletPoint}>• Fornecer informações precisas e atualizadas</Text>
          <Text style={styles.bulletPoint}>• Respeitar outros utilizadores e não praticar atividades fraudulentas</Text>
          <Text style={styles.bulletPoint}>• Não utilizar a plataforma para spam ou atividades maliciosas</Text>
          <Text style={styles.bulletPoint}>• Cumprir todas as leis e regulamentos aplicáveis</Text>

          <Text style={styles.sectionTitle}>6. Sistema de Créditos</Text>
          <Text style={styles.text}>
            Profissionais podem adquirir créditos para desbloquear informações de contacto de clientes. Os créditos têm
            validade limitada e não são reembolsáveis, exceto conforme previsto nestes termos.
          </Text>

          <Text style={styles.sectionTitle}>7. Propostas e Contratos</Text>
          <Text style={styles.text}>
            As propostas enviadas através da plataforma são sugestões não vinculativas. Qualquer acordo final entre cliente
            e profissional é de responsabilidade exclusiva das partes envolvidas. O Elastiquality não é parte de nenhum
            contrato de serviço.
          </Text>

          <Text style={styles.sectionTitle}>8. Pagamentos</Text>
          <Text style={styles.text}>
            Os pagamentos de créditos são processados através de métodos seguros. Todos os preços são exibidos em euros (€)
            e incluem IVA quando aplicável.
          </Text>

          <Text style={styles.sectionTitle}>9. Avaliações e Comentários</Text>
          <Text style={styles.text}>
            Pode deixar avaliações e comentários sobre serviços recebidos ou prestados. Compromete-se a fornecer feedback
            honesto e respeitoso. Reservamo-nos o direito de remover conteúdo inadequado.
          </Text>

          <Text style={styles.sectionTitle}>10. Propriedade Intelectual</Text>
          <Text style={styles.text}>
            Todo o conteúdo da plataforma, incluindo textos, gráficos, logos e software, é propriedade do Elastiquality ou
            dos seus licenciadores e está protegido por leis de propriedade intelectual.
          </Text>

          <Text style={styles.sectionTitle}>11. Limitação de Responsabilidade</Text>
          <Text style={styles.text}>
            O Elastiquality atua como intermediário e não se responsabiliza pela qualidade, segurança ou legalidade dos
            serviços prestados pelos profissionais. Não garantimos resultados específicos ou a disponibilidade contínua da
            plataforma.
          </Text>

          <Text style={styles.sectionTitle}>12. Rescisão</Text>
          <Text style={styles.text}>
            Reservamo-nos o direito de suspender ou encerrar a sua conta a qualquer momento, com ou sem aviso prévio, se
            violar estes termos ou por qualquer outro motivo justificado.
          </Text>

          <Text style={styles.sectionTitle}>13. Alterações aos Termos</Text>
          <Text style={styles.text}>
            Podemos modificar estes termos a qualquer momento. Alterações significativas serão notificadas através da
            plataforma ou por email. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
          </Text>

          <Text style={styles.sectionTitle}>14. Lei Aplicável</Text>
          <Text style={styles.text}>
            Estes termos são regidos pelas leis de Portugal. Qualquer disputa será resolvida nos tribunais competentes de
            Portugal.
          </Text>

          <Text style={styles.sectionTitle}>15. Contacto</Text>
          <Text style={styles.text}>
            Para questões sobre estes termos, contacte-nos em:
          </Text>
          <Text style={styles.contact}>Email: legal@elastiquality.pt</Text>
          <Text style={styles.contact}>Suporte: suporte@elastiquality.pt</Text>
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

