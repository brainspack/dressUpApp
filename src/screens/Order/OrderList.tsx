import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import Button from '../../components/Button';
import StatusDropdown from '../../components/StatusDropdown';
// import LanguageSelector from '../../components/LanguageSelector';
import { OrderStatus } from '../../types/order';
import { useTranslation } from 'react-i18next';

type OrderListScreenNavigationProp = NativeStackNavigationProp<OrderStackParamList, 'OrderList'>;

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryDate?: string;
}

const OrderList = () => {
  const navigation = useNavigation<OrderListScreenNavigationProp>();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'ready':
        return '#10b981';
      case 'delivered':
        return '#059669';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus);

  const statusOptions = [
    { label: t('status.all_orders'), value: 'all' as OrderStatus | 'all' },
    { label: t('status.pending'), value: 'pending' as OrderStatus },
    { label: t('status.in_progress'), value: 'in_progress' as OrderStatus },
    { label: t('status.ready'), value: 'ready' as OrderStatus },
    { label: t('status.delivered'), value: 'delivered' as OrderStatus },
    { label: t('status.cancelled'), value: 'cancelled' as OrderStatus },
  ];

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{t('order.order')} #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {t(`status.${item.status}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.customerName}>{item.customerName}</Text>
      <Text style={styles.orderDate}>
        {t('order.ordered')}: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      {item.deliveryDate && (
        <Text style={styles.deliveryDate}>
          {t('order.delivery')}: {new Date(item.deliveryDate).toLocaleDateString()}
        </Text>
      )}
      <Text style={styles.totalAmount}>{t('order.total')}: ₹{item.totalAmount}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={t('order.create_new_order')}
          onPress={() => navigation.navigate('AddOrder')}
          variant="primary"
          style={styles.addButton}
        />
        {/* LanguageSelector removed from here */}
      </View>

      <View style={styles.filterContainer}>
        <StatusDropdown
          value={selectedStatus}
          onChange={(status) => setSelectedStatus(status)}
          options={statusOptions}
        />
      </View>

      {loading ? (
        <Text style={styles.loading}>{t('common.loading')}</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('common.no_data')}</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  addButton: {
    flex: 1,
    marginRight: 8,
  },
  filterContainer: {
    padding: 16,
  },
  list: {
    padding: 16,
  },
  orderItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  deliveryDate: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
    marginTop: 8,
  },
  loading: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});

export default OrderList; 