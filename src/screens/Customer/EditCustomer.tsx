import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { editCustomerStyles as styles } from './styles';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiService from '../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';

interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
  profileImage?: string;
}

interface CustomerForm {
  name: string;
  phone: string;
  address: string;
}

const EditCustomer = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showToast } = useToast();
  type EditCustomerRouteProp = RouteProp<{ EditCustomer: { customerId: string } }, 'EditCustomer'>;
  const route = useRoute<EditCustomerRouteProp>();
  const { customerId } = route.params;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    address: '',
  });

  // Fetch customer data when component mounts
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const customerData = await apiService.getCustomerById(customerId);
        setCustomer(customerData);
        setForm({
          name: customerData.name || '',
          phone: customerData.mobileNumber || '',
          address: customerData.address || '',
        });
        if (customerData.profileImage) {
          setProfileImage(customerData.profileImage);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        Alert.alert('Error', 'Failed to fetch customer data');
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  // Show loading state while fetching customer data
  if (!customer) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading customer data...</Text>
        </View>
      </View>
    );
  }

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
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!customer || !customer.id) {
      Alert.alert('Error', 'Customer ID not found. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const customerData = {
        name: form.name.trim(),
        mobileNumber: form.phone.trim(),
        address: form.address.trim() || undefined,
      };

      console.log('Updating customer with data:', { customerId: customer.id, customerData });
      
      const updatedCustomer = await apiService.updateCustomer(customer.id, customerData);
      console.log('Customer update response:', updatedCustomer);
      
      showToast('Customer updated successfully!', 'success');
      navigation.goBack();
    } catch (err) {
      console.error('Error updating customer:', err);
      Alert.alert('Error', 'Failed to update customer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteCustomer(customer.id);
              Alert.alert('Success', 'Customer deleted successfully');
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
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
              <View style={[styles.formProgressFill, { width: `${formProgress}%` }]} />
            </View>
          </View>
        </View>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="person" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> Name*</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="phone" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> Phone</Text>
          </View>
          <View style={styles.phoneContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              placeholder="Enter phone number"
              value={form.phone}
              keyboardType="numeric"
              maxLength={10}
              onChangeText={(text) => {
                // allow only digits
                const cleaned = text.replace(/[^0-9]/g, '');
                setForm({ ...form, phone: cleaned });
              }}
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Icon name="location-on" size={18} color={colors.textSecondary as string} />
            <Text style={styles.label}> Address</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter address"
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
            multiline
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {/* Update Customer Button */}
        <Button
          variant="gradient"
          title={isLoading ? 'Updating...' : 'Update Customer'}
          height={56}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={handleSubmit}
          disabled={isLoading}
          style={{ marginBottom: 12, borderRadius: 12 }}
        />
        
        {/* Delete Customer Button */}
        <Button
          variant="light"
          title="Delete Customer"
          height={48}
          onPress={handleDelete}
          style={{ borderRadius: 12 }}
        />
      </View>
    </ScrollView>
  );
};


export default EditCustomer; 