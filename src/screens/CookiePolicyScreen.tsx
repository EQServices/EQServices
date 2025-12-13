import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { colors } from '../theme/colors';

export const CookiePolicyScreen = ({ navigation }: any) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Política de Cookies</Text>
          <Text style={styles.lastUpdated}>Última atualização: {new Date().toLocaleDateString('pt-PT')}</Text>

          <Text style={styles.sectionTitle}>1. O que são Cookies?</Text>
          <Text style={styles.text}>
            Cookies são pequenos ficheiros de texto que são colocados no seu dispositivo quando visita um website. Os cookies
            ajudam-nos a fornecer, proteger e melhorar os nossos serviços, personalizando conteúdo e anúncios, fornecendo
            funcionalidades de redes sociais e analisando o tráfego.
          </Text>

          <Text style={styles.sectionTitle}>2. Como Utilizamos Cookies</Text>
          <Text style={styles.text}>
            Utilizamos cookies e tecnologias similares para:
          </Text>
          <Text style={styles.bulletPoint}>• Autenticação: Manter a sua sessão ativa e segura</Text>
          <Text style={styles.bulletPoint}>• Preferências: Lembrar as suas configurações e preferências</Text>
          <Text style={styles.bulletPoint}>• Análise: Compreender como utiliza a nossa plataforma para melhorar os serviços</Text>
          <Text style={styles.bulletPoint}>• Funcionalidade: Habilitar funcionalidades essenciais da plataforma</Text>
          <Text style={styles.bulletPoint}>• Marketing: Personalizar anúncios e medir a eficácia das campanhas</Text>

          <Text style={styles.sectionTitle}>3. Tipos de Cookies que Utilizamos</Text>
          
          <Text style={styles.subsectionTitle}>3.1 Cookies Essenciais</Text>
          <Text style={styles.text}>
            Estes cookies são necessários para o funcionamento básico da plataforma e não podem ser desativados. Incluem cookies
            de autenticação, segurança e funcionalidades essenciais.
          </Text>

          <Text style={styles.subsectionTitle}>3.2 Cookies de Performance</Text>
          <Text style={styles.text}>
            Estes cookies recolhem informações sobre como utiliza a nossa plataforma, como páginas visitadas e erros encontrados.
            Ajudam-nos a melhorar o desempenho e a experiência do utilizador.
          </Text>

          <Text style={styles.subsectionTitle}>3.3 Cookies de Funcionalidade</Text>
          <Text style={styles.text}>
            Estes cookies permitem que a plataforma se lembre das suas escolhas (como idioma ou região) para fornecer uma
            experiência mais personalizada.
          </Text>

          <Text style={styles.subsectionTitle}>3.4 Cookies de Marketing</Text>
          <Text style={styles.text}>
            Estes cookies são utilizados para fornecer anúncios mais relevantes para si e para os seus interesses. Também são
            utilizados para limitar o número de vezes que vê um anúncio e medir a eficácia das campanhas publicitárias.
          </Text>

          <Text style={styles.sectionTitle}>4. Cookies de Terceiros</Text>
          <Text style={styles.text}>
            Alguns cookies são colocados por serviços de terceiros que aparecem nas nossas páginas. Estes incluem:
          </Text>
          <Text style={styles.bulletPoint}>• Google Analytics: Para análise de tráfego e comportamento dos utilizadores</Text>
          <Text style={styles.bulletPoint}>• Sentry: Para monitorização de erros e desempenho</Text>
          <Text style={styles.bulletPoint}>• Stripe: Para processamento seguro de pagamentos</Text>
          <Text style={styles.text}>
            Não controlamos os cookies de terceiros. Recomendamos que consulte as políticas de cookies dos respetivos serviços.
          </Text>

          <Text style={styles.sectionTitle}>5. Gestão de Cookies</Text>
          <Text style={styles.text}>
            Pode gerir ou eliminar cookies a qualquer momento através das configurações do seu navegador. No entanto, se
            desativar cookies essenciais, algumas funcionalidades da plataforma podem não funcionar corretamente.
          </Text>
          <Text style={styles.text}>
            Para gerir cookies no seu navegador:
          </Text>
          <Text style={styles.bulletPoint}>• Chrome: Configurações → Privacidade e segurança → Cookies</Text>
          <Text style={styles.bulletPoint}>• Firefox: Opções → Privacidade e segurança → Cookies e dados do site</Text>
          <Text style={styles.bulletPoint}>• Safari: Preferências → Privacidade → Cookies e dados de websites</Text>
          <Text style={styles.bulletPoint}>• Edge: Configurações → Cookies e permissões do site</Text>

          <Text style={styles.sectionTitle}>6. Consentimento</Text>
          <Text style={styles.text}>
            Ao utilizar a nossa plataforma, consente com a utilização de cookies conforme descrito nesta política. Pode retirar
            o seu consentimento a qualquer momento através das configurações do navegador ou contactando-nos.
          </Text>

          <Text style={styles.sectionTitle}>7. Cookies Persistentes vs. Sessão</Text>
          <Text style={styles.text}>
            Utilizamos tanto cookies de sessão (que são eliminados quando fecha o navegador) quanto cookies persistentes (que
            permanecem no seu dispositivo por um período determinado ou até serem eliminados manualmente).
          </Text>

          <Text style={styles.sectionTitle}>8. Tecnologias Similares</Text>
          <Text style={styles.text}>
            Além de cookies, podemos utilizar outras tecnologias similares, como:
          </Text>
          <Text style={styles.bulletPoint}>• Local Storage: Para armazenar dados localmente no seu navegador</Text>
          <Text style={styles.bulletPoint}>• Session Storage: Para armazenar dados durante a sessão</Text>
          <Text style={styles.bulletPoint}>• Pixels: Para rastrear ações e medir eficácia de campanhas</Text>
          <Text style={styles.bulletPoint}>• Web Beacons: Para entender como os utilizadores interagem com emails</Text>

          <Text style={styles.sectionTitle}>9. Alterações a Esta Política</Text>
          <Text style={styles.text}>
            Podemos atualizar esta política de cookies periodicamente para refletir mudanças nas nossas práticas ou por outras
            razões operacionais, legais ou regulamentares. Notificaremos sobre alterações significativas através da plataforma.
          </Text>

          <Text style={styles.sectionTitle}>10. Mais Informações</Text>
          <Text style={styles.text}>
            Para mais informações sobre cookies e como são utilizados, pode visitar:
          </Text>
          <Text style={styles.bulletPoint}>• www.allaboutcookies.org</Text>
          <Text style={styles.bulletPoint}>• www.youronlinechoices.eu</Text>

          <Text style={styles.sectionTitle}>11. Contacto</Text>
          <Text style={styles.text}>
            Se tiver questões sobre a nossa utilização de cookies, contacte-nos em:
          </Text>
          <Text style={styles.contact}>Email: privacidade@elastiquality.pt</Text>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 8,
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

