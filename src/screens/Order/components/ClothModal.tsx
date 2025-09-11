import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RegularText, TitleText } from '../../../components/CustomText';
import Button from '../../../components/Button';
import { styles } from '../styles/AddOrderStyles';
import { handleClothImageUpload, removeClothImage } from '../utils/imageUploadUtils';
import apiService from '../../../services/api';

interface ClothModalProps {
  isVisible: boolean;
  currentCloth: any;
  setCurrentCloth: (fn: (prev: any) => any) => void;
  clothImages: (string | { url: string; fileKey: string; originalUrl?: string })[];
  setClothImages: (fn: (prev: (string | { url: string; fileKey: string; originalUrl?: string })[]) => (string | { url: string; fileKey: string; originalUrl?: string })[]) => void;
  onClose: () => void;
  onSave: () => void;
}

export const ClothModal: React.FC<ClothModalProps> = ({
  isVisible,
  currentCloth,
  setCurrentCloth,
  clothImages,
  setClothImages,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  // Debug logging
  console.log('[ClothModal] Render state:', {
    clothImages: clothImages,
    currentClothImageUrls: currentCloth.imageUrls,
    clothImagesLength: clothImages.length,
    currentClothImageUrlsLength: currentCloth.imageUrls.length
  });

  if (!isVisible) return null;

  const handleImageUpload = () => {
    handleClothImageUpload(setClothImages, setCurrentCloth);
  };

  const handleRemoveImage = (index: number) => {
    removeClothImage(index, setClothImages, setCurrentCloth);
  };

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
              onChangeText={(text) => {
                console.log('🚀 Color field changed:', text);
                setCurrentCloth({ ...currentCloth, color: text });
              }}
              placeholder={t('order.enterColor')}
            />
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.fabric')}</RegularText>
            <TextInput
              style={styles.input}
              value={currentCloth.fabric}
              onChangeText={(text) => {
                console.log('🚀 Fabric field changed:', text);
                setCurrentCloth({ ...currentCloth, fabric: text });
              }}
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
            <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
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
            {(clothImages.length > 0 || currentCloth.imageUrls.length > 0) && (
              <View style={styles.uploadedImagesContainer}>
                <RegularText style={styles.uploadedImagesLabel}>
                  📷 Images ({clothImages.length > 0 ? clothImages.length : currentCloth.imageUrls.length})
                </RegularText>
                
                {/* Debug info */}
                <RegularText style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                  Debug: clothImages={clothImages.length}, currentCloth.imageUrls={currentCloth.imageUrls.length}
                </RegularText>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
                  {(clothImages.length > 0 ? clothImages : currentCloth.imageUrls).map((imageData: any, index: number) => {
                    // Handle both old string format and new object format
                    const imageUri = typeof imageData === 'string' ? imageData : imageData.url;
                    
                    return (
                      <View key={index} style={styles.imageItem}>
                        <Image 
                          source={{ uri: imageUri }} 
                          style={styles.uploadedImage}
                          resizeMode="cover"
                          onError={(error) => {
                            console.log('🚨 Image load error:', error.nativeEvent.error);
                            console.log('🚨 Failed image URI:', imageUri);
                            console.log('🚨 Image data:', imageData);
                          }}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', imageUri);
                          }}
                        />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => handleRemoveImage(index)}
                        >
                          <Icon name="close" size={12} color="#ffffff" />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Buttons at Bottom */}
        <View style={styles.modalButtons}>
          <Button
            title={t('common.cancel')}
            variant="light"
            onPress={onClose}
            height={48}
            style={{ borderRadius: 12, flex: 1, marginRight: 6 }}
          />
          <Button
            title={t('order.save')}
            variant="gradient"
            onPress={onSave}
            height={48}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            style={{ borderRadius: 12, flex: 1, marginLeft: 6 }}
          />
        </View>
      </View>
    </View>
  );
};
