import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { RegularText, TitleText } from '../CustomText';
import { measurementImages, measurementLabels } from '../../utils/measurementUtils';
import { styles } from '../../screens/Order/styles/AddOrderStyles';

// Interfaces
export interface OrderFormItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
  notes: string;
  color?: string;
  fabric?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface ClothFormData {
  id: string;
  type: string;
  color: string;
  fabric: string;
  materialCost: string;
  designNotes: string;
  imageUrls: string[];
  imageData: string[];
  videoUrls: string[];
}

export interface MeasurementFormData {
  id: string;
  height: string;
  chest: string;
  waist: string;
  hip: string;
  shoulder: string;
  sleeveLength: string;
  inseam: string;
  neck: string;
  armhole: string;
  bicep: string;
  wrist: string;
  outseam: string;
  thigh: string;
  knee: string;
  calf: string;
  ankle: string;
}

// Item Form Modal Component
interface ItemModalProps {
  visible: boolean;
  currentItem: OrderFormItem;
  setCurrentItem: (item: OrderFormItem) => void;
  onClose: () => void;
  onSave: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  visible,
  currentItem,
  setCurrentItem,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <View style={[styles.modalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
      <View style={styles.modalContent}>
        <TitleText style={styles.modalTitle}>{t('order.add_item')}</TitleText>
        
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

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <RegularText style={styles.cancelButtonText}>{t('common.cancel')}</RegularText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#229B73', '#1a8f6e', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>{t('order.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Cloth Form Modal Component
interface ClothModalProps {
  visible: boolean;
  currentCloth: ClothFormData;
  setCurrentCloth: (cloth: ClothFormData) => void;
  clothImages: string[];
  onClose: () => void;
  onSave: () => void;
  onImageUpload: () => void;
  onRemoveImage: (index: number) => void;
}

export const ClothModal: React.FC<ClothModalProps> = ({
  visible,
  currentCloth,
  setCurrentCloth,
  clothImages,
  onClose,
  onSave,
  onImageUpload,
  onRemoveImage,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <View style={[styles.clothModalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
      <View style={styles.clothModalContent}>
        <TitleText style={styles.modalTitle}>{t('order.add_cloth')}</TitleText>
        
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.clothModalScroll}
          contentContainerStyle={styles.clothModalScrollContent}
        >
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.clothType')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentCloth.type}
              onChangeText={(text) => setCurrentCloth({ ...currentCloth, type: text })}
              placeholder={t('order.enterClothType')}
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.color')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentCloth.color}
              onChangeText={(text) => setCurrentCloth({ ...currentCloth, color: text })}
              placeholder={t('order.enterColor')}
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.fabric')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentCloth.fabric}
              onChangeText={(text) => setCurrentCloth({ ...currentCloth, fabric: text })}
              placeholder={t('order.enterFabric')}
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.materialCost')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentCloth.materialCost}
              onChangeText={(text) => setCurrentCloth({ ...currentCloth, materialCost: text.replace(/[^0-9.]/g, '') })}
              placeholder={t('order.enterMaterialCost')}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.designNotes')}</RegularText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentCloth.designNotes}
              onChangeText={(text) => setCurrentCloth({ ...currentCloth, designNotes: text })}
              placeholder={t('order.enterDesignNotes')}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Image Upload Section */}
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>📸 Upload Cloth Images</RegularText>
            <TouchableOpacity style={styles.imageUploadButton} onPress={onImageUpload}>
              <LinearGradient
                colors={['#229B73', '#1a8f6e', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.imageUploadGradient}
              >
                <View style={styles.compactImageUploadContent}>
                  <Icon name="add-a-photo" size={20} color="#ffffff" />
                  <RegularText style={styles.compactImageUploadText}>Add Photos</RegularText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Display uploaded images */}
            {clothImages.length > 0 && (
              <View style={styles.uploadedImagesContainer}>
                <RegularText style={styles.uploadedImagesLabel}>📷 Images ({clothImages.length})</RegularText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
                  {clothImages.map((imageUri, index) => (
                    <View key={index} style={styles.imageItem}>
                      <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                      <TouchableOpacity 
                        style={styles.removeImageButton}
                        onPress={() => onRemoveImage(index)}
                      >
                        <Icon name="close" size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Buttons at Bottom */}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <RegularText style={styles.cancelButtonText}>{t('common.cancel')}</RegularText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#229B73', '#1a8f6e', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>{t('order.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Measurement Form Modal Component
interface MeasurementModalProps {
  visible: boolean;
  currentMeasurement: MeasurementFormData;
  setCurrentMeasurement: (measurement: MeasurementFormData) => void;
  selectedMeasurementField: string;
  setSelectedMeasurementField: (field: string) => void;
  requiredMeasurements: string[];
  onClose: () => void;
  onSave: () => void;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  visible,
  currentMeasurement,
  setCurrentMeasurement,
  selectedMeasurementField,
  setSelectedMeasurementField,
  requiredMeasurements,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <View style={[styles.measurementModalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
      <View style={styles.measurementModalContent}>
        {/* Fixed Header and Image Section */}
        <TitleText style={styles.modalTitle}>{t('order.recordMeasurement')}</TitleText>
        
        {/* Body Diagram Section */}
        <View style={styles.bodyDiagramContainer}>
          <Image
            source={measurementImages[selectedMeasurementField] || measurementImages.chest}
            style={styles.bodyDiagram}
            resizeMode="contain"
          />
        </View>

        {/* Scrollable Measurement Inputs */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollableFields}
          contentContainerStyle={styles.scrollableFieldsContent}
        >
          <View style={styles.measurementInputsContainer}>
            {(() => {
              const rows: React.ReactNode[] = [];
              const addField = (key: string, labelKey: string) => (
                <View style={styles.measurementField} key={key}>
                  <RegularText style={styles.measurementLabel}>{t(labelKey)}</RegularText>
                  <TextInput
                    style={styles.measurementInput}
                    value={(currentMeasurement as any)[key]}
                    onChangeText={(text) => setCurrentMeasurement({ ...(currentMeasurement as any), [key]: text } as any)}
                    placeholder="0.0"
                    keyboardType="numeric"
                    onFocus={() => setSelectedMeasurementField(key)}
                  />
                </View>
              );
              
              const visible = requiredMeasurements;
              for (let i = 0; i < visible.length; i += 2) {
                const left = visible[i];
                const right = visible[i + 1];
                rows.push(
                  <View style={styles.measurementRow} key={`row-${i}`}>
                    {addField(left, measurementLabels[left] || `order.${left}`)}
                    {right ? addField(right, measurementLabels[right] || `order.${right}`) : <View style={styles.measurementField} />}
                  </View>
                );
              }
              return rows;
            })()}
          </View>
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <RegularText style={styles.cancelButtonText}>{t('common.cancel')}</RegularText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#229B73', '#1a8f6e', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>{t('order.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

