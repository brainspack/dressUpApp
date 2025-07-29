import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Order, OrderStatus, OrderItem, TimelineEvent } from '../types/order';

type OrderDetailsParams = {
  OrderDetails: {
    order: Order;
  };
};

const OrderDetails = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OrderDetailsParams, 'OrderDetails'>>();
  const order = route.params.order;

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    // TODO: Implement status update logic
    console.log('Updating status to:', newStatus);
  };

  const calculateTotal = (items: OrderItem[]): number => {
    return items.reduce((sum: number, item: OrderItem) => sum + (item.price * item.quantity), 0);
  };

  const renderTimelineEvent = (event: TimelineEvent, index: number) => (
    <View key={index} style={styles.timelineEvent}>
      <Text style={styles.timelineDate}>{event.date}</Text>
      <Text style={styles.timelineText}>{event.event}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <Text style={[styles.status, styles[order.status]]}>
          {order.status.replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        <Text style={styles.text}>Name: {order.customer.name}</Text>
        <Text style={styles.text}>Phone: {order.customer.phone}</Text>
        <Text style={styles.text}>Email: {order.customer.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item: OrderItem) => (
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
        {order.timeline.map(renderTimelineEvent)}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <Text style={styles.notes}>{order.notes}</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={() => handleStatusUpdate('in_progress')}
        >
          <Text style={styles.buttonText}>Start Processing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={() => handleStatusUpdate('ready')}
        >
          <Text style={styles.buttonText}>Mark as Ready</Text>
        </TouchableOpacity>
      </View>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  pending: {
    color: '#f59e0b',
  },
  in_progress: {
    color: '#3b82f6',
  },
  ready: {
    color: '#10b981',
  },
  delivered: {
    color: '#059669',
  },
  cancelled: {
    color: '#ef4444',
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
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  updateButton: {
    backgroundColor: '#3b82f6',
  },
  completeButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetails; 