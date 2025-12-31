# 🔧 Melhorias de Código Recomendadas

Este documento lista melhorias específicas de código que devem ser implementadas.

---

## 1. 🔐 Autenticação - Recuperação de Senha

### Arquivo: `src/screens/LoginScreen.tsx`

**Adicionar botão "Esqueci minha senha":**

```typescript
// Adicionar após o botão de login
<Button
  mode="text"
  onPress={handleForgotPassword}
  textColor={colors.primary}
  style={styles.forgotButton}
>
  Esqueci minha senha
</Button>

// Adicionar função
const handleForgotPassword = async () => {
  if (!email) {
    Alert.alert('Erro', 'Por favor, insira seu email');
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'elastiquality://reset-password',
    });

    if (error) throw error;

    Alert.alert(
      'Email Enviado',
      'Verifique sua caixa de entrada para redefinir sua senha.'
    );
  } catch (error: any) {
    Alert.alert('Erro', error.message);
  }
};
```

---

## 2. 🔔 Notificações Push - Configuração

### Arquivo: `src/services/notifications.ts`

**Adicionar registro de token:**

```typescript
export const registerForPushNotifications = async (userId: string) => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Salvar token no Supabase
    await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userId);

    return token;
  } catch (error) {
    console.error('Erro ao registrar notificações:', error);
    return null;
  }
};
```

**Adicionar no AuthContext após login:**

```typescript
// Em AuthContext.tsx, após login bem-sucedido
import { registerForPushNotifications } from '../services/notifications';

// Dentro da função signIn, após sucesso:
if (Platform.OS !== 'web') {
  registerForPushNotifications(data.user.id);
}
```

---

## 3. 💳 Stripe - Tratamento de Erros

### Arquivo: `src/screens/professional/BuyCreditsScreen.tsx`

**Melhorar tratamento de erros:**

```typescript
const handlePurchase = async (pkg: CreditPackage) => {
  if (purchasing) return;

  setPurchasing(pkg.id);

  try {
    const successUrl = buildReturnUrl('/checkout/success');
    const cancelUrl = buildReturnUrl('/checkout/cancelled');

    const checkoutUrl = await startCheckout({
      packageId: pkg.id,
      successUrl,
      cancelUrl,
    });

    if (Platform.OS === 'web') {
      window.location.href = checkoutUrl;
    } else {
      const canOpen = await Linking.canOpenURL(checkoutUrl);
      if (!canOpen) {
        throw new Error('Não foi possível abrir a página de pagamento.');
      }
      await Linking.openURL(checkoutUrl);
    }
  } catch (err: any) {
    console.error('Erro ao iniciar pagamento Stripe:', err);
    
    // Melhor feedback de erro
    let errorMessage = 'Erro ao iniciar pagamento.';
    
    if (err.message?.includes('network')) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (err.message?.includes('stripe')) {
      errorMessage = 'Erro no sistema de pagamento. Tente novamente.';
    }
    
    Alert.alert('Erro', errorMessage, [
      { text: 'Tentar Novamente', onPress: () => handlePurchase(pkg) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  } finally {
    setPurchasing(null);
  }
};
```

---

## 4. 🗄️ Banco de Dados - Soft Delete

### Arquivo: `database/schema.sql`

**Adicionar colunas de soft delete:**

```sql
-- Adicionar coluna deleted_at em tabelas principais
ALTER TABLE service_requests ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE leads ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE proposals ADD COLUMN deleted_at TIMESTAMP;

-- Criar índices
CREATE INDEX idx_service_requests_deleted ON service_requests(deleted_at);
CREATE INDEX idx_leads_deleted ON leads(deleted_at);
CREATE INDEX idx_proposals_deleted ON proposals(deleted_at);

-- Atualizar RLS policies para ignorar deletados
DROP POLICY IF EXISTS "Users can view their own service requests" ON service_requests;
CREATE POLICY "Users can view their own service requests"
  ON service_requests FOR SELECT
  USING (
    auth.uid() = client_id 
    AND deleted_at IS NULL
  );
```

---

## 5. 📊 Analytics - Implementação Completa

### Arquivo: `src/services/analytics.ts`

**Conectar ao backend:**

```typescript
const sendToBackend = async (type: string, data: any): Promise<void> => {
  try {
    await supabase.from('analytics_events').insert({
      event_type: type,
      event_data: data,
      user_id: data.userId || null,
      timestamp: new Date().toISOString(),
      platform: Platform.OS,
      app_version: Constants.expoConfig?.version || '1.0.0',
    });
  } catch (error) {
    console.warn('[Analytics] Erro ao enviar para backend:', error);
  }
};
```

**Criar tabela no Supabase:**

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  platform TEXT,
  app_version TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp);
```

---

## 6. 🔒 Segurança - Rate Limiting

### Criar Edge Function: `supabase/functions/rate-limit/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface RateLimitConfig {
  key: string;
  limit: number;
  windowSeconds: number;
}

async function checkRateLimit(config: RateLimitConfig): Promise<boolean> {
  const { key, limit, windowSeconds } = config;
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // Contar requests na janela de tempo
  const { count, error } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('key', key)
    .gte('created_at', windowStart.toISOString());

  if (error) throw error;

  if ((count || 0) >= limit) {
    return false; // Rate limit excedido
  }

  // Registrar request
  await supabase.from('rate_limits').insert({ key, created_at: now });

  return true; // OK
}

serve(async (req) => {
  try {
    const { key, limit = 10, windowSeconds = 60 } = await req.json();

    const allowed = await checkRateLimit({ key, limit, windowSeconds });

    return new Response(
      JSON.stringify({ allowed }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

**Criar tabela:**

```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limits_key ON rate_limits(key, created_at);

-- Limpar registros antigos automaticamente
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits 
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Executar limpeza a cada hora
SELECT cron.schedule('cleanup-rate-limits', '0 * * * *', 'SELECT cleanup_rate_limits()');
```

---

## 7. 🧪 Testes - Aumentar Cobertura

### Arquivo: `src/services/__tests__/auth.test.ts`

```typescript
import { supabase } from '../../config/supabase';
import { signIn, signUp, signOut } from '../auth';

jest.mock('../../config/supabase');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await signIn('test@example.com', 'password123');

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('deve retornar erro com credenciais inválidas', async () => {
      const mockError = { message: 'Invalid credentials' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError,
      });

      const result = await signIn('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  // Adicionar mais testes...
});
```

---

## 8. 🎨 UI - Loading States

### Criar componente global: `src/components/LoadingOverlay.tsx`

```typescript
import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { colors } from '../theme/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Carregando...',
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text,
  },
});
```

---

## 9. 📱 Deep Linking - Melhorias

### Arquivo: `src/navigation/AppNavigator.tsx`

**Adicionar mais rotas:**

```typescript
const linking = {
  prefixes: [
    'elastiquality://',
    'https://elastiquality.pt',
    'https://www.elastiquality.pt',
    Linking.createURL('/'),
  ],
  config: {
    screens: {
      AuthStack: {
        screens: {
          Login: 'login',
          Register: 'register',
          ResetPassword: 'reset-password',
          VerifyEmail: 'verify-email/:token',
          PublicServiceRequest: 'service/:serviceRequestId',
          PrivacyPolicy: 'privacy',
          TermsOfService: 'terms',
        },
      },
      // ... resto das rotas
    },
  },
};
```

---

## 10. 🌐 Internacionalização (i18n)

### Instalar dependências:

```bash
npm install i18next react-i18next
```

### Criar: `src/i18n/index.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

### Criar: `src/i18n/locales/pt.json`

```json
{
  "common": {
    "loading": "Carregando...",
    "error": "Erro",
    "success": "Sucesso",
    "cancel": "Cancelar",
    "confirm": "Confirmar"
  },
  "auth": {
    "login": "Entrar",
    "register": "Registar",
    "email": "Email",
    "password": "Palavra-passe",
    "forgotPassword": "Esqueci minha senha"
  }
}
```

---

**Próximos Passos**: Implementar estas melhorias seguindo a ordem de prioridade do PLANO_ACAO.md

