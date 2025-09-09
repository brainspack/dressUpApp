import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RegularText } from '../CustomText';
import colors from '../../constants/colors';
import { styles } from '../../screens/Order/styles/AddOrderStyles';

interface DatePickerProps {
  label: string;
  value: string;
  onPress: () => void;
  showPicker: boolean;
  dateValue: Date;
  onDateChange: (event: any, selectedDate?: Date) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onPress,
  showPicker,
  dateValue,
  onDateChange,
}) => {
  return (
    <View style={styles.formGroup}>
      <RegularText style={styles.label}>{label}</RegularText>
      <TouchableOpacity 
        style={styles.datePickerButton}
        onPress={onPress}
      >
        <Text style={styles.datePickerText}>
          {value || 'Select date'}
        </Text>
        <Icon name="calendar-today" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      
      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

export default DatePicker;

