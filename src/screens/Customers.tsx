import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from '../navigation/types';
import Button from '../components/Button';
import Input from '../components/Input';

type CustomersScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Customers'>;

// Mock data for customers
const mockCustomers = [
  { id: '1', name: 'John Doe', phone: '123-456-7890', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', phone: '098-765-4321', email: 'jane@example.com' },
];

const Customers = () => {
  const navigation = useNavigation<CustomersScreenNavigationProp>();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState(mockCustomers);

  const renderCustomerItem = ({ item }: { item: typeof mockCustomers[0] }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => {
        // Navigate to customer details
        // navigation.navigate('CustomerDetails', { customerId: item.id });
      }}
    >
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerContact}>{item.phone}</Text>
        <Text style={styles.customerContact}>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder={t('customer.searchCustomer')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <Button
          title={{ key: 'customer.addCustomer' }}
          onPress={() => {
            // Navigate to add customer screen
            // navigation.navigate('AddCustomer');
          }}
          variant="primary"
        />
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('customer.noCustomers')}</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
  },
  customerItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  customerInfo: {
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  customerContact: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
});

export default Customers; 