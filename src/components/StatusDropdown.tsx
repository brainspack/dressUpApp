import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { OrderStatus } from '../types/order';

interface StatusDropdownProps<T> {
  value: T;
  onChange: (status: T) => void;
  options: Array<{ label: string; value: T }>;
}

const StatusDropdown = <T extends OrderStatus | 'all'>({ value, onChange, options }: StatusDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: T) => {
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

  const formatStatus = (status: T) => {
    return String(status).split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { borderColor: getStatusColor(value) }]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.buttonText, { color: getStatusColor(value) }]}>
          {formatStatus(value)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.option,
                  value === option.value && styles.selectedOption,
                ]}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: getStatusColor(option.value) },
                    value === option.value && styles.selectedOptionText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedOption: {
    backgroundColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
});

export default StatusDropdown; 