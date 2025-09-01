import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
}

const AddCustomer = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    address: '',
  });

  // Reset form when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setForm({
        name: '',
        phone: '',
        address: '',
      });
      setProfileImage(null);
      setUploadProgress(0);
    }, [])
  );

  // Compute form completion progress (image + name + valid phone + address)
  const phoneRegex = /^[0-9]{10}$/;
  const baseCompleted =
    (profileImage ? 1 : 0) +
    (form.name.trim() ? 1 : 0) +
    (phoneRegex.test(form.phone.trim()) ? 1 : 0);
  const baseTotal = 3;
  // Allow up to 80% before address, then 100% once address is filled
  let formProgress = Math.round((baseCompleted / baseTotal) * 80);
  if (form.address.trim()) {
    formProgress = 100;
  }

  const handleImageUpload = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (!result.didCancel && result.assets && result.assets[0].uri) {
        setProfileImage(result.assets[0].uri);
        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('customer.name') + ' ' + t('validation.required'));
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert(t('common.error'), t('customer.phone') + ' ' + t('validation.required'));
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      Alert.alert(t('common.error'), t('validation.invalidPhone'));
      return;
    }

    setIsLoading(true);
    try {
      const customerData = {
        name: form.name.trim(),
        mobileNumber: form.phone.trim(),
        address: form.address.trim() || undefined,
      };

      await apiService.createCustomer(customerData);
      Alert.alert(t('common.success'), t('customer.addedSuccess'));
      navigation.goBack();
    } catch (err) {
      console.error('Error creating customer:', err);
      const error = err as Error & { status?: number };

      // Handle specific error cases
      if (error.status === 409) {
        Alert.alert(t('common.error'), t('customer.exists'));
      } else if (error.status === 400) {
        Alert.alert(t('common.error'), error.message || t('validation.required'));
      } else {
        Alert.alert(t('common.error'), t('customer.createFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">


      <View style={styles.formCard}>
        {/* Image Uploader */}
        <View style={styles.imageUploaderContainer}>
          <TouchableOpacity style={styles.imageUploader} onPress={handleImageUpload}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Icon name="person" size={56} color="#fff" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Icon name="photo-camera" size={16} color={colors.textSecondary as string} />
            </View>
          </TouchableOpacity>
          {/* Form progress line */}
          <View style={styles.formProgressContainer}>
            <View style={styles.formProgressTrack}>
              <View style={[styles.formProgressFill, { width: `${formProgress}%` }]}>
                {/* <LinearGradient
              colors={['#229B73', '#1a8f6e', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            /> */}
              </View>
            </View>
          </View>
        </View>
        {/* Progress Bar */}
        {/* {profileImage && (
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )} */}

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="person" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('customer.name')}*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder={t('placeholders.fullName')}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        {/* Phone Number */}
        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="phone" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('customer.phone')}</Text>
          </View>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder={t('placeholders.phone')}
              value={form.phone}
              keyboardType="numeric"   // ensures number keypad
              maxLength={10}           // limit to 10 digits
              onChangeText={(text) => {
                // allow only digits
                const cleaned = text.replace(/[^0-9]/g, '');
                setForm({ ...form, phone: cleaned });
              }}
            />
            {/* <TouchableOpacity style={styles.contactIcon}>
              <Icon name="contacts" size={20} color={colors.textSecondary as string} />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="location-on" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('customer.address')}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('placeholders.address')}
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
            multiline
          />
        </View>
      </View>

      {/* Beautiful Gradient Button */}
      <Button
        variant="gradient"
        title={isLoading ? t('common.loading') : t('customer.addCustomer')}
        height={56}
        gradientColors={['#229B73', '#1a8f6e', '#000000']}
        onPress={handleSubmit}
        disabled={isLoading}
        style={{ margin: 16, borderRadius: 12 }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  formProgressContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    width: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',


  },
  formProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  formProgressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#229B73',
    overflow: 'hidden',
  },
  formCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android shadow
    elevation: 2,
  },
  imageUploaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageUploader: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2DBE91',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressBarContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#2DBE91',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCode: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryCodeText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  contactIcon: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default AddCustomer;