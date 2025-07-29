import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage, PersistOptions } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/config';

type Language = 'en' | 'hi';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

type LanguagePersist = (
  config: StateCreator<LanguageState>,
  options: PersistOptions<LanguageState>
) => StateCreator<LanguageState>;

const useLanguageStore = create<LanguageState>()(
  (persist as LanguagePersist)(
    (set) => ({
      language: 'en',
      setLanguage: async (lang: Language) => {
        await i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // Ensure i18n is synced with the rehydrated state
        if (state) {
          i18n.changeLanguage(state.language);
        }
      },
    }
  )
);

export default useLanguageStore; 