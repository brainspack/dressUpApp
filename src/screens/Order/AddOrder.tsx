import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, Platform, Modal } from 'react-native';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import LinearGradient from 'react-native-linear-gradient';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { OrderStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import { styles } from './styles/AddOrderStyles';
import { OrderStatus } from '../../types/order';

// Import extracted components and utilities
import { ItemModal, ClothModal, MeasurementModal, StatusModal } from './components';
import { useOrderForm } from './hooks/useOrderForm';
import { useShopId } from './hooks/useShopId';
import { useOrderHandlers } from './handlers/orderHandlers';
import { getRequiredMeasurements } from './utils/measurementUtils';
import { orderTypes } from './constants/orderConstants';


const AddOrder = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OrderStackParamList, 'AddOrder'>>();
  const { t } = useTranslation();
  
  // Use custom hooks for state management
  const {
    formData,
    setFormData,
    currentItem,
    setCurrentItem,
    currentCloth,
    setCurrentCloth,
    currentMeasurement,
    setCurrentMeasurement,
    customerName,
    setCustomerName,
    clothImages,
    setClothImages,
  } = useOrderForm();

  const { resolvedShopId } = useShopId();

  // Modal states
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isClothModalVisible, setIsClothModalVisible] = useState(false);
  const [isMeasurementModalVisible, setIsMeasurementModalVisible] = useState(false);
  const [isStatusDropdownVisible, setIsStatusDropdownVisible] = useState(false);
  
  // Date picker states
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [showTrialDatePicker, setShowTrialDatePicker] = useState(false);
  const [deliveryDateObj, setDeliveryDateObj] = useState<Date>(new Date());
  const [trialDateObj, setTrialDateObj] = useState<Date>(new Date());
  
  // Get current required measurements
  const requiredMeasurements = getRequiredMeasurements(
    route.params?.outfitType || 'unknown',
    route.params?.gender || 'unknown'
  );

  // Use order handlers
  const {
    handleAddItem,
    handleAddCloth,
    handleAddMeasurement,
    handleRemoveItem,
    handleSaveAndBack,
    handleSubmit,
  } = useOrderHandlers(
    formData,
    setFormData,
    currentItem,
    setCurrentItem,
    currentCloth,
    setCurrentCloth,
    currentMeasurement,
    setCurrentMeasurement,
    // Cast union list to broader any[] to satisfy handler typing while we
    // support both string URLs and object metadata for images
    clothImages as any[],
    setClothImages as any,
    resolvedShopId,
    customerName,
    route
  );

  // DatePicker handlers
  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    // On Android the picker closes automatically; on iOS we keep it open in modal until Done
    if (Platform.OS === 'android') setShowDeliveryDatePicker(false);
    if (selectedDate) {
      setDeliveryDateObj(selectedDate);
      setFormData({ ...formData, deliveryDate: selectedDate.toLocaleDateString() });
    }
  };

  const handleTrialDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTrialDatePicker(false);
    if (selectedDate) {
      setTrialDateObj(selectedDate);
      setFormData({ ...formData, trialDate: selectedDate.toLocaleDateString() });
    }
  };

  // Modal handlers
  const handleItemModalSave = () => {
    handleAddItem();
    setIsItemModalVisible(false);
  };

  const handleClothModalSave = () => {
    handleAddCloth();
    setIsClothModalVisible(false);
  };

  const handleMeasurementModalSave = () => {
    handleAddMeasurement();
    setIsMeasurementModalVisible(false);
  };

  return (
    <View style={styles.container}>
     
      
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.customerName')}</RegularText>
            <TextInput
              style={[styles.input, {paddingVertical: 12, color: colors.textPrimary}]}
              placeholder={t('order.enterCustomerName')}
              placeholderTextColor={colors.textMuted}
              value={customerName}
              onChangeText={setCustomerName}
              editable={true}
            />
          </View>

          {/* Order Type Selection */}
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>Type</RegularText>
            <View style={styles.orderTypeOptions}>
              <TouchableOpacity 
                style={[
                  styles.orderTypeOption, 
                  formData.orderType === 'stitching' && styles.selectedOrderType
                ]}
                onPress={() => setFormData({...formData, orderType: 'stitching'})}
              >
                <View style={[
                  styles.radioButton, 
                  formData.orderType === 'stitching' && styles.selectedRadioButton
                ]} />
                <RegularText style={[
                  styles.orderTypeText,
                  formData.orderType === 'stitching' && styles.selectedOrderTypeText
                ]}>Stitching</RegularText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.orderTypeOption, 
                  formData.orderType === 'alteration' && styles.selectedOrderType
                ]}
                onPress={() => setFormData({...formData, orderType: 'alteration'})}
              >
                <View style={[
                  styles.radioButton, 
                  formData.orderType === 'alteration' && styles.selectedRadioButton
                ]} />
                <RegularText style={[
                  styles.orderTypeText,
                  formData.orderType === 'alteration' && styles.selectedOrderTypeText
                ]}>Alteration</RegularText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Action Cards - Show for both stitching and alteration orders */}
          <View style={styles.actionCardsContainer}>
              
              {/* Add Item Card - only for stitching orders */}
              {formData.orderType === 'stitching' && (
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => setIsItemModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardContent}>
                    <RegularText style={styles.cardTitle}>{t('order.add_item')}</RegularText>
                    <RegularText style={styles.cardSubtitle}>{t('order.addClothingItems')}</RegularText>
                  </View>
                  <View style={styles.cardActionButton}>
                    <View style={styles.cardActionButtonGradient}>
                      <Text style={styles.cardButtonText}>+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Add Cloth Card */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setIsClothModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <RegularText style={styles.cardTitle}>{t('order.add_cloth')}</RegularText>
                  <RegularText style={styles.cardSubtitle}>{t('order.addFabricDetails')}</RegularText>
                </View>
                <View style={styles.cardActionButton}>
                  <View style={styles.cardActionButtonGradient}>
                    <Text style={styles.cardButtonText}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Add Measurement Card */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setIsMeasurementModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <RegularText style={styles.cardTitle}>{t('order.add_measurement')}</RegularText>
                  <RegularText style={styles.cardSubtitle}>{t('order.addCustomerMeasurements')}</RegularText>
                </View>
                <View style={styles.cardActionButton}>
                  <View style={styles.cardActionButtonGradient}>
                    <Text style={styles.cardButtonText}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

          {/* Items Display Section - Only show for stitching orders */}
          {formData.orderType === 'stitching' && formData.items.length > 0 && (
            <View style={styles.formGroup}>
              <TitleText style={styles.sectionTitle}>{t('order.items')}</TitleText>
              {formData.items.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <RegularText style={styles.itemName}>{item.name}</RegularText>
                    <RegularText style={styles.itemDetails}>
                      {t('order.quantity')}: {item.quantity} | {t('order.price')}: ₹{item.price.toFixed(2)}
                    </RegularText>
                    {item.notes && <RegularText style={styles.itemNotes}>{item.notes}</RegularText>}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Clothes Display Section - Show for both order types */}
          {formData.clothes && formData.clothes.length > 0 && (
            <View style={styles.formGroup}>
              <TitleText style={styles.sectionTitle}>{t('order.add_cloth')}</TitleText>
              {formData.clothes.map((cloth, index) => (
                <View key={cloth.id} style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <RegularText style={styles.itemName}>{cloth.type}</RegularText>
                    <RegularText style={styles.itemDetails}>
                      {t('order.materialCost')}: ₹{cloth.materialCost}
                    </RegularText>
                    {cloth.color && <RegularText style={styles.itemDetails}>{t('order.color')}: {cloth.color}</RegularText>}
                    {cloth.fabric && <RegularText style={styles.itemDetails}>{t('order.fabric')}: {cloth.fabric}</RegularText>}
                    {cloth.designNotes && <RegularText style={styles.itemNotes}>{cloth.designNotes}</RegularText>}
                    
                    {/* Image Preview Section */}
                    {cloth.imageUrls && cloth.imageUrls.length > 0 && (
                      <View style={styles.imagePreviewContainer}>
                        <RegularText style={styles.imagePreviewLabel}>
                          📷 Images ({cloth.imageUrls.length})
                        </RegularText>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
                          {cloth.imageUrls.map((imageData: any, imgIndex: number) => {
                            // Handle both string URLs and object format
                            const imageUrl = typeof imageData === 'string' ? imageData : imageData.url || imageData.originalUrl || '';
                            
                            return (
                              <View key={imgIndex} style={styles.imagePreviewItem}>
                                <Image
                                  source={{ uri: imageUrl }}
                                  style={styles.imagePreview}
                                  onError={(error) => {
                                    console.log('Image load error:', error.nativeEvent.error);
                                    console.log('Failed image URL:', imageUrl);
                                  }}
                                  onLoad={() => {
                                    console.log('Image loaded successfully:', imageUrl);
                                  }}
                                />
                                {/* Remove image button */}
                                <TouchableOpacity
                                  style={styles.imageRemoveButton}
                                  onPress={() => {
                                    // Remove this specific image from the cloth
                                    setFormData(prev => ({
                                      ...prev,
                                      clothes: prev.clothes.map((c, cIndex) => 
                                        cIndex === index 
                                          ? { ...c, imageUrls: c.imageUrls.filter((_, i) => i !== imgIndex) }
                                          : c
                                      )
                                    }));
                                  }}
                                >
                                  <Text style={styles.imageRemoveButtonText}>×</Text>
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        clothes: prev.clothes.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* 🚀 HELPER MESSAGE for alteration orders when no clothes added */}
          {formData.orderType === 'alteration' && formData.clothes.length === 0 && (
            <View style={[styles.formGroup, { backgroundColor: '#e8f5e8', borderColor: '#229B73', borderWidth: 1, borderRadius: 8, padding: 12 }]}>
              <RegularText style={[styles.label, { color: '#229B73', textAlign: 'center' }]}>
                ℹ️ Please add at least one cloth item for alteration
              </RegularText>
              <RegularText style={[styles.itemDetails, { color: '#666', textAlign: 'center', marginTop: 4 }]}>
                Use "Add Cloth" button above to specify what needs to be altered
              </RegularText>
            </View>
          )}

          {/* Measurements Display Section - Show for both order types when available */}
          {Object.keys(formData.measurements).length > 0 && (
            <View style={styles.formGroup}>
              <TitleText style={styles.sectionTitle}>{t('order.measurements')}</TitleText>
              {Object.entries(formData.measurements).map(([id, measurement]) => (
                <View key={id} style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <View style={styles.measurementGrid}>
                      {Object.entries(measurement).map(([key, value]) => {
                        // Skip id field and check for valid values
                        if (key !== 'id' && value != null) {
                          // Map measurement keys to proper translation keys
                          const translationKey = key === 'sleeveLength' ? 'order.sleeveLength' :
                                               key === 'armhole' ? 'order.armhole' :
                                               key === 'knee' ? 'order.knee' :
                                               key === 'ankle' ? 'order.ankle' :
                                               `order.${key}`;
                          
                          return (
                            <RegularText key={key} style={styles.measurementItem}>
                              {t(translationKey)}: {value}
                            </RegularText>
                          );
                        }
                        return null;
                      })}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setFormData(prev => {
                        const { [id]: removed, ...rest } = prev.measurements;
                        return { ...prev, measurements: rest };
                      });
                    }}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.status')}</RegularText>
            <TouchableOpacity 
              style={styles.statusDropdown}
              onPress={() => {
                console.log('Status dropdown pressed, current state:', isStatusDropdownVisible);
                setIsStatusDropdownVisible(true);
                console.log('Set isStatusDropdownVisible to true');
              }}
            >
              <Text style={styles.statusText}>
                {formData.status === 'in_progress' ? t('order.inProgress') : 
                 formData.status === 'pending' ? t('order.pending') :
                 formData.status === 'delivered' ? t('order.delivered') :
                 formData.status === 'cancelled' ? t('order.cancelled') :
                 String(formData.status).charAt(0).toUpperCase() + String(formData.status).slice(1)}
              </Text>
              <Icon name="keyboard-arrow-down" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>



          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.notes')}</RegularText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder={t('order.notes')}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* 🚀 ALTERATION PRICE INPUT - Only show for alteration orders */}
          {formData.orderType === 'alteration' && (
            <View style={styles.formGroup}>
              <RegularText style={styles.label}>💰 Alteration Price</RegularText>
              <TextInput
                style={styles.input}
                value={formData.alterationPrice || ''}
                onChangeText={(text) => setFormData({ ...formData, alterationPrice: text })}
                placeholder="Enter alteration price (e.g., 500)"
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Show delivery and trial date for both stitching and alteration */}
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>Delivery Date</RegularText>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDeliveryDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.deliveryDate || 'Select delivery date'}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>Trial Date</RegularText>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTrialDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.trialDate || 'Select trial date'}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 🚀 SINGLE Price Breakdown Block (Only at bottom) */}
          <View style={styles.costBreakdownContainer}>
            <TitleText style={styles.costBreakdownTitle}>💰 Price Breakup</TitleText>
            
            {/* Items Cost */}
            {formData.items.length > 0 && (
              <View style={styles.costRow}>
                <RegularText style={styles.costLabel}>Items:</RegularText>
                <RegularText style={styles.costValue}>
                  {formData.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </RegularText>
              </View>
            )}
            
            {/* Clothes Cost */}
            {formData.clothes.length > 0 && (
              <View style={styles.costRow}>
                <RegularText style={styles.costLabel}>Clothes:</RegularText>
                <RegularText style={styles.costValue}>
                  ₹{formData.clothes.reduce((total, cloth) => total + cloth.materialCost, 0).toFixed(2)}
                </RegularText>
              </View>
            )}

            {/* 🚀 ALTERATION PRICE - Show only for alteration orders */}
            {formData.orderType === 'alteration' && formData.alterationPrice && (
              <View style={styles.costRow}>
                <RegularText style={styles.costLabel}>Alteration Price:</RegularText>
                <RegularText style={styles.costValue}>
                  ₹{parseFloat(formData.alterationPrice || '0').toFixed(2)}
                </RegularText>
              </View>
            )}
            
            {/* Total Cost with emphasis */}
            <View style={styles.totalCostRow}>
              <TitleText style={styles.totalCostLabel}>Total Amount:</TitleText>
              <TitleText style={styles.totalCostValue}>
                ₹{(
                  formData.items.reduce((total, item) => total + (item.price * item.quantity), 0) +
                  formData.clothes.reduce((total, cloth) => total + cloth.materialCost, 0) +
                  (formData.orderType === 'alteration' && formData.alterationPrice 
                    ? parseFloat(formData.alterationPrice) 
                    : 0)
                ).toFixed(2)}
              </TitleText>
            </View>
          </View>

          <Button
            title="Save Details"
            variant="gradient"
            onPress={handleSaveAndBack}
            height={52}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            style={{ borderRadius: 12, width: '100%' }}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <ItemModal
        isVisible={isItemModalVisible}
        currentItem={currentItem}
        setCurrentItem={setCurrentItem}
        onClose={() => setIsItemModalVisible(false)}
        onSave={handleItemModalSave}
      />

      <ClothModal
        isVisible={isClothModalVisible}
        currentCloth={currentCloth}
        setCurrentCloth={setCurrentCloth}
        clothImages={clothImages}
        setClothImages={setClothImages}
        onClose={() => setIsClothModalVisible(false)}
        onSave={handleClothModalSave}
      />

      <MeasurementModal
        isVisible={isMeasurementModalVisible}
        currentMeasurement={currentMeasurement}
        setCurrentMeasurement={setCurrentMeasurement}
        requiredMeasurements={requiredMeasurements}
        onClose={() => setIsMeasurementModalVisible(false)}
        onSave={handleMeasurementModalSave}
      />

      <StatusModal
        isVisible={isStatusDropdownVisible}
        currentStatus={formData.status as OrderStatus}
        onClose={() => setIsStatusDropdownVisible(false)}
        onSelect={(status) => setFormData({ ...formData, status })}
      />

      {/* Delivery Date Picker */}
      {showDeliveryDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <View style={{ backgroundColor: '#fff', paddingTop: 8, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 6 }}>
                  <TouchableOpacity onPress={() => setShowDeliveryDatePicker(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: '#ef4444', fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowDeliveryDatePicker(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: '#229B73', fontWeight: '700' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker value={deliveryDateObj} mode="date" display="spinner" onChange={handleDeliveryDateChange} />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker value={deliveryDateObj} mode="date" display="default" onChange={handleDeliveryDateChange} />
        )
      )}

      {/* Trial Date Picker */}
      {showTrialDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="fade" visible>
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' }}>
              <View style={{ backgroundColor: '#fff', paddingTop: 8, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 12, paddingBottom: 6 }}>
                  <TouchableOpacity onPress={() => setShowTrialDatePicker(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: '#ef4444', fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTrialDatePicker(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                    <Text style={{ color: '#229B73', fontWeight: '700' }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker value={trialDateObj} mode="date" display="spinner" onChange={handleTrialDateChange} />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker value={trialDateObj} mode="date" display="default" onChange={handleTrialDateChange} />
        )
      )}
    </View>
  );
};


export default AddOrder; 