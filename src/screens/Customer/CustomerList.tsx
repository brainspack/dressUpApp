import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import Button from '../../components/Button';
import Input from '../../components/Input';

type CustomerListScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Customers'>;

interface Customer {
  id: string;
  name: string;
  mobile: string;
  address: string;
  createdAt: string;
}

const CustomerList = () => {
  const navigation = useNavigation<CustomerListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerItem}
      onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
    >
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerContact}>{item.mobile}</Text>
        <Text style={styles.customerAddress}>{item.address}</Text>
        <Text style={styles.customerDate}>Added: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        <Button
          title="Add Customer"
          onPress={() => navigation.navigate('AddCustomer')}
          variant="primary"
        />
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No customers found</Text>
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
  customerAddress: {
    fontSize: 14,
    color: '#666',
  },
  customerDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
  },
});

export default CustomerList; 