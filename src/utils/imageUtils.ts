import { launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';

// Image upload handler for cloth images with base64 data
export const handleClothImageUpload = async (): Promise<string | null> => {
  try {
    console.log('[ImageUtils] Starting image upload...');
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5, // Reduced quality to reduce file size
      maxWidth: 800, // Resize image to max 800px width
      maxHeight: 800, // Resize image to max 800px height
      includeBase64: true, // Enable base64 for database storage
    });

    console.log('[ImageUtils] Image picker result:', {
      didCancel: result.didCancel,
      assets: result.assets?.length || 0,
      errorMessage: result.errorMessage
    });

    if (!result.didCancel && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('[ImageUtils] Selected image asset:', {
        uri: asset.uri,
        hasBase64: !!asset.base64,
        base64Length: asset.base64?.length || 0,
        fileName: asset.fileName,
        type: asset.type
      });

      // Store base64 data with proper MIME prefix for database
      let imageData: string;
      if (asset.base64) {
        imageData = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
        console.log('[ImageUtils] Created base64 data string, length:', imageData.length);
      } else if (asset.uri) {
        imageData = asset.uri;
        console.log('[ImageUtils] Using URI as fallback:', imageData);
      } else {
        console.error('[ImageUtils] No valid image data found');
        return null;
      }

      return imageData;
    }
    return null;
  } catch (error) {
    console.error('[ImageUtils] Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image. Please try again.');
    return null;
  }
};