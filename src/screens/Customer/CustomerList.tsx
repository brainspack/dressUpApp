import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import apiService from '../../services/api';

type CustomerListScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'CustomerList'>;

interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
  createdAt: string;
  shopId: string;
}

const CustomerList = () => {
  const navigation = useNavigation<CustomerListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCustomers();
      console.log('Fetched customers:', data);
      console.log('Number of customers:', data.length);
      data.forEach((customer, index) => {
        console.log(`Customer ${index + 1}:`, {
          id: customer.id,
          name: customer.name,
          mobile: customer.mobileNumber,
          address: customer.address
        });
      });
      setAllCustomers(data);
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter customers based on search query
  const filterCustomers = (query: string) => {
    if (!query.trim()) {
      setCustomers(allCustomers);
      return;
    }
    
    const filtered = allCustomers.filter(customer =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.mobileNumber.includes(query) ||
      (customer.address && customer.address.toLowerCase().includes(query.toLowerCase()))
    );
    setCustomers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  // Fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Refresh customers when screen comes into focus (e.g., after adding a customer)
  useFocusEffect(
    React.useCallback(() => {
      fetchCustomers();
    }, [])
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View style={styles.customerItem}>
      <TouchableOpacity
        style={styles.customerInfo}
        onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
      >
        <Text style={styles.customerName}>{item.name}</Text>
        <Text style={styles.customerContact}>{item.mobileNumber}</Text>
        <Text style={styles.customerAddress}>{item.address || 'No address'}</Text>
        <Text style={styles.customerDate}>Added: {new Date(item.createdAt).toLocaleDateString()}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.orderButton}
        onPress={() => {
          // TODO: Navigate to AddOrder screen
          console.log('Order button pressed for customer:', item.name);
        }}
      >
        <Text style={styles.orderButtonText}>Order</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            filterCustomers(text);
          }}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? 'Loading customers...' : 'No customers found'}
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  orderButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CustomerList; 