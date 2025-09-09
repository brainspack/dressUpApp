import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { addTailorStyles as styles } from './styles';
import apiService from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/Button';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const AddTailor = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigation = useNavigation();

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (!result.didCancel && result.assets && result.assets[0].uri) {
        setProfileImage(result.assets[0].uri);
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) { clearInterval(interval); return 100; }
            return prev + 10;
          });
        }, 100);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleAddTailor = async () => {
    if (!name || !mobileNumber) {
      Alert.alert(t('common.error'), t('validation.required'));
      return;
    }
    setLoading(true);
    try {
      const shopId = await AsyncStorage.getItem('shopId');
      if (!shopId) {
        Alert.alert(t('common.error'), 'Shop ID not found');
        return;
      }
      await apiService.addTailor({ name, mobileNumber, address, shopId });
      Alert.alert(t('common.success'), t('tailor.addedSuccess'));
      (navigation as any).goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error?.message || t('tailor.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const phoneRegex = /^[0-9]{10}$/;
  const baseCompleted = (profileImage ? 1 : 0) + (name.trim() ? 1 : 0) + (phoneRegex.test(mobileNumber.trim()) ? 1 : 0);
  const formProgress = Math.min(100, Math.round((baseCompleted / 3) * 100));

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <View style={styles.imageUploaderContainer}>
          <TouchableOpacity style={styles.imageUploader} onPress={handleImageUpload}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>TL</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
          </TouchableOpacity>

          {/* Progress line */}
          <View style={styles.formProgressContainer}>
            <View style={styles.formProgressTrack}>
              <View style={[styles.formProgressFill, { width: `${formProgress}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('customer.name')}</Text>
          <TextInput style={styles.input} placeholder={t('placeholders.fullName')} value={name} onChangeText={setName} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('customer.phone')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('placeholders.phone')}
            value={mobileNumber}
            keyboardType="numeric"
            maxLength={10}
            onChangeText={(t) => setMobileNumber(t.replace(/[^0-9]/g, ''))}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter address"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <Button
        variant="gradient"
        title={loading ? t('common.loading') : t('tailor.addTailor')}
        height={56}
        gradientColors={['#229B73', '#1a8f6e', '#000000']}
        onPress={handleAddTailor}
        disabled={loading}
        style={{ margin: 16, borderRadius: 12 }}
      />
    </ScrollView>
  );
};


export default AddTailor;