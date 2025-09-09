import React from 'react';
import { View, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { RegularText } from '../CustomText';
import { styles } from '../../screens/Order/styles/OutfitSelectionScreenStyles';

interface CustomerInfoCardProps {
  customerName?: string;
  customerCode?: string;
  customerNameInput: string;
  setCustomerNameInput: (name: string) => void;
}

export const CustomerInfoCard: React.FC<CustomerInfoCardProps> = ({
  customerName,
  customerCode,
  customerNameInput,
  setCustomerNameInput,
}) => {
  const { t } = useTranslation();

  if (customerName) {
    // Pre-filled customer info (from CustomerList)
    return (
      <View style={styles.customerInfoCard}>
        <View style={styles.customerAvatar}>
          <RegularText style={styles.customerInitials}>
            {customerName.charAt(0).toUpperCase()}
          </RegularText>
        </View>
        <View style={styles.customerDetails}>
          <RegularText style={styles.customerNameText}>{customerName}</RegularText>
          {!!customerCode && (
            <RegularText style={styles.customerPhone}>{customerCode}</RegularText>
          )}
        </View>
      </View>
    );
  }

  // Blank input for customer name (from OrderList)
  return (
    <View style={styles.customerInfoCard}>
      <View style={styles.customerAvatar}>
        <Icon name="person" size={24} color="#fff" />
      </View>
      <View style={styles.customerDetails}>
        <RegularText style={styles.customerNameLabel}>{t('order.customerName')}</RegularText>
        <TextInput
          style={styles.customerNameInput}
          placeholder={t('order.enterCustomerName')}
          placeholderTextColor="#9ca3af"
          value={customerNameInput}
          onChangeText={setCustomerNameInput}
        />
      </View>
    </View>
  );
};

export default CustomerInfoCard;

