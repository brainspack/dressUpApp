import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiService from '../../../services/api';

export const handleClothImageUpload = async (
  setClothImages: (fn: (prev: (string | { url: string; fileKey: string; originalUrl?: string })[]) => (string | { url: string; fileKey: string; originalUrl?: string })[]) => void,
  setCurrentCloth: (fn: (prev: any) => any) => void
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

        // 2. Store image data with backend serving URL
        const s3Url = uploadResponse.s3Url;
        const fileKey = uploadResponse.fileKey;
        
        if (fileKey) {
          // Create backend serving URL for the image
          const backendImageUrl = `http://192.168.29.79:3001/orders/s3/image/${encodeURIComponent(fileKey)}`;
          
          console.log('[AddOrder] Storing image data in state:', { 
            s3Url: s3Url, 
            fileKey: fileKey,
            backendImageUrl: backendImageUrl
          });
          
          // Use the backend serving URL for displaying the image
          const imageData = {
            url: backendImageUrl, // Use backend serving URL for displaying
            fileKey: fileKey,
            originalUrl: s3Url, // Store original S3 URL
            s3Url: s3Url
          };
          
          // Update both state variables to ensure synchronization
          setClothImages(prev => {
            const newImages = [...prev, imageData];
            console.log('[AddOrder] Updated clothImages:', newImages);
            return newImages;
          });
          
          setCurrentCloth(prev => {
            const updatedCloth = {
              ...prev,
              imageUrls: [...prev.imageUrls, imageData]
            };
            console.log('[AddOrder] Updated currentCloth.imageUrls:', updatedCloth.imageUrls);
            return updatedCloth;
          });

          // Save uploaded images to AsyncStorage for OrderSummary to retrieve
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            // Get the current cloth type from the state
            setCurrentCloth(currentCloth => {
              const clothType = currentCloth.type || 'unknown';
              AsyncStorage.getItem(`uploadedImages_${clothType}`).then((currentImages: string | null) => {
                const existingImages = currentImages ? JSON.parse(currentImages) : [];
                const updatedImages = [...existingImages, imageData];
                AsyncStorage.setItem(`uploadedImages_${clothType}`, JSON.stringify(updatedImages));
                console.log('[AddOrder] Saved images to AsyncStorage for type:', clothType);
              }).catch((storageError: any) => {
                console.error('[AddOrder] Error saving images to AsyncStorage:', storageError);
              });
              return currentCloth;
            });
          } catch (storageError) {
            console.error('[AddOrder] Error saving images to AsyncStorage:', storageError);
          }
        }

        Alert.alert('Success', 'Image uploaded successfully!');
        
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
