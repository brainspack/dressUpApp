import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

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

const CustomerDetails = () => {
  const route = useRoute();
  const customer = route.params?.customer as Customer;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <Text style={styles.text}>Name: {customer.name}</Text>
        <Text style={styles.text}>Phone: {customer.phone}</Text>
        <Text style={styles.text}>Email: {customer.email}</Text>
        <Text style={styles.text}>Address: {customer.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Measurements</Text>
        <Text style={styles.text}>Height: {customer.measurements.height} cm</Text>
        <Text style={styles.text}>Chest: {customer.measurements.chest} cm</Text>
        <Text style={styles.text}>Waist: {customer.measurements.waist} cm</Text>
        <Text style={styles.text}>Hips: {customer.measurements.hips} cm</Text>
      </View>
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
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default CustomerDetails; 