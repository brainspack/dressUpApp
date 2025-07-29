import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from '../../types/order';
import StatusDropdown from '../../components/StatusDropdown';
import Button from '../../components/Button';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes: string;
}

const AddOrder = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customer: '',
    items: [] as OrderItem[],
    status: 'pending' as OrderStatus,
    notes: '',
  });
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    id: '',
    name: '',
    quantity: 1,
    price: 0,
    notes: '',
  });

  const statusOptions = [
    { label: t('status.pending'), value: 'pending' as OrderStatus },
    { label: t('status.in_progress'), value: 'in_progress' as OrderStatus },
    { label: t('status.ready'), value: 'ready' as OrderStatus },
    { label: t('status.delivered'), value: 'delivered' as OrderStatus },
    { label: t('status.cancelled'), value: 'cancelled' as OrderStatus },
  ];

  const handleAddItem = () => {
    if (currentItem.name.trim() === '') return;
    
    const newItem = {
      ...currentItem,
      id: Date.now().toString(),
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    
    setCurrentItem({
      id: '',
      name: '',
      quantity: 1,
      price: 0,
      notes: '',
    });
    setIsItemModalVisible(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId),
    });
  };

  const handleSubmit = () => {
    // TODO: Implement order submission logic
    console.log('Order submitted:', formData);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('order.customerName')}</Text>
          <TextInput
            style={styles.input}
            value={formData.customer}
            onChangeText={(text) => setFormData({ ...formData, customer: text })}
            placeholder={t('order.customerName')}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('order.items')}</Text>
          {formData.items.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {t('order.quantity')}: {item.quantity} | {t('order.price')}: ₹{item.price.toFixed(2)}
                </Text>
                {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.id)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addItemButton}
            onPress={() => setIsItemModalVisible(true)}
          >
            <Text style={styles.addItemButtonText}>{t('order.add_item')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('order.status')}</Text>
          <StatusDropdown
            value={formData.status}
            onChange={(status) => setFormData({ ...formData, status })}
            options={statusOptions}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('order.notes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder={t('order.notes')}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button
          title={{ key: 'order.create_new_order' }}
          onPress={handleSubmit}
          variant="primary"
        />
      </View>

      <Modal
        visible={isItemModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsItemModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('order.add_item')}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('order.itemDetails')}</Text>
              <TextInput
                style={styles.input}
                value={currentItem.name}
                onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
                placeholder={t('order.itemDetails')}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('order.quantity')}</Text>
              <TextInput
                style={styles.input}
                value={currentItem.quantity.toString()}
                onChangeText={(text) => setCurrentItem({ ...currentItem, quantity: parseInt(text) || 1 })}
                placeholder={t('order.quantity')}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('order.price')}</Text>
              <TextInput
                style={styles.input}
                value={currentItem.price.toString()}
                onChangeText={(text) => setCurrentItem({ ...currentItem, price: parseFloat(text) || 0 })}
                placeholder={t('order.price')}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('order.notes')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentItem.notes}
                onChangeText={(text) => setCurrentItem({ ...currentItem, notes: text })}
                placeholder={t('order.notes')}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsItemModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.addButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  itemNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  addItemButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3b82f6',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddOrder; 