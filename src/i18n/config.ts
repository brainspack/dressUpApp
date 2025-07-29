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

export default i18n; 