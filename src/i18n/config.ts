import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import hi from './locales/hi';

const LANGUAGE_STORAGE_KEY = 'language-storage';

const resources = {
  en: {
    translation: en.translation
  },
  hi: {
    translation: hi.translation
  }
};

const initI18n = async () => {
  try {
    const storedData = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const initialLanguage = storedData ? JSON.parse(storedData).state.language : 'en';

    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v4',
        resources,
        lng: initialLanguage,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
  }
};

initI18n();

// Helper functions for language management
export const loadStoredLanguage = async (): Promise<string> => {
  try {
    const storedData = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      return parsed.state?.language || 'en';
    }
    return 'en';
  } catch (error) {
    console.error('Failed to load stored language:', error);
    return 'en';
  }
};

export const changeLanguage = async (language: string): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    // Also update the language store if it exists
    const storedData = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      parsed.state.language = language;
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (error) {
    console.error('Failed to change language:', error);
    throw error;
  }
};

export default i18n; 