import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveLanguage, detectLanguageFromCountry } from '../i18n/config';
import i18n from '../i18n/config';
import * as Localization from 'expo-localization';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  availableLanguages: { code: string; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n?.language || 'pt-PT');

  const availableLanguages = [
    { code: 'pt-PT', name: 'Português (Portugal)' },
    { code: 'es-ES', name: 'Español (España)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
  ];

  useEffect(() => {
    // Sincronizar com i18n quando o idioma mudar
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    // Verificar se i18n está inicializado
    if (i18n && i18n.isInitialized) {
      setCurrentLanguage(i18n.language || 'pt-PT');
      i18n.on('languageChanged', handleLanguageChange);
    } else {
      // Se não estiver inicializado, tentar novamente após um pequeno delay
      const timer = setTimeout(() => {
        if (i18n && i18n.isInitialized) {
          setCurrentLanguage(i18n.language || 'pt-PT');
          i18n.on('languageChanged', handleLanguageChange);
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        if (i18n && i18n.isInitialized) {
          i18n.off('languageChanged', handleLanguageChange);
        }
      };
    }

    return () => {
      if (i18n && i18n.isInitialized) {
        i18n.off('languageChanged', handleLanguageChange);
      }
    };
  }, []);

  const changeLanguage = async (language: string) => {
    try {
      if (!i18n || !i18n.isInitialized) {
        console.warn('i18n ainda não está inicializado');
        return;
      }
      await i18n.changeLanguage(language);
      await saveLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Erro ao alterar idioma:', error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

