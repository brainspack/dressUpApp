import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadStoredLanguage, changeLanguage } from '../i18n/config';

interface LanguageContextType {
  currentLanguage: string;
  setAppLanguage: (language: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  setAppLanguage: async () => {},
  isLoading: true,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initLanguage = async () => {
      const storedLanguage = await loadStoredLanguage();
      if (storedLanguage) {
        setCurrentLanguage(storedLanguage);
      }
      setIsLoading(false);
    };

    initLanguage();
  }, []);

  const setAppLanguage = async (language: string) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to set language:', error);
      throw error;
    }
  };

  const contextValue = useMemo(() => ({
    currentLanguage,
    setAppLanguage,
    isLoading
  }), [currentLanguage, isLoading]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 