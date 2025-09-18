import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { addTailorStyles as styles } from './styles';
import apiService from '../../services/api';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Button from '../../components/Button';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../../constants/colors';
import { useToast } from '../../context/ToastContext';

interface TailorForm {
  name: string;
  mobileNumber: string;
  address: string;
}

interface FormErrors {
  name?: string;
  mobileNumber?: string;
  address?: string;
}

interface ValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  mobileNumber: {
    required: boolean;
    pattern: RegExp;
    length: number;
  };
  address: {
    required: boolean;
    maxLength: number;
  };
}

const AddTailor = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [_uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form, setForm] = useState<TailorForm>({
    name: '',
    mobileNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof TailorForm, boolean>>({
    name: false,
    mobileNumber: false,
    address: false,
  });

  // Validation rules - memoized to prevent re-renders
  const validationRules: ValidationRules = useMemo(() => ({
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    mobileNumber: {
      required: true,
      pattern: /^[0-9]{10}$/,
      length: 10,
    },
    address: {
      required: true,
      maxLength: 200,
    },
  }), []);

  // Reset form when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setForm({
        name: '',
        mobileNumber: '',
        address: '',
      });
      setProfileImage(null);
      setUploadProgress(0);
      setErrors({});
      setTouched({
        name: false,
        mobileNumber: false,
        address: false,
      });
    }, [])
  );

  // Validation functions
  const validateField = (field: keyof TailorForm, value: string): string | undefined => {
    const rules = validationRules[field];

    if (rules.required && !value.trim()) {
      return `${t('tailor.' + field)} ${t('validation.required')}`;
    }

    if (field === 'name') {
      const nameRules = rules as ValidationRules['name'];
      if (value.trim().length < nameRules.minLength) {
        return `${t('validation.minLength')} ${nameRules.minLength} ${t('validation.characters')}`;
      }
      if (value.trim().length > nameRules.maxLength) {
        return `${t('validation.maxLength')} ${nameRules.maxLength} ${t('validation.characters')}`;
      }
      if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
        return t('validation.nameInvalid');
      }
    }

    if (field === 'mobileNumber') {
      const mobileRules = rules as ValidationRules['mobileNumber'];
      if (!mobileRules.pattern.test(value.trim())) {
        return t('validation.invalidPhone');
      }
    }

    if (field === 'address') {
      const addressRules = rules as ValidationRules['address'];
      if (value.trim().length > addressRules.maxLength) {
        return `${t('validation.maxLength')} ${addressRules.maxLength} ${t('validation.characters')}`;
      }
    }

    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(form).forEach((field) => {
      const fieldKey = field as keyof TailorForm;
      const error = validateField(fieldKey, form[fieldKey]);
      if (error) {
        newErrors[fieldKey] = error;
        isValid = false;
      }
    });

    // Only update errors if they have changed to prevent unnecessary re-renders
    const hasErrorsChanged = JSON.stringify(newErrors) !== JSON.stringify(errors);
    if (hasErrorsChanged) {
      setErrors(newErrors);
    }

    return isValid;
  };

  // Memoized form validation to prevent infinite re-renders
  const isFormValid = useMemo(() => {
    const nameValid = form.name.trim().length >= validationRules.name.minLength &&
                     form.name.trim().length <= validationRules.name.maxLength &&
                     /^[a-zA-Z\s]+$/.test(form.name.trim());
    const mobileValid = validationRules.mobileNumber.pattern.test(form.mobileNumber.trim());
    const addressValid = validationRules.address.required
      ? form.address.trim().length > 0 && form.address.trim().length <= validationRules.address.maxLength
      : form.address.trim().length <= validationRules.address.maxLength;

    return nameValid && mobileValid && addressValid;
  }, [form.name, form.mobileNumber, form.address, validationRules]);

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
      Alert.alert(t('common.error'), t('tailor.imageUploadFailed'));
    }
  };

  const handleFieldChange = (field: keyof TailorForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Validate field in real-time if it has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: keyof TailorForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleAddTailor = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      mobileNumber: true,
      address: true,
    });

    // Validate form
    if (!validateForm()) {
      Alert.alert(t('common.error'), t('validation.formInvalid'));
      return;
    }

    setLoading(true);
    try {
      const shopId = await AsyncStorage.getItem('shopId');
      if (!shopId) {
        Alert.alert(t('common.error'), 'Shop ID not found');
        return;
      }
      await apiService.addTailor({
        name: form.name.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: form.address.trim() || undefined,
        shopId,
      });
      showToast(t('tailor.addedSuccess'), 'success');
      (navigation as any).goBack();
    } catch (error: any) {
      console.error('Error creating tailor:', error);
      const errorMessage = error as Error & { status?: number; message?: string };

      // Handle specific error cases
      if (errorMessage.message && errorMessage.message.includes('mobile number already exists')) {
        Alert.alert(
          t('common.error'),
          t('tailor.phoneExists'),
          [
            { text: 'OK', onPress: () => setForm(prev => ({ ...prev, mobileNumber: '' })) },
          ]
        );
      } else if (errorMessage.status === 409) {
        Alert.alert(t('common.error'), t('tailor.exists'));
      } else if (errorMessage.status === 400) {
        Alert.alert(t('common.error'), errorMessage.message || t('validation.required'));
      } else {
        Alert.alert(t('common.error'), errorMessage.message || t('tailor.createFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Compute form completion progress (image + name + valid mobile + address)
  const baseCompleted =
    (profileImage ? 1 : 0) +
    (form.name.trim() ? 1 : 0) +
    (validationRules.mobileNumber.pattern.test(form.mobileNumber.trim()) ? 1 : 0);
  const baseTotal = 3;
  // Allow up to 80% before address, then 100% once address is filled
  let formProgress = Math.round((baseCompleted / baseTotal) * 80);
  if (form.address.trim()) {
    formProgress = 100;
  }

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
              <Text style={styles.cameraIcon}>📷</Text>
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
          <View style={styles.labelContainer}>
            <Icon name="person" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('tailor.name')}*</Text>
          </View>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder={t('placeholders.fullName')}
            value={form.name}
            onChangeText={(text) => handleFieldChange('name', text)}
            onBlur={() => handleFieldBlur('name')}
            maxLength={validationRules.name.maxLength}
          />
          {errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>
        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Icon name="phone" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('tailor.phone')}*</Text>
          </View>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput, errors.mobileNumber && styles.inputError]}
              placeholder={t('placeholders.phone')}
              value={form.mobileNumber}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                handleFieldChange('mobileNumber', cleaned);
              }}
              onBlur={() => handleFieldBlur('mobileNumber')}
            />
          </View>
          {errors.mobileNumber && (
            <Text style={styles.errorText}>{errors.mobileNumber}</Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelContainer}>
            <Icon name="location-on" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('tailor.address')}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            placeholder={t('placeholders.address')}
            value={form.address}
            onChangeText={(text) => handleFieldChange('address', text)}
            onBlur={() => handleFieldBlur('address')}
            multiline
            numberOfLines={3}
            maxLength={validationRules.address.maxLength}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
      </View>

      <Button
        variant="gradient"
        title={loading ? t('common.loading') : t('tailor.addTailor')}
        height={56}
        gradientColors={['#229B73', '#1a8f6e', '#000000']}
        onPress={handleAddTailor}
        disabled={loading || !isFormValid}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};


export default AddTailor;

