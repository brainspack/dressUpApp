import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiService from '../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
import Button from '../../components/Button';
import { useTranslation } from 'react-i18next';

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
      
      Alert.alert('Success', 'Customer updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.danger,
    textAlign: 'center',
    marginTop: 100,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  actionButtons: {
    margin: 16,
    marginBottom: 32,
  },
});

export default EditCustomer; 