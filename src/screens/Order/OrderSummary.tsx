/**
 * OrderSummary Screen
 * 
 * This screen displays between outfit selection and order creation.
 * It shows:
 * - Customer information (name, phone, avatar)
 * - Selected outfit details with icons
 * - Total and discount fields
 * - Navigation to AddOrder screen
 * 
 * Data is fetched from backend API for customer details.
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/Button';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OrderSummaryScreenNavigationProp = NativeStackNavigationProp<OrderStackParamList, 'OrderSummary'>;
type OrderSummaryScreenRouteProp = RouteProp<OrderStackParamList, 'OrderSummary'>;

interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
}

interface SelectedOutfit {
  id: string;
  name: string;
  type: string;
  image: any; // Image source from require()
}

const OrderSummary = () => {
  console.log('OrderSummary component is being rendered!');
  
  const navigation = useNavigation<OrderSummaryScreenNavigationProp>();
  const route = useRoute<OrderSummaryScreenRouteProp>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [localSelectedOutfits, setLocalSelectedOutfits] = useState(route.params?.selectedOutfits || []);

  const { customerId, shopId, customerName, selectedOutfits: routeOutfits } = route.params;

  useEffect(() => {
    console.log('OrderSummary mounted with params:', route.params);
    console.log('Selected outfits:', localSelectedOutfits);
    console.log('Customer ID:', customerId);
    console.log('Shop ID:', shopId);
    console.log('Customer Name:', customerName);
    fetchCustomerDetails();
    checkForUpdatedPrice();
  }, [customerId]);

  // Check for updated prices when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      checkForUpdatedPrice();
    }, [])
  );

  const checkForUpdatedPrice = async () => {
    try {
      const lastPrice = await AsyncStorage.getItem('lastCalculatedPrice');
      const lastOutfitId = await AsyncStorage.getItem('lastOutfitId');
      const lastMeasurements = await AsyncStorage.getItem('lastMeasurements');
      
      if ((lastPrice || lastMeasurements) && lastOutfitId) {
        // Update the outfit with the calculated price
        const updatedOutfits = localSelectedOutfits.map(outfit => 
          outfit.id === lastOutfitId 
            ? { ...outfit, price: lastPrice ? parseFloat(lastPrice) : (outfit.price || 0) }
            : outfit
        );
        
        // Update the local state
        setLocalSelectedOutfits(updatedOutfits);
        
        // Clear the stored data
        await AsyncStorage.removeItem('lastCalculatedPrice');
        await AsyncStorage.removeItem('lastOutfitId');
        if (lastMeasurements) {
          await AsyncStorage.setItem(`ms_${lastOutfitId}`, lastMeasurements);
          await AsyncStorage.removeItem('lastMeasurements');
        }
        
        console.log('Updated outfit price:', lastOutfitId, lastPrice);
      }
    } catch (error) {
      console.error('Error checking for updated price:', error);
    }
  };

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching customer details for ID:', customerId);
      
      if (!customerId) {
        console.log('No customer ID provided, using fallback');
        setCustomer({
          id: 'fallback',
          name: customerName,
          mobileNumber: 'N/A',
          address: 'N/A'
        });
        setLoading(false);
        return;
      }

      const customerData = await apiService.getCustomerById(customerId);
      console.log('Customer data received:', customerData);
      setCustomer(customerData);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      // Use route params as fallback
      setCustomer({
        id: customerId || 'fallback',
        name: customerName,
        mobileNumber: 'N/A',
        address: 'N/A'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Ensure shopId available
      if (!shopId) {
        Alert.alert('Error', 'Shop information is required');
        return;
      }

      // Ensure customerId present; if not, create lightweight customer using entered name
      let customerIdToUse: string | undefined = customerId;
      if (!customerIdToUse) {
        if (!customerName || customerName.trim() === '') {
          Alert.alert('Error', 'Please enter customer name');
          return;
        }
        try {
          const generatedPhone = `9${Date.now().toString().slice(-9)}`;
          const createdCustomer = await apiService.createCustomer({
            name: customerName.trim(),
            mobileNumber: generatedPhone,
          });
          customerIdToUse = createdCustomer?.id;
        } catch (e) {
          console.error('Auto-create customer failed:', e);
          Alert.alert('Error', 'Failed to create customer. Please try again.');
          return;
        }
      }

      if (localSelectedOutfits.length === 0) {
        Alert.alert('Error', 'Please select at least one outfit');
        return;
      }

      // Create order for each selected outfit
      for (const outfit of localSelectedOutfits) {
        // Calculate delivery date (7 days from now as default)
        const defaultDeliveryDate = new Date();
        defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 7);
        
        const payload = {
          customerId: customerIdToUse!,
          shopId: shopId,
          status: 'PENDING',
          orderDate: new Date().toISOString(),
          deliveryDate: defaultDeliveryDate.toISOString(),
          tailorName: null,
          tailorNumber: null,
          clothes: [{
            type: outfit.type,
            color: '',
            fabric: '',
            materialCost: outfit.price || 0,
            price: outfit.price || 0,
            designNotes: '',
            imageUrls: [],
            videoUrls: [],
          }],
          notes: JSON.stringify({ 
            notes: '', 
            clothes: [{
              type: outfit.type,
              price: outfit.price || 0,
              orderType: 'stitching' // Default to stitching
            }],
            orderType: 'stitching' // Default to stitching
          }),
        };

        try {
          const created: any = await apiService.createOrder(payload);
          // After creating order, persist measurements separately so they are retrievable via API
          try {
            const orderId = created?.id || created?.order?.id;
            console.log('Created order with ID:', orderId);
            if (orderId) {
              // Fetch saved order to resolve real cloth IDs
              let savedOrder: any | null = null;
              try {
                savedOrder = await apiService.getOrderById(orderId);
                console.log('Fetched saved order:', savedOrder);
              } catch (e) {
                console.log('Fetch created order failed (will still try persisting measurements):', e);
              }
              const savedClothes: any[] = Array.isArray(savedOrder?.clothes) ? savedOrder!.clothes : [];
              console.log('Saved clothes from order:', savedClothes);

              const pickClothId = (type: string, idx: number): string | undefined => {
                // Try match by type first; then by index fallback
                let match = savedClothes.find(sc => sc?.type === type);
                if (!match && savedClothes[idx]) match = savedClothes[idx];
                console.log('Picked clothId:', match?.id, 'for type:', type, 'at index:', idx);
                return match?.id;
              };

              const msStoredStr = await AsyncStorage.getItem(`ms_${outfit.id}`);
              console.log('Stored measurements for outfit', outfit.id, ':', msStoredStr);
              const msStored: any[] = msStoredStr ? JSON.parse(msStoredStr) : [];
              console.log('Parsed measurements:', msStored);
              if (Array.isArray(msStored) && msStored.length > 0) {
                const clothId = pickClothId(outfit.type, 0);
                console.log('Found clothId:', clothId, 'for outfit type:', outfit.type);
                if (clothId) {
                  for (const m of msStored) {
                    const payloadMs: any = {
                      ...m,
                      orderId,
                      customerId: customerIdToUse,
                      type: outfit.type,
                      clothId,
                    };
                    console.log('Sending measurement payload:', payloadMs);
                    try {
                      await apiService.createMeasurement(payloadMs);
                      console.log('Measurement persisted successfully:', payloadMs);
                    } catch (e) {
                      console.log('Persist single measurement failed:', e);
                    }
                  }
                  await AsyncStorage.removeItem(`ms_${outfit.id}`);
                } else {
                  console.log('No clothId found for outfit type:', outfit.type);
                }
              } else {
                console.log('No measurements stored for outfit:', outfit.id);
              }
            }
          } catch (e) {
            console.log('Post-create measurement sync failed (non-blocking):', e);
          }
        } catch (error) {
          console.error(`Failed to create order for ${outfit.name}:`, error);
        }
      }

      Alert.alert('Success', 'Orders created successfully!');
      navigation.navigate('OrderList');
      
    } catch (error) {
      console.error('Failed to create orders:', error);
      Alert.alert('Error', 'Failed to create orders.');
    }
  };

  const handleCreateOrder = () => {
    try {
      // 🚀 FIXED: Show order type selection instead of defaulting to stitching
      Alert.alert(
        'Select Order Type',
        'Choose the type of order you want to create:',
        [
          {
            text: 'Stitching',
            onPress: () => {
              console.log('Navigating to AddOrder with params:', {
                customerId,
                shopId,
                customerName: customer?.name || customerName,
                outfitType: localSelectedOutfits[0]?.type,
                gender: localSelectedOutfits[0]?.gender,
                orderType: 'stitching'
              });
              
              navigation.navigate('AddOrder', {
                customerId,
                shopId,
                customerName: customer?.name || customerName,
                outfitType: localSelectedOutfits[0]?.type,
                gender: localSelectedOutfits[0]?.gender,
                outfitId: localSelectedOutfits[0]?.id || '',
                orderType: 'stitching'
              });
            }
          },
          {
            text: 'Alteration',
            onPress: () => {
              console.log('Navigating to AddOrder with params:', {
                customerId,
                shopId,
                customerName: customer?.name || customerName,
                outfitType: localSelectedOutfits[0]?.type,
                gender: localSelectedOutfits[0]?.gender,
                orderType: 'alteration'
              });
              
              // 🚀 FIXED: Direct navigation to AddOrder for alteration (no modal)
              navigation.navigate('AddOrder', {
                customerId,
                shopId,
                customerName: customer?.name || customerName,
                outfitType: localSelectedOutfits[0]?.type,
                gender: localSelectedOutfits[0]?.gender,
                outfitId: localSelectedOutfits[0]?.id || '',
                orderType: 'alteration'
              });
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error navigating to AddOrder:', error);
      Alert.alert('Error', 'Failed to navigate to order creation');
    }
  };

  const handleRemoveOutfit = (outfitId: string) => {
    Alert.alert(
      'Remove Outfit',
      'Are you sure you want to remove this outfit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            // Navigate back to outfit selection
            navigation.goBack();
          }
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <RegularText style={styles.loadingText}>Loading...</RegularText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TitleText style={styles.headerTitle}>Create Order</TitleText>
          <View style={styles.placeholder} />
        </View>

        {/* Customer Information Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#229B73', '#1a8f6e', '#000000']}
                style={styles.avatar}
              >
                <TitleText style={styles.avatarText}>
                  {getInitials(customer?.name || customerName)}
                </TitleText>
              </LinearGradient>
            </View>
            <View style={styles.customerDetails}>
              <TitleText style={styles.customerName}>
                {customer?.name || customerName}
              </TitleText>
              <RegularText style={styles.customerPhone}>
                {customer?.mobileNumber || 'N/A'}
              </RegularText>
            </View>
          </View>
        </View>

        {/* Selected Outfits */}
        <View style={styles.outfitsSection}>
          <TitleText style={styles.sectionTitle}>Selected Outfits</TitleText>
          {localSelectedOutfits && localSelectedOutfits.length > 0 ? (
            localSelectedOutfits.map((outfit) => {
              return (
                <View key={outfit.id} style={styles.outfitCard}>
                  <View style={styles.outfitInfo}>
                    <View style={styles.outfitIconContainer}>
                      {typeof outfit.image === 'string' ? (
                        // Show outfit name as text with a nice icon background
                        <View style={[styles.outfitIcon, { backgroundColor: colors.brand, justifyContent: 'center', alignItems: 'center' }]}>
                          <Icon name="checkroom" size={20} color={colors.white} />
                        </View>
                      ) : outfit.image ? (
                        <Image 
                          source={outfit.image} 
                          style={styles.outfitIcon} 
                          resizeMode="contain"
                          onError={(error) => console.log('Image error:', error)}
                        />
                      ) : (
                        <View style={[styles.outfitIcon, { backgroundColor: colors.gray100, justifyContent: 'center', alignItems: 'center' }]}>
                          <Icon name="image" size={20} color={colors.gray400} />
                        </View>
                      )}
                    </View>
                    <TitleText style={styles.outfitName}>{outfit.name}</TitleText>
                  </View>
                  <View style={styles.outfitActions}>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        navigation.navigate('AddOrder', {
                          customerId,
                          shopId,
                          customerName: customer?.name || customerName,
                          outfitType: outfit.type,
                          gender: outfit.gender,
                          outfitId: outfit.id,
                          outfitPrice: 0 // No default price - user will set price in AddOrder form
                        });
                      }}
                    >
                      <LinearGradient
                        colors={['#229B73', '#1a8f6e', '#000000']}
                        style={styles.addButtonGradient}
                      >
                        <Icon name="add" size={20} color={colors.white} />
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveOutfit(outfit.id)}
                    >
                      <Icon name="delete" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.outfitCard}>
              <RegularText style={styles.outfitName}>No outfits selected</RegularText>
            </View>
          )}
        </View>

        {/* Add Outfit Button */}
        <View style={styles.addOutfitButton}>
          <Button
            variant="gradient"
            title="Add Outfit"
            height={56}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            icon={<Icon name="add" size={24} color={colors.white} />}
            onPress={() => {
              navigation.navigate('OutfitSelection', {
                customerId,
                shopId,
                customerName: customer?.name || customerName,
                existingOutfits: localSelectedOutfits // Pass existing outfits so they don't get replaced
              });
            }}
            style={{ borderRadius: 12 }}
          />
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <TitleText style={styles.totalLabel}>Total:</TitleText>
            <TitleText style={styles.totalAmount}>
              ₹{localSelectedOutfits.reduce((total, outfit) => total + (outfit.price || 0), 0).toFixed(2)}
            </TitleText>
          </View>
          <View style={styles.discountInput}>
            <RegularText style={styles.discountLabel}>Discount:</RegularText>
            <View style={styles.discountField}>
              <RegularText style={styles.discountValue}>0.0</RegularText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <Button
          variant="gradient"
          title="Create Order"
          height={56}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={handleSubmit}
          style={{ borderRadius: 12 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  customerCard: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  outfitsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  outfitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  outfitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  outfitIconContainer: {
    width: 40,
    height: 40,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outfitIcon: {
    width: 32,
    height: 32,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  outfitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addOutfitButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addOutfitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  addOutfitText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  totalSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  discountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  discountField: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  discountValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default OrderSummary;
