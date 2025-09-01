import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = async () => {
    try {
      const newLang = i18n.language === 'en' ? 'hi' : 'en';
      await i18n.changeLanguage(newLang);
      await AsyncStorage.setItem(
        'language-storage',
        JSON.stringify({ state: { language: newLang } })
      );
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={toggleLanguage}
        >
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{t('settings.language')}</Text>
            <Text style={styles.settingValue}>
              {t(`settings.${i18n.language === 'en' ? 'english' : 'hindi'}`)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{t('settings.notifications')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>{t('settings.about')}</Text>
            <Text style={styles.settingValue}>{t('settings.version')} 1.0.0</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
  },
});

export default SettingsScreen;
