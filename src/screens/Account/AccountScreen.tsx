import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../../store/languageStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';

const AccountScreen = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { setIsAuthenticated } = useAuth();

  // Dummy initial profile data
  const [name, setName] = useState('John Doe');
  const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?img=3');

  // Image picker handler
  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.7,
      });
      
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Image picker error');
        return;
      }
      if (result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri || avatar);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Save handler (replace with your backend logic)
  const handleSave = () => {
    Alert.alert('Saved', `Name: ${name}\nLanguage: ${language}\nAvatar: ${avatar}`);
  };

  // Logout handler
  const handleLogout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('profile.profile')}</Text>
      <View style={styles.section}>
        <LanguageSelector />
      </View>
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <Text style={styles.changePhoto}>{t('profile.change_photo')}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={t('profile.name')}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t('common.save')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  section: { marginBottom: 32 },
  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 8, backgroundColor: '#eee' },
  changePhoto: { color: '#3b82f6', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 220,
    backgroundColor: '#fafafa',
    marginBottom: 8,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AccountScreen; 