import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Importar expo-localization apenas em plataformas nativas
let Localization: any = null;
if (Platform.OS !== 'web') {
  try {
    Localization = require('expo-localization');
  } catch (e) {
    console.warn('expo-localization não disponível');
  }
}

import ptPT from './locales/pt-PT.json';
import esES from './locales/es-ES.json';
import enGB from './locales/en-GB.json';

// Países de língua espanhola
const SPANISH_SPEAKING_COUNTRIES = [
  'ES', // Espanha
  'MX', // México
  'AR', // Argentina
  'CO', // Colômbia
  'CL', // Chile
  'PE', // Peru
  'VE', // Venezuela
  'EC', // Equador
  'GT', // Guatemala
  'CU', // Cuba
  'BO', // Bolívia
  'DO', // República Dominicana
  'HN', // Honduras
  'PY', // Paraguai
  'SV', // El Salvador
  'NI', // Nicarágua
  'CR', // Costa Rica
  'PA', // Panamá
  'UY', // Uruguai
  'PR', // Porto Rico
];

// Países de língua inglesa
const ENGLISH_SPEAKING_COUNTRIES = [
  'GB', // Reino Unido
  'IE', // Irlanda
  'US', // Estados Unidos
  'CA', // Canadá
  'AU', // Austrália
  'NZ', // Nova Zelândia
  'ZA', // África do Sul
  'SG', // Singapura
  'MY', // Malásia
  'PH', // Filipinas
  'IN', // Índia
  'PK', // Paquistão
  'BD', // Bangladesh
  'NG', // Nigéria
  'KE', // Quênia
  'GH', // Gana
  'ZW', // Zimbábue
  'ZM', // Zâmbia
  'MW', // Malawi
  'UG', // Uganda
];

const LANGUAGE_STORAGE_KEY = '@elastiquality_language';

/**
 * Detecta o idioma baseado no país do dispositivo
 */
export const detectLanguageFromCountry = (): string => {
  try {
    // Na web, usar navigator.language
    let locale: string;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      locale = navigator.language || 'pt-PT';
    } else if (Localization) {
      locale = Localization.locale || 'pt-PT';
    } else {
      return 'pt-PT';
    }

    const countryCode = locale.split('-')[1]?.toUpperCase();

    if (countryCode && SPANISH_SPEAKING_COUNTRIES.includes(countryCode)) {
      return 'es-ES';
    }

    if (countryCode && ENGLISH_SPEAKING_COUNTRIES.includes(countryCode)) {
      return 'en-GB';
    }

    // Verificar também pelo código de idioma
    const languageCode = locale.split('-')[0]?.toLowerCase();
    if (languageCode === 'es') {
      return 'es-ES';
    }
    if (languageCode === 'en') {
      return 'en-GB';
    }

    // Padrão: Português de Portugal
    return 'pt-PT';
  } catch (error) {
    console.warn('Erro ao detectar idioma:', error);
    return 'pt-PT';
  }
};

/**
 * Obtém o idioma salvo ou detecta automaticamente
 */
export const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && ['pt-PT', 'es-ES', 'en-GB'].includes(savedLanguage)) {
      return savedLanguage;
    }

    // Se não há idioma salvo, detectar automaticamente
    const detectedLanguage = detectLanguageFromCountry();
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, detectedLanguage);
    return detectedLanguage;
  } catch (error) {
    console.warn('Erro ao obter idioma inicial:', error);
    return 'pt-PT';
  }
};

/**
 * Salva o idioma escolhido pelo usuário
 */
export const saveLanguage = async (language: string): Promise<void> => {
  try {
    if (['pt-PT', 'es-ES', 'en-GB'].includes(language)) {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  } catch (error) {
    console.error('Erro ao salvar idioma:', error);
  }
};

const resources = {
  'pt-PT': {
    translation: ptPT,
  },
  'es-ES': {
    translation: esES,
  },
  'en-GB': {
    translation: enGB,
  },
};

// Inicializar i18n com valores padrão imediatamente para evitar erros
// Isso garante que useTranslation funcione mesmo antes da inicialização assíncrona
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'pt-PT',
    fallbackLng: 'pt-PT',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

// Inicializar i18n de forma assíncrona com o idioma correto
export const initI18n = async () => {
  try {
    const lng = await getInitialLanguage();

    // Se o idioma detectado for diferente do padrão, atualizar
    if (i18n.isInitialized) {
      if (lng !== i18n.language) {
        await i18n.changeLanguage(lng);
      }
    } else {
      // Se ainda não foi inicializado (não deveria acontecer), inicializar agora
      await i18n
        .use(initReactI18next)
        .init({
          resources,
          lng,
          fallbackLng: 'pt-PT',
          compatibilityJSON: 'v3',
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });
    }
  } catch (error) {
    console.error('Erro ao inicializar i18n:', error);
  }

  return i18n;
};

export default i18n;

