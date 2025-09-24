import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import LinearGradient from 'react-native-linear-gradient';
import ConfirmModal from '../../components/ConfirmModal';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import Button from '../../components/Button';
// import * as SMS from 'expo-sms';
import { Order, OrderStatus, ClothItem } from '../../types/order';
import apiService from '../../services/api';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import orderCache from '../../services/orderCache';
import { useAuth } from '../../context/AuthContext';
import { RegularText, TitleText } from '../../components/CustomText';
// import colors from '../../constants/colors';
// import { base64ToDataUrl, isValidBase64DataUrl, isValidFileUri } from '../../utils/imageUtils';
import { styles } from './styles/OrderDetailsStyles';

type OrderDetailsScreenNavigationProp = NativeStackNavigationProp<OrderStackParamList, 'OrderDetails'>;
type OrderDetailsScreenRouteProp = RouteProp<OrderStackParamList, 'OrderDetails'>;

// interface OrderItem {
//   id: string;
//   name: string;
//   quantity: number;
//   price: number;
// }

const OrderDetails = () => {
  const navigation = useNavigation<OrderDetailsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const route = useRoute<OrderDetailsScreenRouteProp>();
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [orderMeasurements, setOrderMeasurements] = useState<any[]>([]);
  // We intentionally avoid showing unrelated customer-level measurements
  // unless they are explicitly attached to this order.

  const fetchOrderDetails = useCallback(async () => {
    if (!route.params?.orderId) {
      Alert.alert('Error', 'No order ID provided');
      setLoading(false);
      return;
    }
    
    console.log('Fetching order details for ID:', route.params.orderId);

    const decodeShopIdFromJwt = (token: string | null): string | null => {
      if (!token) { return null; }
      try {
        const part = token.split('.')[1] || '';
        let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) { b64 += '='; }
        const json = decodeURIComponent(
          atob(b64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(json);
        return payload?.shopId || null;
      } catch {
        try {
          // @ts-ignore
          const { Buffer } = require('buffer');
          const json = Buffer.from((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
          const payload = JSON.parse(json);
          return payload?.shopId || null;
        } catch {
          return null;
        }
      }
    };

    try {
      console.log('=== MOBILE FRONTEND: GET /orders/:id - request ===', route.params.orderId);
      const data = await apiService.getOrderById(route.params.orderId);
      console.log('=== MOBILE FRONTEND: GET /orders/:id - response ===');
      try {
        console.table((data?.clothes || []).map((c: any) => ({ type: c.type, color: c.color, fabric: c.fabric, price: c.price, materialCost: c.materialCost, images: (c.imageUrls||[]).length })));
      } catch {}
      try { console.log(JSON.stringify(data, null, 2)); } catch {}
      const myShopId = decodeShopIdFromJwt(accessToken);
      const orderShopId = (data as any)?.shopId || (data as any)?.customer?.shopId || null;
      if (myShopId && orderShopId && myShopId !== orderShopId) {
        Alert.alert('Access denied', 'You cannot view orders from another shop.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        setLoading(false);
        return;
      }
      console.log('Received order data:', data);
      console.log('Order clothes data:', data?.clothes);
      console.log('Order clothes imageUrls:', data?.clothes?.map((c: any) => ({ type: c.type, imageUrls: c.imageUrls, imageData: c.imageData })));
      
      // Data received - logging only (no alert)
      if (data?.clothes && data.clothes.length > 0) {
        const firstCloth = data.clothes[0];
        console.log('Data Received:', `Cloth: ${firstCloth.type}, ImageUrls: ${firstCloth.imageUrls?.length || 0}, ImageData: ${firstCloth.imageData?.length || 0}`);
      }
      
      console.log('Order items:', data?.items);
      console.log('Order items type:', data?.items ? typeof data.items : 'no items');
      const safeItems = Array.isArray(data?.items) ? (data.items as any[]) : [];
      if (safeItems.length) {
        console.log('Items array length:', safeItems.length);
        safeItems.forEach((item: any, index: number) => {
          console.log(`Item ${index}:`, item);
        });
      }
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [route.params?.orderId, accessToken, navigation]);

  useEffect(() => {
    console.log('Fetching order details for ID:', route.params?.orderId);
    fetchOrderDetails();
  }, [fetchOrderDetails, route.params?.orderId]);

  useEffect(() => {
    if (order?.id) {
      fetchOrderMeasurements(order.id);
    }
  }, [order?.id]);

  // Removed auto-fetching customer measurements to avoid showing data
  // from other orders when none were added for this order.

  useEffect(() => {
    if (order?.customerId && (!order.customer || !order.customer.name)) {
      console.log('Fetching customer details for ID:', order.customerId);
      fetchCustomerDetails(order.customerId);
    } else if (order?.customer) {
      console.log('Setting customer from order:', order.customer);
      setCustomer(order.customer);
    }
  }, [order]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const data = await apiService.getCustomerById(customerId);
      setCustomer(data);
    } catch (error) {
      setCustomer(null);
    }
  };


  const fetchOrderMeasurements = async (orderId: string) => {
    try {
      const data = await apiService.getMeasurementsByOrder(orderId);
      console.log('[Measurements] fetched by orderId', orderId, 'count=', Array.isArray(data) ? data.length : 'non-array', data?.[0]);
      setOrderMeasurements(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('[Measurements] fetch by orderId failed', e);
      setOrderMeasurements([]);
    }
  };

  // Note: Deliberately omitted fetching customer-level measurements here.

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(order?.id || '', newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      sendStatusUpdateSMS(newStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  // Confirmation modal state
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<OrderStatus>('pending');
  const [pendingTitle, setPendingTitle] = React.useState<string>('Confirm');
  const [pendingMessage, setPendingMessage] = React.useState<string>('Are you sure?');

  const askConfirm = (status: OrderStatus) => {
    console.log('askConfirm called with status:', status);
    setPendingStatus(status);
    if (status === 'in_progress') {
      setPendingTitle('Start Processing');
      setPendingMessage('Do you want to start processing this order?');
    } else if (status === 'delivered') {
      setPendingTitle('Mark as Delivered');
      setPendingMessage('Confirm delivery of this order?');
    } else if (status === 'cancelled') {
      setPendingTitle('Cancel Order');
      setPendingMessage('Are you sure you want to cancel this order?');
    }
    setConfirmVisible(true);
    console.log('confirmVisible set to true');
  };

  const sendStatusUpdateSMS = async (status: OrderStatus) => {
    if (!order?.customer?.phone) { return; }

    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Your order has been received and is pending processing.',
      in_progress: 'Your order is now being processed.',
      delivered: 'Your order has been delivered.',
      cancelled: 'Your order has been cancelled.',
    };

    try {
      console.log('Sending SMS:', statusMessages[status]);
      // const isAvailable = await SMS.isAvailableAsync();
      // if (isAvailable) {
      //   await SMS.sendSMSAsync([order.customer.phone], message);
      // }
    } catch (error) {
      console.error('Failed to send SMS:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    console.log('OrderDetails - Status for color:', status, typeof status);
    const normalizedStatus = String(status).toLowerCase().trim();
    switch (normalizedStatus) {
      case 'pending':
        return '#F59E0B'; // Amber/Orange background
      case 'in_progress':
        return '#3B82F6'; // Blue background
      case 'delivered':
        return '#10B981'; // Emerald Green background
      case 'cancelled':
        return '#EF4444'; // Red background
      default:
        console.log('OrderDetails - Using default color for status:', status);
        return '#6B7280'; // Grey background
    }
  };

  const getStatusTextColor = (_status: OrderStatus) => {
    // All text will be white for better contrast
    return '#FFFFFF';
  };

  const formatStatus = (status: OrderStatus) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateTotal = (items?: any[]): number => {
    const safe = Array.isArray(items) ? items : [];
    return safe.reduce((sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  };

  // const handleCreateOrder = () => {
  //   (navigation as any).navigate('AddOrder');
  // };

  if (loading) {
    return (
      <View style={styles.container}>
        <RegularText>Loading...</RegularText>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <RegularText>Order not found</RegularText>
      </View>
    );
  }

  // Get items from different sources
  let itemsFromNotes: any[] = [];
  let itemsFromClothes: any[] = [];

  // Removed duplicate notes parsing - handled below

  // 🚀 IMPROVED: Parse items from notes with better error handling
  try {
    if (order.notes) {
      let notesObj;
      if (typeof order.notes === 'string') {
        // Try to parse as JSON, fallback to treating as plain text
        try {
          notesObj = JSON.parse(order.notes);
        } catch {
          console.log('Notes is plain text, not JSON:', order.notes);
          notesObj = null;
        }
      } else {
        notesObj = order.notes;
      }

      console.log('Parsed notes:', notesObj);
      if (notesObj && typeof notesObj === 'object') {
        if (Array.isArray(notesObj.items)) {
          itemsFromNotes = notesObj.items;
          console.log('Items with prices from notes.items:', itemsFromNotes);
        } else if (Array.isArray(notesObj.clothes)) {
          // Fallback: build items from notes.clothes using their price
          itemsFromNotes = notesObj.clothes.map((c: any, idx: number) => ({
            id: String(c.id || idx),
            name: c.type,
            quantity: 1,
            price: Number(c.price) || 0,
          }));
          console.log('Items with prices from notes.clothes:', itemsFromNotes);
        }
      }
    }
  } catch (e) {
    console.error('Error parsing notes:', e);
  }

  // Convert clothes array to items format as backup
  if (order.clothes && Array.isArray(order.clothes)) {
    console.log('Converting clothes to items:', order.clothes);
    const notesItems = itemsFromNotes; // Keep reference to match items
    itemsFromClothes = order.clothes.map((cloth: ClothItem) => {
      // Try to find matching item from notes to get the original price
      const matchingItem = notesItems.find(item => item.name === cloth.type);
      const finalPrice = (cloth as any)?.price != null && !isNaN(Number((cloth as any).price))
        ? Number((cloth as any).price)
        : (matchingItem?.price || cloth.materialCost || 0);
      console.log('Price calculation for', cloth.type, ':', {
        matchingItemPrice: matchingItem?.price,
        materialCost: cloth.materialCost,
        clothPrice: (cloth as any)?.price,
        finalPrice
      });
      return {
        id: cloth.id,
        name: cloth.type,
        quantity: 1,
        price: finalPrice,
        notes: cloth.designNotes,
      };
    });
    console.log('Items from clothes with prices:', itemsFromClothes);
  }

  // Combine items from all sources, preferring notes items if available
  const displayItemsRaw = itemsFromNotes.length > 0 ? itemsFromNotes : itemsFromClothes;

  // 🚀 DEDUPE: Sometimes the same cloth/item can appear twice (e.g., from notes and clothes mapping)
  let displayItems = (() => {
    const seen = new Set<string>();
    const unique: any[] = [];
    (displayItemsRaw || []).forEach((it: any) => {
      const key = String(it?.id || '') + '|' + String(it?.name || '');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(it);
      }
    });
    return unique;
  })();
  console.log('Final display items (deduped):', displayItems);

  // 🚀 SPECIAL CASE: For ALTERATION orders, drive UI strictly from clothes array
  if (order?.orderType === 'ALTERATION' && Array.isArray(order?.clothes) && order!.clothes!.length > 0) {
    const seenClothIds = new Set<string>();
    displayItems = (order!.clothes as any[]).reduce((acc: any[], cloth: any) => {
      const cid = String(cloth.id || cloth.type);
      if (!seenClothIds.has(cid)) {
        seenClothIds.add(cid);
        acc.push({ id: cloth.id || cid, name: cloth.type || 'Cloth', quantity: 1, price: 0 });
      }
      return acc;
    }, []);
    console.log('Final display items (alteration from clothes):', displayItems);
  }

  // 🚀 FIXED: Calculate total price based on order type
  // Prefer backend-saved totalAmount; when absent, add BOTH item totals and cloth costs
  const itemsTotalCalc = calculateTotal(displayItems);
  const clothMaterialTotalCalc = (order.clothes || []).reduce((sum: number, c: any) => sum + (Number(c.materialCost) || 0), 0);
  const clothPriceTotalCalc = (order.clothes || []).reduce((sum: number, c: any) => sum + (Number(c.price) || 0), 0);
  const combinedCalc = itemsTotalCalc + clothMaterialTotalCalc + clothPriceTotalCalc;

  const totalPrice = order.orderType === 'ALTERATION'
    ? (order.alterationPrice || 0)
    : (typeof order.totalAmount === 'number' && !isNaN(order.totalAmount) && order.totalAmount > 0
        ? order.totalAmount
        : combinedCalc);

  if (loading) {
    return (
      <View style={styles.container}>
        <RegularText>Loading...</RegularText>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <RegularText>Order not found</RegularText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 24) }}>
      <View style={styles.header}>
        <TitleText style={styles.title}>Order #ORD-{String(order.serialNumber).padStart(4, '0')}</TitleText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <RegularText style={[styles.statusText, { color: getStatusTextColor(order.status) }]}>{formatStatus(order.status)}</RegularText>
        </View>
      </View>

      <View style={styles.section}>
        <TitleText style={styles.sectionTitle}>Customer Information</TitleText>
        <RegularText style={styles.text}>Name: {customer?.name || order.customer?.name || ''}</RegularText>
        <RegularText style={styles.text}>Phone: {customer?.mobileNumber || order.customer?.phone || ''}</RegularText>
        <RegularText style={styles.text}>Address: {customer?.address || order.customer?.address || 'N/A'}</RegularText>
      </View>

      <View style={styles.section}>
        <TitleText style={styles.sectionTitle}>
          {order.orderType === 'ALTERATION' ? 'Alteration Items' : 'Order Items'}
        </TitleText>
        {displayItems.length > 0 ? (
          displayItems.map((item) => {
            const clothForItem = (order.clothes || []).find(c => c.type === item.name) as ClothItem | undefined;
            const isOpen = expanded[clothForItem?.id || item.id || item.name] || false;
            const isSingleCloth = (order.clothes?.length || 0) === 1;

            // Normalize direct measurements from cloth (may be object or array or undefined)
            // Pull measurements from cloth, but avoid duplicating ones we'll also fetch by orderId
            const directMs = (clothForItem as any)?.measurements;
            const directArray = Array.isArray(directMs) ? directMs : (directMs ? [directMs] : []);

            // Try parsing measurements and attributes from notes -> clothes[]
            let notesMs: any[] = [];
            let notesClothMeta: any = null;
            try {
              let np = null;
              if (order.notes) {
                if (typeof order.notes === 'string') {
                  try {
                    np = JSON.parse(order.notes);
                  } catch {
                    np = null;
                  }
                } else {
                  np = order.notes;
                }
              }
              let matchFromNotes = np?.clothes?.find((c: any) => c?.type === clothForItem?.type);
              if (!matchFromNotes && isSingleCloth && Array.isArray(np?.clothes) && np!.clothes!.length > 0) {
                matchFromNotes = np!.clothes![0];
              }
              notesClothMeta = matchFromNotes || null;
              if (matchFromNotes?.measurements) {
                notesMs = Array.isArray(matchFromNotes.measurements) ? matchFromNotes.measurements : [matchFromNotes.measurements];
              }
              console.log('[Measurements] notesPath item=', item.name, 'count=', notesMs.length, 'sample=', notesMs[0]);
            } catch (e) {
              // ignore
            }

            // Try cache snapshot as last resort
            let cacheMs: any[] = [];
            let cacheClothMeta: any = null;
            try {
              const snap = orderCache.getSnapshot(order.id);
              let matchFromCache = snap?.clothes?.find((c: any) => c?.type === clothForItem?.type);
              if (!matchFromCache && isSingleCloth && Array.isArray(snap?.clothes) && snap!.clothes!.length > 0) {
                matchFromCache = snap!.clothes![0];
              }
              cacheClothMeta = matchFromCache || null;
              if (matchFromCache?.measurements) {
                cacheMs = Array.isArray(matchFromCache.measurements) ? matchFromCache.measurements : [matchFromCache.measurements];
              }
              console.log('[Measurements] cachePath item=', item.name, 'count=', cacheMs.length, 'sample=', cacheMs[0]);
            } catch {}

            // Collect images from multiple sources: cloth -> notes.uploadedImages -> cache.uploadedImages
            let notesImages: string[] = [];
            try {
              let np = null;
              if (order.notes) {
                if (typeof order.notes === 'string') {
                  try {
                    np = JSON.parse(order.notes);
                  } catch {
                    np = null;
                  }
                } else {
                  np = order.notes;
                }
              }
              notesImages = Array.isArray(np?.uploadedImages) ? np.uploadedImages : [];
            } catch {}
            let cacheImages: string[] = [];
            try {
              const snap = orderCache.getSnapshot(order.id);
              cacheImages = Array.isArray(snap?.uploadedImages) ? snap!.uploadedImages! : [];
            } catch {}
            // Handle both old string format and new object format for imageUrls
            const directImages: string[] = Array.isArray((clothForItem as any)?.imageUrls)
              ? ((clothForItem as any).imageUrls as any[]).map((img: any) => {
                  if (typeof img === 'string') {
                    return img;
                  } else if (img && typeof img === 'object') {
                    // Try multiple possible URL properties
                    return img.url || img.originalUrl || img.publicUrl || img.viewUrl || '';
                  }
                  return '';
                }).filter((url: string) => url && url.trim() !== '')
              : [];
            // Also check if imageUrls is a single string (not an array)
            if (typeof (clothForItem as any)?.imageUrls === 'string' && (clothForItem as any).imageUrls.trim() !== '') {
              directImages.push((clothForItem as any).imageUrls);
            }

            // Also check for images in the cloth object itself
            const clothImages: string[] = [];
            if ((clothForItem as any)?.images && Array.isArray((clothForItem as any).images)) {
              (clothForItem as any).images.forEach((img: any) => {
                if (typeof img === 'string') {
                  clothImages.push(img);
                } else if (img && typeof img === 'object') {
                  const url = img.url || img.originalUrl || img.publicUrl || img.viewUrl || '';
                  if (url) { clothImages.push(url); }
                }
              });
            }

            // Combine all image sources with priority: directImages > clothImages > notesImages > cacheImages
            let imagesArray: string[] = [
              ...directImages,
              ...clothImages,
              ...notesImages,
              ...cacheImages
            ].filter((url, index, arr) => arr.indexOf(url) === index); // Remove duplicates

            // Only show images if they actually exist
            if (imagesArray.length === 0) {
              console.log('[OrderDetails] No images found for cloth item:', clothForItem?.type);
            }

            // Debug logging for images (simplified)
            if (imagesArray.length > 0) {
              console.log('[OrderDetails] Found images for', clothForItem?.type, ':', imagesArray.length, 'images');
            }

            const matchedByKeys = orderMeasurements.filter((m: any) => {
              const match = (m.orderId === order?.id || !m.orderId) && (m.type === clothForItem?.type || m.clothId === clothForItem?.id);
              return match;
            });

            // Prefer order-level fetched measurements first to avoid duplicates,
            // then fall back to notes/cache, and only then direct embedded measurements
            let measurementsArray = (matchedByKeys.length > 0
              ? matchedByKeys
              : (notesMs.length > 0
                  ? notesMs
                  : (cacheMs.length > 0
                      ? cacheMs
                      : directArray
                    )
                )
            );

            // 🚀 DEDUPE measurement objects (stringify keys to detect duplicates)
            if (measurementsArray && measurementsArray.length > 1) {
              const seenMs = new Set<string>();
              measurementsArray = measurementsArray.filter((m: any) => {
                const key = JSON.stringify(Object.keys(m).sort().reduce((o: any, k: string) => { o[k] = m[k]; return o; }, {}));
                if (seenMs.has(key)) { return false; }
                seenMs.add(key);
                return true;
              });
            }

            console.log('[Measurements] item=', item.name,
              'clothId=', clothForItem?.id,
              'direct=', directArray.length,
              'matchedByKeys=', matchedByKeys.length,
              'notesMs=', notesMs.length,
              'fallbackFromOrder=', orderMeasurements.length,
              'finalUsed=', measurementsArray.length,
              'sample=', measurementsArray[0]
            );

            const measurementFields = [
              'height', 'chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'inseam', 'neck',
              'armhole', 'bicep', 'wrist', 'outseam', 'thigh', 'knee', 'calf', 'ankle',
            ];
            const renderMeasurementsGrid = () => (
              <View style={styles.measureGrid}>
                {measurementsArray.length === 0 && (
                  <RegularText style={styles.measureEmpty}>No measurements added.</RegularText>
                )}
                {measurementsArray.map((m: any, idx: number) => (
                  <View key={idx} style={styles.measureGroup}>r
                    {measurementFields.filter(k => m?.[k] !== undefined && m?.[k] !== null)
                      .map((key) => (
                        <View key={key} style={styles.measureItem}>
                          <RegularText style={styles.measureKey}>{key}</RegularText>
                          <RegularText style={styles.measureVal}>{String(m[key])}</RegularText>
                        </View>
                      ))}
                  </View>
                ))}
              </View>
            );
            return (
              <View key={item.id || item.name} style={styles.itemContainer}>
                <View style={styles.orderItem}>
                  <RegularText style={styles.itemName}>{order.orderType === 'ALTERATION' ? `Alteration: ${item.name}` : item.name}</RegularText>
                  <RegularText style={styles.itemDetails}>
                    {item.quantity} x ₹{item.price}
                  </RegularText>
                </View>

                {/* Cloth info (if any) */}
                {clothForItem && (
                  <View style={styles.subCard}>
                    <TitleText style={styles.subTitle}>Cloth</TitleText>
                    <View style={styles.subRow}><RegularText style={styles.subKey}>Type</RegularText><RegularText style={styles.subVal}>{clothForItem.type || '-'}</RegularText></View>
                    {(() => {
                      const displayColor = (clothForItem as any)?.color || notesClothMeta?.color || cacheClothMeta?.color || '-';
                      const displayFabric = (clothForItem as any)?.fabric || notesClothMeta?.fabric || cacheClothMeta?.fabric || '-';
                      return (
                        <>
                          <View style={styles.subRow}><RegularText style={styles.subKey}>Color</RegularText><RegularText style={styles.subVal}>{String(displayColor)}</RegularText></View>
                          <View style={styles.subRow}><RegularText style={styles.subKey}>Fabric</RegularText><RegularText style={styles.subVal}>{String(displayFabric)}</RegularText></View>
                        </>
                      );
                    })()}
                    {order.orderType === 'ALTERATION' ? (
                      <>
                        <View style={styles.subRow}><RegularText style={styles.subKey}>Material Cost</RegularText><RegularText style={styles.subVal}>₹0.00</RegularText></View>
                        {(clothForItem as any)?.price != null && (
                          <View style={styles.subRow}><RegularText style={styles.subKey}>Price</RegularText><RegularText style={styles.subVal}>₹{Number((clothForItem as any).price).toFixed(2)}</RegularText></View>
                        )}
                      </>
                    ) : (
                      <>
                        {clothForItem.materialCost != null && (
                          <View style={styles.subRow}><RegularText style={styles.subKey}>Material Cost</RegularText><RegularText style={styles.subVal}>₹{Number(clothForItem.materialCost).toFixed(2)}</RegularText></View>
                        )}
                        {(clothForItem as any)?.price != null && (
                          <View style={styles.subRow}><RegularText style={styles.subKey}>Price</RegularText><RegularText style={styles.subVal}>₹{Number((clothForItem as any).price).toFixed(2)}</RegularText></View>
                        )}
                      </>
                    )}
                    {!!clothForItem.designNotes && (
                      <View style={styles.subRow}><RegularText style={styles.subKey}>Notes</RegularText><RegularText style={styles.subVal}>{clothForItem.designNotes}</RegularText></View>
                    )}
                    {/* Images Section - Only show if there are images */}
                    {imagesArray.length > 0 && (
                      <View style={styles.imageSection}>
                        <RegularText style={styles.subTitle}>
                          Images ({imagesArray.length})
                        </RegularText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {imagesArray.map((uri, idx) => (
                            <View key={idx} style={styles.imageThumbWrap}>
                              <View style={styles.imageThumbShadow}>
                                <View style={styles.imageThumbBorder}>
                                  <Image
                                    source={{ uri }}
                                    style={styles.imageThumb}
                                    onError={(error) => {
                                      console.log('🚨 OrderDetails Image load error:', error.nativeEvent.error);
                                      console.log('🚨 Failed image URI:', uri);
                                    }}
                                    onLoad={() => {
                                      console.log('✅ OrderDetails Image loaded successfully:', uri);
                                    }}
                                  />
                                </View>
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}

                {/* Measurements toggle */}
                <View style={styles.measureHeader}>
                  <TitleText style={styles.subTitle}>Measurements</TitleText>
                  <TouchableOpacity
                    onPress={() => setExpanded(prev => ({ ...prev, [clothForItem?.id || item.id || item.name]: !isOpen }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {isOpen ? <ChevronUp size={18} color="#334155" /> : <ChevronDown size={18} color="#334155" />}
                  </TouchableOpacity>
                </View>
                {isOpen && renderMeasurementsGrid()}
              </View>
            );
          })
        ) : (
          <RegularText style={styles.text}>No items in this order. (Check if notes field contains items.)</RegularText>
        )}
        <View style={styles.totalContainer}>
          <TitleText style={styles.totalLabel}>Total:</TitleText>
          <TitleText style={styles.totalAmount}>
            ₹{totalPrice.toFixed(2)}
          </TitleText>
        </View>
      </View>

      <View style={styles.section}>
        <TitleText style={styles.sectionTitle}>Order Timeline</TitleText>
        {/* Inject delivery date at top if available */}
        {order.deliveryDate && (
          <View style={styles.timelineEvent}>
            <RegularText style={styles.timelineDate}>{new Date(order.deliveryDate).toLocaleDateString()}</RegularText>
            <RegularText style={styles.timelineText}>Delivery Date</RegularText>
          </View>
        )}
        {order.timeline?.map((event, index) => (
          <View key={index} style={styles.timelineEvent}>
            <RegularText style={styles.timelineDate}>{event.date}</RegularText>
            <RegularText style={styles.timelineText}>{event.event}</RegularText>
          </View>
        ))}
      </View>

      
      <View style={styles.section}>
        <TitleText style={styles.sectionTitle}>Notes</TitleText>
        {(() => {
          try {
            if (!order.notes) { return <RegularText style={styles.notes}>-</RegularText>; }
            if (typeof order.notes === 'string') {
              try {
                const n = JSON.parse(order.notes);
                if (n && typeof n === 'object' && typeof n.notes === 'string') {
                  return <RegularText style={styles.notes}>{n.notes}</RegularText>;
                }
              } catch {}
              return <RegularText style={styles.notes}>{order.notes}</RegularText>;
            } else if (typeof (order as any).notes?.notes === 'string') {
              return <RegularText style={styles.notes}>{(order as any).notes.notes}</RegularText>;
            }
          } catch {}
          return <RegularText style={styles.notes}>-</RegularText>;
        })()}
      </View>

      <View style={[styles.actionButtons, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.topRowButtons}>
          <Button
            variant="gradient"
            title="Start Processing"
            height={36}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            onPress={() => askConfirm('in_progress')}
            disabled={order.status === 'in_progress' || order.status === 'delivered' || order.status === 'cancelled'}
            style={[styles.actionButton, { opacity: (order.status === 'in_progress' || order.status === 'delivered' || order.status === 'cancelled') ? 0.5 : 1, flex: 1, marginRight: 8 }]}
          />

          <Button
            variant="gradient"
            title="Mark as Delivered"
            height={36}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            onPress={() => askConfirm('delivered')}
            disabled={order.status === 'delivered'}
            style={[styles.actionButton, { opacity: order.status === 'delivered' ? 0.5 : 1, flex: 1, marginLeft: 8 }]}
          />
        </View>

        <Button
          variant="gradient"
          title="Cancel Order"
          height={36}
          gradientColors={['#ef4444', '#dc2626', '#b91c1c']}
          onPress={() => askConfirm('cancelled')}
          style={[styles.actionButton, { width: '100%', marginTop: 12 }]}
        />
      </View>

      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={confirmVisible}
        title={pendingTitle}
        message={pendingMessage}
        confirmText="Confirm"
        cancelText="Close"
        onConfirm={async () => {
          setConfirmVisible(false);
          await updateOrderStatus(pendingStatus);
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
};


export default OrderDetails;
