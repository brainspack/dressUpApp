import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import { OrderStatus } from '../../types/order';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import { UserPlus, Calendar, Package } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import { styles } from './styles/OrderListStyles';
import Button from '../../components/Button';


type OrderListScreenNavigationProp = NativeStackNavigationProp<
  OrderStackParamList,
  'OrderList'
>;

interface OrderItemLite {
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderApi {
  id: string;
  customerId: string;
  customerName?: string;
  items?: OrderItemLite[];
  clothes?: { id?: string; type?: string; materialCost?: number; price?: number }[];
  totalAmount?: number;
  orderType?: 'STITCHING' | 'ALTERATION'; // 🚀 Add orderType field
  alterationPrice?: number; // 🚀 Add alterationPrice field
  status: OrderStatus;
  createdAt: string;
  deliveryDate?: string;
  serialNumber: number;
  notes?: string | any;
  shopId?: string;
  assignedTo?: string | null; // Add this field for assignment tracking
  assignedAt?: string | null; // Add this field for assignment timestamp
  tailorName?: string | null;
}

const getStatusColor = (status: OrderStatus) => {
  console.log('Status for color:', status, typeof status);
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
      console.log('Using default color for status:', status);
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

// const getDisplayItems = (order: OrderApi) => {
//   return order.items || [];
// };

// const getDisplayTotal = (order: OrderApi) => {
//   if (!order.items?.length) return 0;
//   return order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
// };

const OrderList = () => {
  const navigation = useNavigation<OrderListScreenNavigationProp>();
  const { t } = useTranslation();
  const { accessToken, loading: authLoading } = useAuth();
  const [_orders, setOrders] = useState<OrderApi[]>([]);
  const [allOrders, setAllOrders] = useState<OrderApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [statusFilterVisible, setStatusFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'notAssigned' | 'assigned'>('notAssigned');
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderApi | null>(null);
  const [selectedTailorId, setSelectedTailorId] = useState<string>('');
  const [selectedTailorName, setSelectedTailorName] = useState<string>('');
  const [tailors, setTailors] = useState<any[]>([]);
  const [tailorDropdownVisible, setTailorDropdownVisible] = useState(false);

  // Move below fetchOrders to avoid "used before declaration" warnings



  // moved below fetchOrders

  // Refetch handled by fetchOrders dependency changes

  const populateTailorNames = async (orders: OrderApi[]): Promise<OrderApi[]> => {
    try {
      // Get all unique tailor IDs from assigned orders
      const tailorIds = [...new Set(orders
        .filter(order => order.assignedTo)
        .map(order => order.assignedTo)
      )].filter(Boolean) as string[];
      
      if (tailorIds.length === 0) {
        return orders; // No assigned orders, return as is
      }
      
      // Fetch tailor details for all assigned tailors
      const tailorsData = await apiService.getTailors();
      const tailorMap = new Map(tailorsData.map(tailor => [tailor.id, tailor.name || tailor.id]));
      
      // Update orders with tailor names
      return orders.map(order => ({
        ...order,
        tailorName: order.assignedTo ? tailorMap.get(order.assignedTo) || 'Unknown Tailor' : null
      }));
    } catch (error) {
      console.warn('[OrderList] Failed to populate tailor names:', error);
      return orders; // Return orders as is if we can't populate names
    }
  };

  const decodeShopIdFromJwt = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const part = token.split('.')[1] || '';
      let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const json = decodeURIComponent(
        atob(b64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      console.log('[OrderList] JWT payload:', payload);
      return payload?.shopId || payload?.user?.shopId || null;
    } catch {
      try {
        // @ts-ignore
        const { Buffer } = require('buffer');
        const json = Buffer.from((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        const payload = JSON.parse(json);
        return payload?.shopId || payload?.user?.shopId || null;
      } catch {
        return null;
      }
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!accessToken || authLoading) return;
    try {
      console.log('[OrderList] Starting fetchOrders...');
      const shopId = decodeShopIdFromJwt(accessToken);
      console.log('[OrderList] Decoded shopId:', shopId);
      
      let ordersData: any[] = [];
      
      // 🚀 SHOP-SPECIFIC: Only show orders from current user's logged-in shop
      // This ensures each user only sees their shop's orders
      if (shopId) {
        try {
          console.log('[OrderList] Fetching orders for current shop only:', shopId, 'with status:', selectedStatus);
          ordersData = await apiService.getOrdersByShop(shopId, selectedStatus);
          console.log('[OrderList] Shop-specific orders result:', ordersData);
        } catch (shopError) {
          console.warn('[OrderList] Failed to fetch orders by shop, falling back to all orders:', shopError);
          ordersData = await apiService.getOrders(selectedStatus);
        }
      } else {
        // No shopId in JWT, try to get it from user's shops
        console.log('[OrderList] No shopId in JWT, trying to get from user shops...');
        try {
          const myShops = await apiService.getMyShops();
          console.log('[OrderList] My shops:', myShops);
          
          if (myShops && myShops.length > 0) {
            const firstShopId = myShops[0].id;
            console.log('[OrderList] Using first shop ID:', firstShopId);
            ordersData = await apiService.getOrdersByShop(firstShopId, selectedStatus);
            console.log('[OrderList] Orders by first shop result:', ordersData);
          } else {
            console.log('[OrderList] No shops found, fetching all orders');
            ordersData = await apiService.getOrders(selectedStatus);
          }
        } catch (shopError) {
          console.warn('[OrderList] Failed to get shops, fetching all orders:', shopError);
          ordersData = await apiService.getOrders(selectedStatus);
        }
      }
      
      console.log('[OrderList] Raw orders data:', ordersData);
      console.log('[OrderList] Orders count before filtering:', Array.isArray(ordersData) ? ordersData.length : 'Not an array');
      
      // If we still don't have orders, try fetching customers and filtering
      if (!Array.isArray(ordersData) || ordersData.length === 0) {
        console.log('[OrderList] No orders found, trying customer-based approach...');
        const myCustomers = await apiService.getCustomers().catch(() => [] as any[]);
        console.log('[OrderList] My customers:', myCustomers);
        
        if (myCustomers.length > 0) {
          const allOrders = await apiService.getOrders(selectedStatus);
          const myCustomerIdSet = new Set(myCustomers.map((c: any) => c.id));
          ordersData = allOrders.filter((o: any) => myCustomerIdSet.has(o.customerId));
          console.log('[OrderList] Orders after customer filtering:', ordersData.length);
        }
      }

      let filtered: OrderApi[] = Array.isArray(ordersData) ? ordersData : [];

      // Remove deleted orders
      console.log('[OrderList] Before deletedAt filtering:', filtered.length);
      filtered = filtered.filter(o => !(o as any).deletedAt);

      // Populate tailor names for assigned orders
      const ordersWithTailorNames = await populateTailorNames(filtered);

      setAllOrders(ordersWithTailorNames);
      setOrders(ordersWithTailorNames);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, authLoading, selectedStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const filterOrders = (query: string) => {
    if (!query.trim()) {
      setOrders(allOrders);
      return;
    }

    const filtered = allOrders.filter(order =>
      order.customerName?.toLowerCase().includes(query.toLowerCase()) ||
      String(order.serialNumber).includes(query) ||
      order.status.toLowerCase().includes(query.toLowerCase())
    );
    setOrders(filtered);
  };

  const parseNotesItems = (order: OrderApi): OrderItemLite[] => {
    try {
      if (!order.notes) return [];
      const obj = typeof order.notes === 'string' ? JSON.parse(order.notes) : order.notes;
      if (obj && Array.isArray(obj.items)) {
        return obj.items.map((it: any) => ({
          id: it.id,
          name: it.name,
          quantity: Number(it.quantity) || 1,
          price: Number(it.price) || 0,
        }));
      }
      return [];
    } catch {
      return [];
    }
  };

  const getDisplayItems = (order: OrderApi): OrderItemLite[] => {
    // Prefer explicit items if present
    if (order.items && order.items.length > 0) return order.items;

    // Try to parse from notes first
    const fromNotes = parseNotesItems(order);
    if (fromNotes.length > 0) return fromNotes;

    // Fallback to clothes; prefer price field if present, else materialCost
    if (order.clothes && order.clothes.length > 0) {
      return order.clothes.map((c, idx) => ({
        id: c.id || String(idx),
        name: c.type || 'Item',
        quantity: 1,
        price: (typeof c.price === 'number' && !isNaN(c.price) ? Number(c.price) : Number(c.materialCost) || 0),
      }));
    }
    return [];
  };

  const getDisplayTotal = (order: OrderApi): number => {
    // 🚀 FIXED: For alteration orders, use alterationPrice
    if (order.orderType === 'ALTERATION' && typeof order.alterationPrice === 'number') {
      console.log(`[OrderList] Using alteration price for order ${order.id}: ₹${order.alterationPrice}`);
      return order.alterationPrice;
    }
    
    // First try to get total from stored totalAmount
    if (typeof order.totalAmount === 'number' && order.totalAmount > 0) return order.totalAmount;
    
    // Calculate from items if available
    const items = getDisplayItems(order);
    const itemsSum = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    if (itemsSum > 0) return itemsSum;
    
    // Calculate from clothes with price field (preferred)
    if (order.clothes && order.clothes.length > 0) {
      const clothesSum = order.clothes.reduce((acc, c) => acc + (Number(c.price) || 0), 0);
      if (clothesSum > 0) return clothesSum;
      
      // Fallback to materialCost if price is not available
      const materialSum = order.clothes.reduce((acc, c) => acc + (Number(c.materialCost) || 0), 0);
      if (materialSum > 0) return materialSum;
    }
    
    return 0;
  };

  const handleAssignOrder = async (order: OrderApi) => {
    try {
      setSelectedOrder(order);
      setSelectedTailorId('');
      setSelectedTailorName('');
      setAssignModalVisible(true);
      
      // Get shopId for filtering tailors
      const shopId = decodeShopIdFromJwt(accessToken);
      console.log('[OrderList] Assigning order for shopId:', shopId);
      
      let tailorsData: any[] = [];
      
      // Try to fetch tailors by shop first (most efficient)
      if (shopId) {
        try {
          console.log('[OrderList] Fetching tailors by shop:', shopId);
          tailorsData = await apiService.getTailorsByShop(shopId);
        } catch (shopError) {
          console.warn('[OrderList] Failed to fetch tailors by shop, falling back to all tailors:', shopError);
          tailorsData = await apiService.getTailors();
        }
      } else {
        // No shopId, try to get it from user's shops
        console.log('[OrderList] No shopId in JWT, trying to get from user shops...');
        try {
          const myShops = await apiService.getMyShops();
          console.log('[OrderList] My shops:', myShops);
          
          if (myShops && myShops.length > 0) {
            const firstShopId = myShops[0].id;
            console.log('[OrderList] Using first shop ID for tailors:', firstShopId);
            tailorsData = await apiService.getTailorsByShop(firstShopId);
          } else {
            console.log('[OrderList] No shops found, fetching all tailors');
            tailorsData = await apiService.getTailors();
          }
        } catch (shopError) {
          console.warn('[OrderList] Failed to get shops, fetching all tailors:', shopError);
          tailorsData = await apiService.getTailors();
        }
      }
      
      console.log('[OrderList] Raw tailors data:', tailorsData);
      
      // Filter out soft-deleted tailors and ensure they're from the correct shop
      const activeTailors = tailorsData
        .filter((tailor: any) => !tailor.deletedAt) // Remove soft-deleted
        .filter((tailor: any) => {
          // If we have a shopId, ensure tailor belongs to that shop
          if (shopId) {
            return tailor.shopId === shopId;
          }
          return true; // If no shopId, accept all (fallback case)
        })
        .filter((tailor: any, index: number, self: any[]) => 
          index === self.findIndex((t: any) => t.id === tailor.id) // Remove duplicates
        );
      
      console.log('[OrderList] Filtered active tailors:', activeTailors);
      setTailors(activeTailors);
    } catch (e) {
      console.error('Failed to fetch tailors:', e);
      Alert.alert('Error', 'Failed to fetch tailors');
    }
  };

  const handleSubmitAssignment = async () => {
    if (!selectedOrder || !selectedTailorId) {
      Alert.alert('Error', 'Please select a tailor');
      return;
    }

    try {
      // Call API to assign order to tailor (send ID, not name)
      const assignedOrder = await apiService.assignOrder(selectedOrder.id, selectedTailorId);
      
      // Update local state with the response from API
      const updatedOrders = allOrders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, assignedTo: assignedOrder.assignedTo, assignedAt: assignedOrder.assignedAt, tailorName: selectedTailorName }
          : order
      );
      
      // Force refresh the state
      setAllOrders([...updatedOrders]);
      setOrders([...updatedOrders]);
      
      // Close modal and reset
      setAssignModalVisible(false);
      setSelectedOrder(null);
      setSelectedTailorId('');
      setSelectedTailorName('');
      setTailorDropdownVisible(false);
      
      Alert.alert('Success', 'Order assigned successfully!');
    } catch (e) {
      console.error('Failed to assign order:', e);
      Alert.alert('Error', 'Failed to assign order');
    }
  };

  const handleCancelAssign = async (order: OrderApi) => {
    try {
      await apiService.unassignOrder(order.id);
      const updated = allOrders.map(o => 
        o.id === order.id ? { ...o, assignedTo: null, assignedAt: null, tailorName: null } : o
      );
      setAllOrders([...updated]);
      setOrders([...updated]);
      Alert.alert('Success', 'Assignment cancelled');
    } catch (e) {
      console.error('Failed to unassign order:', e);
      Alert.alert('Error', 'Failed to cancel assignment');
    }
  };

  // Filter orders based on active tab and search
  const getFilteredOrders = () => {
    let filtered = allOrders; // Use allOrders instead of orders for proper filtering
    
    // Filter by assignment status FIRST
    if (activeTab === 'notAssigned') {
      filtered = filtered.filter(order => !order.assignedTo || order.assignedTo === '');
    } else {
      filtered = filtered.filter(order => order.assignedTo && order.assignedTo !== '');
    }
    
    // Filter by status (show all orders if 'all' is selected)
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === selectedStatus);
    }
    
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  // Force re-filter when tab changes
  useEffect(() => {
    // This will trigger a re-render when activeTab changes
  }, [activeTab]);

  const statusOptions = [
    { label: 'All Orders', value: 'all' },
    { label: t('status.pending'), value: 'pending' as OrderStatus },
    { label: t('status.in_progress'), value: 'in_progress' as OrderStatus },
    { label: t('status.delivered'), value: 'delivered' as OrderStatus },
    { label: t('status.cancelled'), value: 'cancelled' as OrderStatus },
  ];

  const renderOrderItem = ({ item }: { item: OrderApi }) => {
    const displayItems = getDisplayItems(item);
    const total = getDisplayTotal(item);
    
    return (
      <View style={styles.orderItemContainer}>
        <View style={styles.orderItem}>
        <LinearGradient
          colors={[colors.brand, colors.brandDark, colors.blueDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardAccent}
        />
        <View style={styles.orderContent}>
          <TouchableOpacity
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
            activeOpacity={0.8}
            style={localStyles.flex1}
          >
            <View style={styles.orderHeader}>
              <View style={styles.orderIdContainer}>
                <Package size={16} color={colors.brand} style={styles.orderIcon} />
                <RegularText style={styles.orderId}>
                  {t('order.order')} #ORD-{String(item.serialNumber).padStart(4, '0')}
                </RegularText>
              </View>
              <View style={[styles.typeBadge, item.orderType === 'ALTERATION' ? styles.typeAlteration : styles.typeStitching]}>
                <RegularText style={styles.typeText}>{item.orderType === 'ALTERATION' ? 'Alteration' : 'Stitching'}</RegularText>
              </View>
                <View style={[styles.statusBadge, { 
                  backgroundColor: getStatusColor(item.status)
                }] }>
                  <RegularText style={[styles.statusText, { color: getStatusTextColor(item.status) }] }>
                    {formatStatus(item.status)}
                  </RegularText>
                </View>
            </View>

            {!!item.customerName && (
              <View style={styles.customerInfo}>
                <UserPlus size={14} color={colors.textSecondary} style={styles.customerIcon} />
                <RegularText style={styles.customerName}>{item.customerName}</RegularText>
              </View>
            )}
            <View style={styles.dateInfo}>
              <Calendar size={14} color={colors.textSecondary} style={styles.dateIcon} />
              <RegularText style={styles.orderDate}>
                {t('order.ordered')}: {new Date(item.createdAt).toLocaleDateString()}
              </RegularText>
            </View>

            <View style={styles.dateInfo}>
              <Calendar size={14} color={colors.textSecondary} style={styles.dateIcon} />
              <RegularText style={styles.deliveryDate}>
                {t('order.delivery')}: {item.deliveryDate ? new Date(item.deliveryDate).toLocaleDateString() : 'Not set'}
              </RegularText>
            </View>

            {displayItems.length > 0 && (
              <View style={styles.itemsContainer}>
                {displayItems.map((orderItem) => (
                  <View key={(orderItem.id as string) || orderItem.name} style={styles.itemRow}>
                    <View style={styles.itemDot} />
                    <RegularText style={styles.itemText}>
                      {(item.orderType === 'ALTERATION' ? 'Alteration: ' : '')}{orderItem.name} x {orderItem.quantity} - ₹{orderItem.price}
                    </RegularText>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.totalContainer}>
              <RegularText style={styles.totalAmount}>
                {t('order.total')}: ₹{total}
              </RegularText>
              <RegularText style={styles.assignedText}>
                {t('order.assignedTo')}: {item.tailorName || t('order.none')}
              </RegularText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          {activeTab === 'notAssigned' ? (
            <View style={styles.assignButtonContainer}>
              <Button
                variant="gradient"
                title={t('order.assign')}
                height={34}
                gradientColors={[colors.brand, colors.brandDark, colors.blueDark]}
                icon={<UserPlus size={14} color="#fff" />}
                onPress={() => handleAssignOrder(item)}
                style={localStyles.smallButton}
              />
            </View>
          ) : (
            <View style={styles.assignButtonContainer}>
              <Button
                variant="gradient"
                title="Unassign"
                height={34}
                gradientColors={[colors.danger, '#d12a2a', '#8a1d1d']}
                onPress={() => handleCancelAssign(item)}
                style={localStyles.smallButton}
              />
            </View>
          )}
        </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notAssigned' && styles.activeTab]}
          onPress={() => setActiveTab('notAssigned')}
        >
                      <RegularText style={[styles.tabText, activeTab === 'notAssigned' && styles.activeTabText]}>
              {t('order.notAssigned')}
            </RegularText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.activeTab]}
          onPress={() => setActiveTab('assigned')}
        >
                      <RegularText style={[styles.tabText, activeTab === 'assigned' && styles.activeTabText]}>
              {t('order.assigned')}
            </RegularText>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('placeholders.searchOrder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={(text) => { setSearchQuery(text); filterOrders(text); }}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

     

      {/* Status Filter Button */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.statusFilterButton}
          onPress={() => setStatusFilterVisible(true)}
        >
          <Text style={styles.statusFilterText}>
            {selectedStatus === 'all' ? t('status.all_orders') : t(`status.${selectedStatus}`)}
          </Text>
          <Icon name="keyboard-arrow-down" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.totalInline}>
          <Text style={[styles.totalInlineText, localStyles.alignEnd]}>
            {`${t('order.orders')}: ${filteredOrders.length}`}
          </Text>
        </View>
      </View>

      {loading ? (
        <RegularText style={styles.loading}>{t('common.loading')}</RegularText>
      ) : (
        <>
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            extraData={activeTab} // Force re-render when tab changes
            ListEmptyComponent={
              <RegularText style={styles.emptyText}>{t('common.no_data')}</RegularText>
            }
          />

          {/* Status Filter Bottom Sheet */}
          <Modal
            visible={statusFilterVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setStatusFilterVisible(false)}
          >
            <View style={styles.bottomSheetBackdrop}>
              <View style={styles.statusFilterBottomSheet}>
                <View style={styles.bottomSheetHandle} />
                <View style={styles.statusFilterHeader}>
                  <RegularText style={styles.statusFilterTitle}>Select an option</RegularText>
                  <TouchableOpacity onPress={() => setStatusFilterVisible(false)}>
                    <Icon name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusFilterOption,
                      selectedStatus === option.value && styles.statusFilterOptionSelected
                    ]}
                    onPress={() => {
                      setSelectedStatus(option.value as OrderStatus | 'all');
                      setStatusFilterVisible(false);
                    }}
                  >
                    <RegularText style={[
                      styles.statusFilterOptionText,
                      selectedStatus === option.value && styles.statusFilterOptionTextSelected
                    ]}>
                      {option.label}
                    </RegularText>
                    {selectedStatus === option.value && (
                      <Icon name="check" size={20} color={colors.brand} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          {/* Assign Order Modal */}
          <Modal
            visible={assignModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setAssignModalVisible(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.assignModal}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <TitleText style={styles.modalTitle}>{t('order.assignToWorker')}</TitleText>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setAssignModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={styles.modalContent}>
                  <RegularText style={styles.itemLabel}>
                    {selectedOrder?.clothes?.[0]?.type || 'Item'}
                  </RegularText>
                  
                  {/* Tailor Selection Dropdown */}
                  <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setTailorDropdownVisible(!tailorDropdownVisible)}
                    >
                      <RegularText style={[
                        styles.dropdownButtonText,
                        !selectedTailorName && styles.placeholderText
                      ]}>
                        {selectedTailorName || t('order.selectBlouseWorker')}
                      </RegularText>
                      <Icon 
                        name={tailorDropdownVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                        size={20} 
                        color={colors.textSecondary} 
                      />
                    </TouchableOpacity>

                    {/* Tailor Dropdown List */}
                    {tailorDropdownVisible && (
                      <View style={styles.dropdownList}>
                        {tailors.map((tailor) => (
                          <TouchableOpacity
                            key={tailor.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedTailorId(tailor.id);
                              setSelectedTailorName(tailor.name || tailor.id);
                              setTailorDropdownVisible(false);
                            }}
                          >
                            <RegularText style={styles.dropdownItemText}>
                              {tailor.name || tailor.id}
                            </RegularText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitAssignment}
                >
                  <RegularText style={styles.submitButtonText}>{t('order.submit')}</RegularText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};


export default OrderList; 
const localStyles = StyleSheet.create({
  flex1: { flex: 1 },
  smallButton: { width: 90, borderRadius: 8 },
  alignEnd: { alignSelf: 'flex-end' },
});