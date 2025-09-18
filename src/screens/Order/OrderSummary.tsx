import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
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
import { useToast } from '../../context/ToastContext';
import { styles } from './styles/OrderSummaryStyles';
type OrderSummaryScreenNavigationProp = NativeStackNavigationProp<OrderStackParamList, 'OrderSummary'>;
type OrderSummaryScreenRouteProp = RouteProp<OrderStackParamList, 'OrderSummary'>;

interface Customer {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
}

// Removed unused SelectedOutfit interface

const OrderSummary = () => {
  console.log('OrderSummary component is being rendered!');
  const navigation = useNavigation<OrderSummaryScreenNavigationProp>();
  const route = useRoute<OrderSummaryScreenRouteProp>();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [localSelectedOutfits, setLocalSelectedOutfits] = useState(route.params?.selectedOutfits || []);
  const [advance, setAdvance] = useState<string>('0');

  const { customerId, shopId, customerName } = route.params;

  const checkForUpdatedPrice = useCallback(async () => {
    try {
      const lastPrice = await AsyncStorage.getItem('lastCalculatedPrice');
      const lastOutfitId = await AsyncStorage.getItem('lastOutfitId');
      const lastMeasurements = await AsyncStorage.getItem('lastMeasurements');
      const lastBreakdownRaw = await AsyncStorage.getItem('lastBreakdown');
      let lastBreakdown: any = null;
      try { lastBreakdown = lastBreakdownRaw ? JSON.parse(lastBreakdownRaw) : null; } catch {}
      if ((lastPrice || lastMeasurements) && lastOutfitId) {
        const numericPrice = lastPrice ? parseFloat(lastPrice) : undefined;
        setLocalSelectedOutfits(prev => prev.map(outfit => (
          outfit.id === lastOutfitId
            ? { ...outfit, price: numericPrice !== undefined ? numericPrice : (outfit.price || 0),
                _itemsTotal: lastBreakdown?.itemsTotal,
                _clothTotal: lastBreakdown?.clothTotal,
                _notesText: lastBreakdown?.notesText,
                _orderType: lastBreakdown?.orderType,
              }
            : outfit
        )));
        await AsyncStorage.removeItem('lastCalculatedPrice');
        await AsyncStorage.removeItem('lastOutfitId');
        await AsyncStorage.removeItem('lastBreakdown');
        if (lastMeasurements) {
          await AsyncStorage.setItem(`ms_${lastOutfitId}`, lastMeasurements);
          await AsyncStorage.removeItem('lastMeasurements');
        }
      }
    } catch (error) {
      console.error('Error checking for updated price:', error);
    }
  }, []);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching customer details for ID:', customerId);
      if (!customerId) {
        setCustomer({
          id: 'fallback',
          name: customerName,
          mobileNumber: 'N/A',
          address: 'N/A',
        });
        setLoading(false);
        return;
      }
      const customerData = await apiService.getCustomerById(customerId);
      setCustomer(customerData);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      setCustomer({
        id: customerId || 'fallback',
        name: customerName,
        mobileNumber: 'N/A',
        address: 'N/A',
      });
    } finally {
      setLoading(false);
    }
  }, [customerId, customerName]);

  useEffect(() => {
    fetchCustomerDetails();
    checkForUpdatedPrice();
  }, [fetchCustomerDetails, checkForUpdatedPrice, route.params]);

  // Check for updated prices when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      checkForUpdatedPrice();
    }, [checkForUpdatedPrice])
  );

  // Get uploaded images from AsyncStorage
  const getUploadedImages = async (outfitType: string) => {
    try {
      const storedImages = await AsyncStorage.getItem(`uploadedImages_${outfitType}`);
      if (storedImages) {
        const images = JSON.parse(storedImages);
        console.log(`Found uploaded images for ${outfitType}:`, images);
        return images;
      }
    } catch (error) {
      console.error('Error getting uploaded images:', error);
    }
    return [];
  };

  // duplicate fetchCustomerDetails removed (useCallback version above)

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

        const isAlteration = ((outfit as any)._orderType === 'alteration');
        const itemsTotal = (outfit as any)._itemsTotal != null ? Number((outfit as any)._itemsTotal) : (outfit.price || 0);
        const clothTotal = (outfit as any)._clothTotal != null ? Number((outfit as any)._clothTotal) : 0;
        const priceToSend = isAlteration ? clothTotal : itemsTotal;
        const materialToSend = isAlteration ? 0 : clothTotal;

        // Apply advance proportionally only to the first outfit for now
        let adv = parseFloat(advance || '0') || 0;
        const appliedDiscount = Math.min(adv, priceToSend + materialToSend);
        const discountedTotal = Math.max(0, (priceToSend + materialToSend) - appliedDiscount);

        // Get uploaded images for this outfit type
        const uploadedImages = await getUploadedImages(outfit.type);
        const processedImageUrls = uploadedImages.map((img: any) =>
          typeof img === 'string' ? img : img.url || img.originalUrl || ''
        ).filter((url: string) => url);

        console.log('🚀 OrderSummary: Including uploaded images:', {
          outfitType: outfit.type,
          uploadedImages: uploadedImages,
          processedImageUrls: processedImageUrls,
        });

        const payload = {
          customerId: customerIdToUse!,
          shopId: shopId,
          status: 'PENDING',
          orderDate: new Date().toISOString(),
          deliveryDate: defaultDeliveryDate.toISOString(),
          tailorName: null,
          tailorNumber: null,
          // Ensure backend stores correct order type
          orderType: (isAlteration ? 'ALTERATION' : 'STITCHING'),
          // Send separate price vs materialCost so details page shows both correctly
          clothes: [{
            type: outfit.type,
            color: '',
            fabric: '',
            materialCost: isAlteration ? 0 : materialToSend,
            price: isAlteration ? discountedTotal : Math.max(0, (priceToSend + materialToSend) - appliedDiscount) - materialToSend,
            designNotes: '',
            imageUrls: processedImageUrls, // Include the uploaded images
            videoUrls: [],
          }],
          alterationPrice: isAlteration ? Math.max(0, priceToSend - appliedDiscount) : undefined,
          notes: JSON.stringify({
            notes: (outfit as any)._notesText || '',
            clothes: [{
              type: outfit.type,
              price: isAlteration ? Math.max(0, priceToSend - appliedDiscount) : Math.max(0, (priceToSend + materialToSend) - appliedDiscount) - materialToSend,
              materialCost: isAlteration ? 0 : materialToSend,
              orderType: (isAlteration ? 'alteration' : 'stitching'),
            }],
            orderType: (isAlteration ? 'alteration' : 'stitching'),
            advanceApplied: appliedDiscount,
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
                if (!match && savedClothes[idx]) { match = savedClothes[idx]; }
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

      // Clear stored images after successful order creation
      try {
        for (const outfit of localSelectedOutfits) {
          await AsyncStorage.removeItem(`uploadedImages_${outfit.type}`);
        }
        console.log('Cleared stored images for all outfit types');
      } catch (cleanupError) {
        console.error('Error clearing stored images:', cleanupError);
      }

      showToast('Orders created successfully!', 'success');
      navigation.navigate('OrderList');

    } catch (error) {
      console.error('Failed to create orders:', error);
      Alert.alert('Error', 'Failed to create orders.');
    }
  };

  const handleRemoveOutfitChip = useCallback(async (outfitId: string, outfitType?: string) => {
    try {
      setLocalSelectedOutfits(prev => prev.filter(o => o.id !== outfitId));
      if (outfitType) {
        try {
          await AsyncStorage.removeItem(`uploadedImages_${outfitType}`);
          await AsyncStorage.removeItem(`ms_${outfitId}`);
        } catch {}
      }
      showToast('Removed outfit from order', 'success');
    } catch (e) {}
  }, [showToast]);

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

        {/* Selected Outfits - horizontal chips */}
        <View style={styles.outfitsSection}>
          <TitleText style={styles.sectionTitle}>Selected Outfits</TitleText>
          {localSelectedOutfits && localSelectedOutfits.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {localSelectedOutfits.map((outfit) => (
                <View key={outfit.id} style={styles.outfitChip}>
                  <TouchableOpacity
                    style={[styles.outfitChipClose, styles.outfitChipCloseAbs]}
                    onPress={() => handleRemoveOutfitChip(outfit.id, outfit.type)}
                  >
                    <Icon name="close" size={12} color="#6B7280" />
                  </TouchableOpacity>
                  <View style={styles.outfitChipIconWrap}>
                    {outfit.image ? (
                      <Image source={outfit.image} style={styles.outfitChipIcon} />
                    ) : (
                      <Icon name="checkroom" size={16} color={colors.white} />
                    )}
                  </View>
                  <TitleText numberOfLines={1} style={styles.outfitChipText}>{outfit.name}</TitleText>
                  <TouchableOpacity
                    style={styles.outfitChipAdd}
                    onPress={() => {
                      navigation.navigate('AddOrder', {
                        customerId,
                        shopId,
                        customerName: customer?.name || customerName,
                        outfitType: outfit.type,
                        gender: outfit.gender,
                        outfitId: outfit.id,
                      });
                    }}
                  >
                    <Icon name="add" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
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
                existingOutfits: localSelectedOutfits, // Pass existing outfits so they don't get replaced
              });
            }}
            style={styles.roundedButton}
          />
        </View>

        {/* Total Section */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <TitleText style={styles.totalLabel}>Total:</TitleText>
            <TitleText style={styles.totalAmount}>
              {(() => {
                const gross = localSelectedOutfits.reduce((total, outfit) => total + (outfit.price || 0), 0);
                const adv = parseFloat(advance || '0') || 0;
                return `₹${Math.max(0, gross - adv).toFixed(2)}`;
              })()}
            </TitleText>
          </View>
          <View style={styles.discountInput}>
            <RegularText style={styles.discountLabel}>Advance:</RegularText>
            <View style={styles.discountField}>
              <View style={styles.advanceRow}>
                <Icon name="currency-rupee" size={16} color={colors.textSecondary} />
                <TextInput
                  style={styles.advanceInput}
                  value={advance}
                  onChangeText={(text) => setAdvance((text || '').replace(/[^0-9.]/g, ''))}
                  placeholder="0.0"
                  keyboardType="numeric"
                />
              </View>
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
          onPress={() => handleSubmit()}
          style={styles.roundedButton}
        />
      </View>
    </View>
  );
};


export default OrderSummary;
