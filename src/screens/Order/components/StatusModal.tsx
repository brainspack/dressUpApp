import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TitleText } from '../../../components/CustomText';
import colors from '../../../constants/colors';
import { styles } from '../styles/AddOrderStyles';
import { statusOptions } from '../constants/orderConstants';
import { OrderStatus } from '../../../types/order';

interface StatusModalProps {
  isVisible: boolean;
  currentStatus: OrderStatus;
  onClose: () => void;
  onSelect: (status: OrderStatus) => void;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  isVisible,
  currentStatus,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

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
            {statusOptions(t).map((status) => (
              <TouchableOpacity
                key={status.value}
                style={styles.statusOption}
                onPress={() => {
                  onSelect(status.value);
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
