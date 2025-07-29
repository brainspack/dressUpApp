import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import Button from '../../components/Button';
// import * as SMS from 'expo-sms';
import { Order, OrderStatus } from '../../types/order';

type OrderDetailsScreenNavigationProp = NativeStackNavigationProp<OrderStackParamList, 'OrderDetails'>;
type OrderDetailsScreenRouteProp = RouteProp<OrderStackParamList, 'OrderDetails'>;

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

const OrderDetails = () => {
  const navigation = useNavigation<OrderDetailsScreenNavigationProp>();
  const route = useRoute<OrderDetailsScreenRouteProp>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const data = {
        id: '1',
        customer: {
          id: '1',
          name: 'John Doe',
          phone: '1234567890',
          email: 'john@example.com'
        },
        items: [],
        status: 'ready' as OrderStatus,
        timeline: [],
        notes: 'Test order',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setOrder(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${order?.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      sendStatusUpdateSMS(newStatus);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const sendStatusUpdateSMS = async (status: OrderStatus) => {
    if (!order?.customer?.phone) return;

    const statusMessages: Record<OrderStatus, string> = {
      pending: 'Your order has been received and is pending processing.',
      in_progress: 'Your order is now being processed.',
      ready: 'Your order has been completed and is ready for delivery.',
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
    switch (status) {
      case 'pending':
        return '#f57c00';
      case 'in_progress':
        return '#1976d2';
      case 'ready':
        return '#2e7d32';
      case 'delivered':
        return '#059669';
      case 'cancelled':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  const formatStatus = (status: OrderStatus) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateTotal = (items: Order['items']): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCreateOrder = () => {
    navigation.navigate('AddOrder');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>Order not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{formatStatus(order.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.text}>Name: {order.customer.name}</Text>
        <Text style={styles.text}>Phone: {order.customer.phone}</Text>
        <Text style={styles.text}>Email: {order.customer.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              {item.quantity} x ${item.price.toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>
            ${calculateTotal(order.items).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Timeline</Text>
        {order.timeline?.map((event, index) => (
          <View key={index} style={styles.timelineEvent}>
            <Text style={styles.timelineDate}>{event.date}</Text>
            <Text style={styles.timelineText}>{event.event}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notes}>{order.notes}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => updateOrderStatus('in_progress')}
        >
          <Text style={styles.buttonText}>Start Processing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={() => updateOrderStatus('ready')}
        >
          <Text style={styles.buttonText}>Mark as Ready</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => updateOrderStatus('cancelled')}
        >
          <Text style={styles.buttonText}>Cancel Order</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createOrderButton}
        onPress={handleCreateOrder}
      >
        <Text style={styles.createOrderButtonText}>Create New Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemDetails: {
    fontSize: 16,
    color: '#666',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineEvent: {
    marginBottom: 12,
  },
  timelineDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timelineText: {
    fontSize: 16,
  },
  notes: {
    fontSize: 16,
    color: '#666',
  },
  actionButtons: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    minWidth: '30%',
  },
  updateButton: {
    backgroundColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  createOrderButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetails; 