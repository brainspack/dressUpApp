// Utility functions for handling images

/**
 * Convert base64 string to data URL
 * @param base64Data - Base64 string from database
 * @param mimeType - MIME type of the image (default: image/jpeg)
 * @returns Base64 data URL string
 */
export const base64ToDataUrl = (base64Data: string, mimeType: string = 'image/jpeg'): string => {
  try {
    // If it's already a data URL, return as is
    if (base64Data.startsWith('data:')) {
      return base64Data;
    }
    // Convert base64 string to data URL
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error('Error converting base64 to data URL:', error);
    return '';
  }
};

/**
 * Convert base64 string to binary data
 * @param base64String - Base64 string (with or without data URL prefix)
 * @returns Binary data as Buffer
 */
export const base64ToBinary = (base64String: string): Buffer => {
  try {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('Error converting base64 to binary:', error);
    return Buffer.alloc(0);
  }
};

/**
 * Check if a string is a valid base64 data URL
 * @param str - String to check
 * @returns True if valid base64 data URL
 */
export const isValidBase64DataUrl = (str: string): boolean => {
  try {
    return str.startsWith('data:image/') && str.includes(';base64,');
  } catch {
    return false;
  }
};

/**
 * Check if a string is a valid file URI
 * @param str - String to check
 * @returns True if valid file URI
 */
export const isValidFileUri = (str: string): boolean => {
  try {
    return str.startsWith('file://') || str.startsWith('content://') || str.startsWith('http');
  } catch {
    return false;
  }
};

/**
 * Convert file URI to base64 string (fallback method)
 * @param uri - File URI to convert
 * @returns Promise<string> - Base64 string
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    // For React Native, we'll need to use a different approach
    // This is a placeholder - in practice, you might need to use react-native-fs or similar
    console.log('Converting URI to base64:', uri);
    return uri; // For now, just return the URI as fallback
  } catch (error) {
    console.error('Error converting URI to base64:', error);
    return '';
  }
};
