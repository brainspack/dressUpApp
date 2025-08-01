import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/api';

interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  address: string;
  measurements: {
    height: string;
    chest: string;
    waist: string;
    hips: string;
  };
}

const AddCustomer = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CustomerForm>({
    name: '',
    phone: '',
    email: '',
    address: '',
    measurements: {
      height: '',
      chest: '',
      waist: '',
      hips: '',
    },
  });

  // Reset form when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        measurements: {
          height: '',
          chest: '',
          waist: '',
          hips: '',
        },
      });
    }, [])
  );

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating customer:', form);
      
      const customerData = {
        name: form.name.trim(),
        mobileNumber: form.phone.trim(),
        address: form.address.trim() || undefined,
        // Note: email and measurements are not supported by the backend yet
        // They will be handled separately in future updates
      };

      const result = await apiService.createCustomer(customerData);
      console.log('Customer created successfully:', result);
      console.log('Customer ID:', result.id);
      console.log('Customer Name:', result.name);
      console.log('Customer Mobile:', result.mobileNumber);
      Alert.alert('Success', 'Customer added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer';
      
      if (errorMessage.includes('already exists')) {
        Alert.alert('Error', 'A customer with this phone number already exists. Please use a different phone number.');
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Address"
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        <TextInput
          style={styles.input}
          placeholder="Height (cm)"
          value={form.measurements.height}
          onChangeText={(text) =>
            setForm({
              ...form,
              measurements: { ...form.measurements, height: text },
            })
          }
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Chest (cm)"
          value={form.measurements.chest}
          onChangeText={(text) =>
            setForm({
              ...form,
              measurements: { ...form.measurements, chest: text },
            })
          }
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Waist (cm)"
          value={form.measurements.waist}
          onChangeText={(text) =>
            setForm({
              ...form,
              measurements: { ...form.measurements, waist: text },
            })
          }
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Hips (cm)"
          value={form.measurements.hips}
          onChangeText={(text) =>
            setForm({
              ...form,
              measurements: { ...form.measurements, hips: text },
            })
          }
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Adding Customer...' : 'Add Customer'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
});

export default AddCustomer; 