import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const validateEnvVar = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(
      `[Supabase] Variável de ambiente ${name} não foi definida. ` +
        'Crie um arquivo .env (ou configure via Expo) com EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  if (value.includes('YOUR_SUPABASE')) {
    throw new Error(
      `[Supabase] Valor padrão detectado em ${name}. Substitua pelos dados reais do projeto Supabase.`,
    );
  }

  return value;
};

const supabaseUrl = validateEnvVar(process.env.EXPO_PUBLIC_SUPABASE_URL, 'EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = validateEnvVar(
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

