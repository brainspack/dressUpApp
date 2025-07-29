import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useLanguageStore from '../store/languageStore';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const languages = [
    { code: 'en', name: t('settings.english') },
    { code: 'hi', name: t('settings.hindi') },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            language === lang.code && styles.selectedButton,
          ]}
          onPress={() => setLanguage(lang.code as 'en' | 'hi')}
        >
          <Text
            style={[
              styles.buttonText,
              language === lang.code && styles.selectedButtonText,
            ]}
          >
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  selectedButton: {
    backgroundColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedButtonText: {
    color: '#fff',
  },
});

export default LanguageSelector; 