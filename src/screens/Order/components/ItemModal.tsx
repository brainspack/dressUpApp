import React from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
// import LinearGradient from 'react-native-linear-gradient';
import { RegularText, TitleText } from '../../../components/CustomText';
import { OrderFormItem } from '../types/orderTypes';
import { styles } from '../styles/AddOrderStyles';
import Button from '../../../components/Button';

interface ItemModalProps {
  isVisible: boolean;
  currentItem: OrderFormItem;
  setCurrentItem: (item: OrderFormItem) => void;
  onClose: () => void;
  onSave: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isVisible,
  currentItem,
  setCurrentItem,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  return (
    <View style={[styles.clothModalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
      <View style={styles.clothModalContent}>
        <TitleText style={styles.modalTitle}>{t('order.add_item')}</TitleText>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.clothModalScroll}
          contentContainerStyle={styles.clothModalScrollContent}
        >
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.itemDetails')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentItem.name}
              onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
              placeholder={t('order.enterItemDetails')}
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.quantity')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentItem.quantity}
              onChangeText={(text) => setCurrentItem({ ...currentItem, quantity: text.replace(/[^0-9]/g, '') })}
              placeholder={t('order.enterQuantity')}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.price')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentItem.price}
              onChangeText={(text) => setCurrentItem({ ...currentItem, price: text.replace(/[^0-9.]/g, '') })}
              placeholder={t('order.enterPrice')}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.notes')}</RegularText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentItem.notes}
              onChangeText={(text) => setCurrentItem({ ...currentItem, notes: text })}
              placeholder={t('order.enterNotes')}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.modalButtons}>
          <Button
            title={t('common.cancel')}
            variant="light"
            onPress={onClose}
            height={48}
            style={{ borderRadius: 12, width: '48%', backgroundColor: '#FFFFFF', elevation: 0, shadowOpacity: 0 }}
          />
          <Button
            title={t('order.save')}
            variant="gradient"
            onPress={onSave}
            height={48}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            style={{ borderRadius: 12, width: '48%' }}
          />
        </View>
      </View>
    </View>
  );
};
