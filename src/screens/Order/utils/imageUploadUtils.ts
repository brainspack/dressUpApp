import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiService from '../../../services/api';

export const handleClothImageUpload = async (
  setClothImages: (fn: (prev: (string | { url: string; fileKey: string; originalUrl?: string })[]) => (string | { url: string; fileKey: string; originalUrl?: string })[]) => void,
  setCurrentCloth: (fn: (prev: any) => any) => void,
  showToast?: (msg: string, type?: 'success'|'error'|'warning'|'info') => void,
  clothType?: string
) => {
  try {
    console.log('[AddOrder] Starting S3 image upload...');
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: false,
    });

    console.log('[AddOrder] Image picker result:', {
      didCancel: result.didCancel,
      assets: result.assets?.length || 0,
      errorMessage: result.errorMessage
    });

    if (!result.didCancel && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('[AddOrder] Selected image asset:', {
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type
      });

      if (!asset.uri || !asset.fileName || !asset.type) {
        console.error('[AddOrder] Missing required image data');
        Alert.alert('Error', 'Invalid image data. Please try again.');
        return;
      }

      try {
        // 1. Upload directly to backend using the new order image upload method
        console.log('[AddOrder] Starting order image upload...');
        const uploadResponse = await apiService.uploadOrderImage(asset.uri, asset.fileName, asset.type);
        
        if (!uploadResponse.success) {
          throw new Error(uploadResponse.error || 'Failed to upload order image');
        }

        console.log('[AddOrder] Order image upload successful!');
        console.log('[AddOrder] Upload response:', uploadResponse);

        // 2. Store image data using the S3 signed URL directly
        const s3Url = uploadResponse.s3Url;
        const fileKey = uploadResponse.fileKey;
        const signedUrl = (uploadResponse as any).signedUrl || uploadResponse.orderImageUrl;
        
        if (fileKey) {
          // Prefer short-lived signed URL for immediate display; fallback to s3Url
          const displayUrl = signedUrl || s3Url;
          console.log('[AddOrder] Storing image data in state:', { s3Url, fileKey, displayUrl });
          const imageData = {
            url: displayUrl,
            fileKey: fileKey,
            originalUrl: s3Url,
            s3Url: s3Url
          };
          
          // Update both state variables to ensure synchronization
          setClothImages(prev => {
            const exists = prev.some((img: any) => (img.fileKey || img.url) === (imageData.fileKey || imageData.url));
            const newImages = exists ? prev : [...prev, imageData];
            console.log('[AddOrder] Updated clothImages (deduped):', newImages);
            return newImages;
          });
          
          setCurrentCloth(prev => {
            const exists = (prev.imageUrls || []).some((img: any) => (img.fileKey || img.url) === (imageData.fileKey || imageData.url));
            const updatedCloth = {
              ...prev,
              imageUrls: exists ? prev.imageUrls : [...prev.imageUrls, imageData]
            };
            console.log('[AddOrder] Updated currentCloth.imageUrls (deduped):', updatedCloth.imageUrls);
            return updatedCloth;
          });

          // Save uploaded images to AsyncStorage for OrderSummary to retrieve
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const keyType = (clothType && clothType.trim() !== '') ? clothType : 'unknown';
            const currentImages = await AsyncStorage.getItem(`uploadedImages_${keyType}`);
            const existingImages = currentImages ? JSON.parse(currentImages) : [];
            const updatedImages = [...existingImages, imageData];
            await AsyncStorage.setItem(`uploadedImages_${keyType}`, JSON.stringify(updatedImages));
            console.log('[AddOrder] Saved images to AsyncStorage for type:', keyType);
          } catch (storageError) {
            console.error('[AddOrder] Error saving images to AsyncStorage:', storageError);
          }
        }

        if (showToast) {
          showToast('Image uploaded successfully!', 'success');
        } else {
          Alert.alert('Success', 'Image uploaded successfully!');
        }
        
      } catch (uploadError: any) {
        console.error('[AddOrder] Order image upload error:', uploadError);
        
        let errorMessage = 'Failed to upload image. Please try again.';
        
        if (uploadError.message && uploadError.message.includes('Network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (uploadError.message && uploadError.message.includes('timeout')) {
          errorMessage = 'Upload timeout. Please try again with a smaller image.';
        }
        
        Alert.alert('Upload Error', errorMessage);
      }
    }
  } catch (error) {
    console.error('[AddOrder] Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
  }
};

export const handleImageUploadSuccess = (showToast: (msg: string, type?: 'success'|'error'|'warning'|'info') => void) => {
  try {
    showToast('Image uploaded successfully!', 'success');
  } catch {}
};

export const removeClothImage = (
  index: number,
  setClothImages: (fn: (prev: (string | { url: string; fileKey: string; originalUrl?: string })[]) => (string | { url: string; fileKey: string; originalUrl?: string })[]) => void,
  setCurrentCloth: (fn: (prev: any) => any) => void
) => {
  console.log('[AddOrder] Removing image at index:', index);
  
  setClothImages(prev => {
    const newImages = prev.filter((_: any, i: number) => i !== index);
    console.log('[AddOrder] Updated clothImages after removal:', newImages);
    return newImages;
  });
  
  setCurrentCloth(prev => {
    const updatedCloth = {
      ...prev,
      imageUrls: prev.imageUrls.filter((_: any, i: number) => i !== index),
    };
    console.log('[AddOrder] Updated currentCloth.imageUrls after removal:', updatedCloth.imageUrls);
    return updatedCloth;
  });
};
