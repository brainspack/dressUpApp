import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { addCustomerStyles as styles } from './styles';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
// import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

interface ValidationRules {
  name: {
    required: boolean;
    minLength: number;
    maxLength: number;
  };
  phone: {
    required: boolean;
    pattern: RegExp;
    length: number;
  };
  address: {
    required: boolean;
    maxLength: number;
  };
}

const AddCustomer = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [_uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof CustomerForm, boolean>>({
    name: false,
    phone: false,
    address: false,
  });

  // Validation rules - memoized to prevent re-renders
  const validationRules: ValidationRules = useMemo(() => ({
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    phone: {
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
        phone: '',
        address: '',
      });
      setProfileImage(null);
      setUploadProgress(0);
      setErrors({});
      setTouched({
        name: false,
        phone: false,
        address: false,
      });
    }, [])
  );

  // Validation functions
  const validateField = (field: keyof CustomerForm, value: string): string | undefined => {
    const rules = validationRules[field];

    if (rules.required && !value.trim()) {
      return `${t('customer.' + field)} ${t('validation.required')}`;
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

    if (field === 'phone') {
      const phoneRules = rules as ValidationRules['phone'];
      if (!phoneRules.pattern.test(value.trim())) {
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
      const fieldKey = field as keyof CustomerForm;
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
    const phoneValid = validationRules.phone.pattern.test(form.phone.trim());
    const addressValid = validationRules.address.required
      ? form.address.trim().length > 0 && form.address.trim().length <= validationRules.address.maxLength
      : form.address.trim().length <= validationRules.address.maxLength;

    return nameValid && phoneValid && addressValid;
  }, [form.name, form.phone, form.address, validationRules]);

  // Compute form completion progress (image + name + valid phone + address)
  const baseCompleted =
    (profileImage ? 1 : 0) +
    (form.name.trim() ? 1 : 0) +
    (validationRules.phone.pattern.test(form.phone.trim()) ? 1 : 0);
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
      Alert.alert(t('common.error'), t('customer.imageUploadFailed'));
    }
  };

  const handleFieldChange = (field: keyof CustomerForm, value: string) => {
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

  const handleFieldBlur = (field: keyof CustomerForm) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      phone: true,
      address: true,
    });

    // Validate form
    if (!validateForm()) {
      Alert.alert(t('common.error'), t('validation.formInvalid'));
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
      showToast(t('customer.addedSuccess'), 'success');
      navigation.goBack();
    } catch (err) {
      console.error('Error creating customer:', err);
      const error = err as Error & { status?: number; message?: string };

      // Handle specific error cases
      if (error.message && error.message.includes('mobile number already exists')) {
        Alert.alert(
          t('common.error'),
          t('customer.phoneExists'),
          [
            { text: 'OK', onPress: () => setForm(prev => ({ ...prev, phone: '' })) },
          ]
        );
      } else if (error.status === 409) {
        Alert.alert(t('common.error'), t('customer.exists'));
      } else if (error.status === 400) {
        Alert.alert(t('common.error'), error.message || t('validation.required'));
      } else {
        Alert.alert(t('common.error'), error.message || t('customer.createFailed'));
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

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="phone" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('customer.phone')}*</Text>
          </View>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput, errors.phone && styles.inputError]}
              placeholder={t('placeholders.phone')}
              value={form.phone}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                handleFieldChange('phone', cleaned);
              }}
              onBlur={() => handleFieldBlur('phone')}
            />
          </View>
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone}</Text>
          )}
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="location-on" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> {t('customer.address')}*</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, errors.address && styles.inputError]}
            placeholder={t('placeholders.address')}
            value={form.address}
            onChangeText={(text) => handleFieldChange('address', text)}
            onBlur={() => handleFieldBlur('address')}
            multiline
            maxLength={validationRules.address.maxLength}
          />
          {errors.address && (
            <Text style={styles.errorText}>{errors.address}</Text>
          )}
        </View>
      </View>

      {/* Beautiful Gradient Button */}
      <Button
        variant="gradient"
        title={isLoading ? t('common.loading') : t('customer.addCustomer')}
        height={56}
        gradientColors={['#229B73', '#1a8f6e', '#000000']}
        onPress={handleSubmit}
        disabled={isLoading || !isFormValid}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};


export default AddCustomer;
