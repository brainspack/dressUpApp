import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from '../../types/order';
import { RegularText, TitleText } from '../CustomText';
import colors from '../../constants/colors';
import { styles } from '../../screens/Order/styles/AddOrderStyles';

interface StatusDropdownProps {
  visible: boolean;
  currentStatus: OrderStatus;
  onClose: () => void;
  onStatusSelect: (status: OrderStatus) => void;
}

export const StatusDropdown: React.FC<StatusDropdownProps> = ({
  visible,
  currentStatus,
  onClose,
  onStatusSelect,
}) => {
  const { t } = useTranslation();

  const statusOptions = [
    { label: t('order.pending'), value: 'pending' as OrderStatus },
    { label: t('order.inProgress'), value: 'in_progress' as OrderStatus },
    { label: t('order.delivered'), value: 'delivered' as OrderStatus },
    { label: t('order.cancelled'), value: 'cancelled' as OrderStatus },
  ];

  if (!visible) return null;

  return (
    <View style={[styles.modalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }]}> 
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      <View style={styles.statusModalContainer}>
        <View style={styles.statusModalContent}>
          {/* Modal Header */}
          <View style={styles.dropdownHeader}>
            <TitleText style={styles.dropdownTitle}>{t('order.selectOption')}</TitleText>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          {/* Status Options */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={styles.statusOption}
                onPress={() => {
                  onStatusSelect(status.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.statusOptionText,
                  currentStatus === status.value && styles.selectedStatusText
                ]}>
                  {status.label}
                </Text>
                {currentStatus === status.value && (
                  <Icon name="check" size={20} color={colors.brand} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default StatusDropdown;

