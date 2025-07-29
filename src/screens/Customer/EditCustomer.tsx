import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  measurements: {
    height: number;
    chest: number;
    waist: number;
    hips: number;
  };
}

const EditCustomer = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const customer = route.params?.customer as Customer;
  const [form, setForm] = useState<Customer>({
    ...customer,
    measurements: {
      ...customer.measurements,
      height: customer.measurements.height.toString(),
      chest: customer.measurements.chest.toString(),
      waist: customer.measurements.waist.toString(),
      hips: customer.measurements.hips.toString(),
    },
  });

  const handleSubmit = () => {
    // TODO: Implement customer update logic
    console.log('Updating customer:', form);
    navigation.goBack();
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

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Update Customer</Text>
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
});

export default EditCustomer; 