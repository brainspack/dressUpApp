import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
  placeholder?: string;
  mode?: 'date' | 'time' | 'datetime';
}

const DatePicker = ({ 
  label, 
  value, 
  onChange, 
  error, 
  placeholder = 'Select date',
  mode = 'date'
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    if (mode === 'time') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (mode === 'datetime') {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    setIsOpen(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.picker, error && styles.pickerError]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[styles.pickerText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {isOpen && (
        Platform.OS === 'ios' ? (
          <Modal
            visible={isOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setIsOpen(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Text style={styles.doneButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={value || new Date()}
                  mode={mode}
                  display="spinner"
                  onChange={handleChange}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value || new Date()}
            mode={mode}
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  pickerError: {
    borderColor: '#ff3b30',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  doneButton: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DatePicker; 