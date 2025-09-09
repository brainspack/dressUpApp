import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { tailorAssignedOrdersStyles as styles } from './styles';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TailorStackParamList } from '../../navigation/types';
import { OrderStatus } from '../../types/order';
import { useTranslation } from 'react-i18next';
import apiService from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';

type TailorAssignedOrdersNavigationProp = NativeStackNavigationProp<
  TailorStackParamList,
  'TailorAssignedOrders'
>;
type TailorAssignedOrdersRouteProp = RouteProp<TailorStackParamList, 'TailorAssignedOrders'>;

interface AssignedOrder {
  id: string;
  customerId: string;
  customerName?: string;
  items?: { name: string; quantity: number; price: number }[];
  clothes?: { type?: string; materialCost?: number; price?: number }[];
  totalAmount?: number;
  orderType?: 'STITCHING' | 'ALTERATION';
  alterationPrice?: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate?: string;
  serialNumber: number;
  assignedTo?: string;
  tailorName?: string;
  customer?: { name: string; mobileNumber: string };
}

const TailorAssignedOrders = () => {
  const navigation = useNavigation<TailorAssignedOrdersNavigationProp>();
  const route = useRoute<TailorAssignedOrdersRouteProp>();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { tailorId, tailorName } = route.params;

  const fetchAssignedOrders = async () => {
    if (!accessToken) return;
    
    setLoading(true);
    try {
      // 🚀 Use dedicated API method for assigned orders
      const assignedOrders = await apiService.getAssignedOrdersForTailor(tailorId) as AssignedOrder[];
      
      console.log(`[TailorAssignedOrders] Found ${assignedOrders.length} assigned orders for tailor ${tailorId}`);
      setOrders(assignedOrders);
    } catch (error) {
      console.error('Failed to fetch assigned orders:', error);
      Alert.alert('Error', 'Failed to load assigned orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignedOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, [accessToken, tailorId]);

  useFocusEffect(
    React.useCallback(() => {
      fetchAssignedOrders();
    }, [accessToken, tailorId])
  );

  const getDisplayTotal = (order: AssignedOrder): number => {
    // For alteration orders, use alterationPrice
    if (order.orderType === 'ALTERATION' && typeof order.alterationPrice === 'number') {
      return order.alterationPrice;
    }
    
    // Use totalAmount if available
    if (typeof order.totalAmount === 'number' && order.totalAmount > 0) {
      return order.totalAmount;
    }
    
    // Calculate from items
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // Calculate from clothes
    if (order.clothes && order.clothes.length > 0) {
      return order.clothes.reduce((sum, cloth) => sum + (cloth.materialCost || cloth.price || 0), 0);
    }
    
    return 0;
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleCompleteOrder = async (orderId: string) => {
    Alert.alert(
      'Complete Order',
      'Mark this order as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            try {
              // Update order status to DELIVERED
              await apiService.updateOrderStatus(orderId, 'DELIVERED');
              
              Alert.alert('Success', 'Order marked as completed!');
              
              // Refresh the list to remove completed order
              await fetchAssignedOrders();
            } catch (error) {
              console.error('Failed to complete order:', error);
              Alert.alert('Error', 'Failed to complete order');
            }
          }
        }
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: AssignedOrder }) => {
    const total = getDisplayTotal(item);
    const displayItems = item.items || [];
    const displayClothes = item.clothes || [];
    
    return (
      <TouchableOpacity 
        style={styles.orderCard}
        onPress={() => {
          // Navigate to Orders stack -> OrderDetails
          (navigation as any).navigate('Orders', {
            screen: 'OrderDetails',
            params: { orderId: item.id }
          });
        }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#ffffff', '#f8fafc']}
          style={styles.orderCardGradient}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Icon name="receipt" size={20} color={colors.brand} />
              <TitleText style={styles.orderId}>
                Order #{item.serialNumber ? `ORD-${String(item.serialNumber).padStart(4, '0')}` : item.id.slice(-8)}
              </TitleText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <RegularText style={styles.statusText}>{getStatusText(item.status)}</RegularText>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.customerInfo}>
            <Icon name="person" size={16} color={colors.textSecondary} />
            <RegularText style={styles.customerName}>
              {item.customer?.name || 'Unknown Customer'}
            </RegularText>
          </View>

          {/* Order Items */}
          <View style={styles.itemsContainer}>
            {displayItems.map((item, index) => (
              <RegularText key={index} style={styles.itemText}>
                • {item.name} x {item.quantity} • ₹{item.price}
              </RegularText>
            ))}
            {displayClothes.map((cloth, index) => (
              <RegularText key={`cloth-${index}`} style={styles.itemText}>
                • {cloth.type || 'Cloth'} • ₹{cloth.materialCost || cloth.price || 0}
              </RegularText>
            ))}
          </View>

          {/* Dates */}
          <View style={styles.datesContainer}>
            <View style={styles.dateItem}>
              <Icon name="event" size={14} color={colors.textSecondary} />
              <RegularText style={styles.dateText}>
                Ordered: {new Date(item.createdAt).toLocaleDateString()}
              </RegularText>
            </View>
            {item.deliveryDate && (
              <View style={styles.dateItem}>
                <Icon name="local-shipping" size={14} color={colors.textSecondary} />
                <RegularText style={styles.dateText}>
                  Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
                </RegularText>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View style={styles.totalContainer}>
              <TitleText style={styles.totalAmount}>Total: ₹{total.toFixed(2)}</TitleText>
            </View>
            
            {/* Complete Button */}
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteOrder(item.id)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10B981', '#059669', '#047857']}
                style={styles.completeButtonGradient}
              >
                <Icon name="check-circle" size={18} color="#fff" />
                <RegularText style={styles.completeButtonText}>Complete</RegularText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <TitleText style={styles.headerTitle}>Assigned Orders</TitleText>
          <RegularText style={styles.headerSubtitle}>{tailorName}</RegularText>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={64} color={colors.textMuted} />
            <TitleText style={styles.emptyTitle}>No Assigned Orders</TitleText>
            <RegularText style={styles.emptyText}>
              This tailor doesn't have any assigned orders yet.
            </RegularText>
          </View>
        }
      />
    </View>
  );
};


export default TailorAssignedOrders;
