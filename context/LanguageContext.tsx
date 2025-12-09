import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Translations, Language } from '@/constants/Translations';
import { useAuth } from '@/hooks/useAuth';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (
    key: keyof typeof Translations.en,
    params?: Record<string, string | number>
  ) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = 'user_language_preference';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const { isAuthenticated, token } = useAuth();

  // We need a way to update the user's language preference in backend
  const updateUserLanguage = useMutation(api.users.updateLanguage);

  // Load from storage on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored) {
        setLanguageState(stored as Language);
      }
    } catch (error) {
      console.error('Failed to load language', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      // 1. Update State
      setLanguageState(lang);

      // 2. Persist Locally
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

      // 3. Persist to Backend (if logged in)
      if (isAuthenticated && token) {
        await updateUserLanguage({
          language: lang,
          token: token,
        }).catch((err) => {
          console.warn('Failed to sync language to backend:', err);
        });
      }
    } catch (error) {
      console.error('Failed to set language', error);
    }
  };

  const t = (
    key: keyof typeof Translations.en,
    params?: Record<string, string | number>
  ) => {
    let translation =
      Translations[language][key] || Translations['en'][key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(
          `{{${paramKey}}}`,
          String(paramValue)
        );
      });
    }

    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
