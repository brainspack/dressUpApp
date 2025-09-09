import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { customerListStyles as styles } from './styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';             
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList, MainTabParamList } from '../../navigation/types';
import Button from '../../components/Button';
import colors from '../../constants/colors';
import Input from '../../components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);

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

  useEffect(() => {
    (async () => {
      const sid = await AsyncStorage.getItem('shopId');
      setCurrentShopId(sid);
    })();
  }, []);

  // Refresh customers when screen comes into focus (e.g., after adding a customer)
  useFocusEffect(
    React.useCallback(() => {
      fetchCustomers();
    }, [])
  );

  const onDelete = async (id: string) => {
    try {
      await apiService.deleteCustomer(id);
      setAllCustomers(prev => prev.filter(c => c.id !== id));
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Failed to delete customer', e);
    }
  };

  const openOutfitSelection = (customer: Customer) => {
    // Navigate to OutfitSelection screen with customer info pre-filled
    (navigation as any).navigate('Orders', {
      screen: 'OutfitSelection',
      params: { 
        customerId: customer.id, 
        customerName: customer.name, 
        shopId: customer.shopId
      },
    });
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <View style={styles.customerItem}>
      <LinearGradient
        colors={['#229B73', '#1a8f6e', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardAccent}
      />
      <TouchableOpacity
        style={styles.customerInfo}
        onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
      >
        <View style={styles.customerField}>
          <Icon name="person" size={16} color="#229B73" style={styles.fieldIcon} />
          <Text style={styles.customerName}>{item.name}</Text>
        </View>
        <View style={styles.customerField}>
          <Icon name="phone" size={16} color="#64748b" style={styles.fieldIcon} />
          <Text style={styles.customerContact}>{item.mobileNumber}</Text>
        </View>
        <View style={styles.customerField}>
          <Icon name="location-on" size={16} color="#6b7280" style={styles.fieldIcon} />
          <Text style={styles.customerAddress}>{item.address || t('customer.noAddress')}</Text>
        </View>
        <View style={styles.customerField}>
          <Icon name="event" size={16} color="#9ca3af" style={styles.fieldIcon} />
          <Text style={styles.customerDate}>{t('common.added')}: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Button
          variant="gradient"
          title={t('order.order')}
          height={36}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={() => {
            // We are inside Customers tab; navigate to Orders stack's screen
            const parent = (navigation as any).getParent?.();
            if (parent) {
              parent.navigate('Orders', {
                screen: 'OutfitSelection',
                params: { customerId: item.id, customerName: item.name, shopId: item.shopId },
              });
            } else {
              (navigation as any).navigate('Orders', {
                screen: 'OutfitSelection',
                params: { customerId: item.id, customerName: item.name, shopId: item.shopId },
              });
            }
          }}
          style={{ width: 96, borderRadius: 8 }}
        />
        {/* <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteIconBtn}>
          <Icon name="delete-outline" size={22} color="#ef4444" />
        </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Search bar styled like the mock */}
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('customer.searchCustomer')}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => { setSearchQuery(text); filterCustomers(text); }}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        {/* Gradient Add Customer button with plus icon */}
        <Button
          variant="gradient"
          title={t('customer.addCustomer')}
          height={56}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          icon={<Icon name="add" size={24} color="#fff" />}
          onPress={() => navigation.navigate('AddCustomer')}
          style={{ borderRadius: 12 }}
        />

        <View style={styles.totalInline}>
          <Text style={[styles.totalInlineText, { alignSelf: 'flex-end' }]}>
            {`${t('customer.customers')}: ${customers.filter(c => !currentShopId || c.shopId === currentShopId).length}`}
          </Text>
        </View>
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
            {loading ? t('customer.loadingCustomers') : t('customer.noCustomers')}
          </Text>
        }
      />
    </View>
  );
};


export default CustomerList; 