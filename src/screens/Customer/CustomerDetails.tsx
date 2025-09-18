import React, { useState, useEffect } from 'react';
/* eslint-disable react-native/no-inline-styles, no-trailing-spaces */
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { customerDetailsStyles as styles } from './styles';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/api';
import Button from '../../components/Button';
import { CustomerStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';

// CustomerDetailsRouteParams was unused; removed to satisfy linter

interface Customer {
  id: string;
  serialNumber?: number;
  name: string;
  mobileNumber: string;
  shopId?: string;
  address?: string;
  createdAt: string;
}

const CustomerDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CustomerStackParamList, 'CustomerDetails'>>();
  const { customerId } = route.params;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerDetails = React.useCallback(async () => {
    try {
      console.log('[CustomerDetails] Fetching customer details for ID:', customerId);
      setLoading(true);
      const customerData = await apiService.getCustomerById(customerId);
      console.log('[CustomerDetails] Received customer data:', customerData);
      setCustomer(customerData);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      Alert.alert('Error', 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // Refresh data when screen comes back into focus (e.g., after editing)
  useFocusEffect(
    React.useCallback(() => {
      console.log('[CustomerDetails] Screen focused, refreshing data for customerId:', customerId);
      if (customerId) {
        fetchCustomerDetails();
      }
    }, [customerId, fetchCustomerDetails])
  );

  // moved into useCallback above to satisfy dependency rules

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
              await apiService.deleteCustomer(customerId);
              Alert.alert('Success', 'Customer deleted successfully');
              (navigation as any).goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  const getCustomerNumber = (cust: Customer) => {
    if (cust.serialNumber) {
      return `CUS-${String(cust.serialNumber).padStart(4, '0')}`;
    }
    // Fallback: generate from ID hash
    const hash = Math.abs(Array.from(cust.id).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
    return `CUS-${String(hash).padStart(4, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
        <RegularText style={styles.loadingText}>Loading customer details...</RegularText>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color={colors.danger} />
        <TitleText style={styles.errorTitle}>Customer Not Found</TitleText>
        <RegularText style={styles.errorText}>The customer you're looking for doesn't exist or has been deleted.</RegularText>
        <Button
          variant="gradient"
          title="Go Back"
          height={48}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={() => (navigation as any).goBack()}
          style={{ marginTop: 24, borderRadius: 12 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#229B73', '#1a8f6e', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <View style={styles.profileIconContainer}>
            <Icon name="person" size={48} color="#ffffff" />
          </View>
          <TitleText style={styles.customerName}>{customer.name}</TitleText>
          <RegularText style={styles.customerNumber}>{getCustomerNumber(customer)}</RegularText>
        </LinearGradient>
      </View>

      {/* Customer Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <TitleText style={styles.sectionTitle}>Contact Information</TitleText>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Icon name="delete" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Phone Number */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="phone" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>Phone Number</RegularText>
            <RegularText style={styles.infoValue}>{customer.mobileNumber}</RegularText>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="location-on" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>Address</RegularText>
            <RegularText style={styles.infoValue}>
              {customer.address || 'No address provided'}
            </RegularText>
          </View>
        </View>

        {/* Customer Since */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="event" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>Customer Since</RegularText>
            <RegularText style={styles.infoValue}>
              {new Date(customer.createdAt).toLocaleDateString()}
            </RegularText>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <View style={styles.buttonRow}>
          <Button
            variant="gradient"
            title="Edit Customer"
            height={56}
           
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            icon={<Icon name="edit" size={24} color="#fff" />}
            onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })}
            style={styles.actionButton}
          />
          
          <Button
            variant="light"
            title="Create Order"
            height={56}
            onPress={() => {
              const root = (navigation as any).getParent?.();
              if (root) {
                root.navigate('Orders', {
                  screen: 'OutfitSelection',
                  params: {
                    customerId: customer.id,
                    shopId: customer.shopId,
                    customerName: customer.name,
                  },
                });
              } else {
                // Fallback: try navigating relative to current nav if parent is unavailable
                (navigation as any).navigate('Orders', {
                  screen: 'OutfitSelection',
                  params: {
                    customerId: customer.id,
                    shopId: customer.shopId,
                    customerName: customer.name,
                  },
                });
              }
            }}
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};


export default CustomerDetails;