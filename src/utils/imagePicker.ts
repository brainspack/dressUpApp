import { Platform, ActionSheetIOS, Alert, PermissionsAndroid, Linking } from 'react-native';
import { launchCamera, launchImageLibrary, ImageLibraryOptions, CameraOptions, Asset } from 'react-native-image-picker';

type PickResult = {
  canceled: boolean;
  asset?: Asset;
};

const openAppSettings = () => {
  try { Linking.openSettings(); } catch {}
};

const requestAndroidCameraPermission = async (): Promise<boolean> => {
  try {
    const current = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (current) return true;

    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera Permission',
      message: 'We need access to your camera to take pictures.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    });

    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission needed',
        'Camera permission is permanently denied. Open settings to enable it.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openAppSettings },
        ],
        { cancelable: true },
      );
      return false;
    }
    return false;
  } catch {
    return false;
  }
};

const requestAndroidGalleryPermission = async (): Promise<boolean> => {
  try {
    // On Android 13+ use the system Photo Picker; no runtime permission needed.
    if ((Platform.Version as number) >= 33) {
      return true;
    }

    // Older Android requires READ_EXTERNAL_STORAGE
    const permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const current = await PermissionsAndroid.check(permission);
    if (current) return true;

    const result = await PermissionsAndroid.request(permission, {
      title: 'Photos Permission',
      message: 'We need access to your photos to choose an image.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    });
    if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Permission needed',
        'Photos permission is permanently denied. Open settings to enable it.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openAppSettings },
        ],
        { cancelable: true },
      );
      return false;
    }
    return false;
  } catch {
    return false;
  }
};

export type UnifiedPickerOptions = (ImageLibraryOptions & CameraOptions) & {
  allowVideo?: boolean;
};

export const pickImageFromUser = async (options?: UnifiedPickerOptions): Promise<PickResult> => {
  return new Promise(async (resolve) => {
    const openCamera = async () => {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidCameraPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
          resolve({ canceled: true });
          return;
        }
      }
      const res = await launchCamera({
        mediaType: options?.allowVideo ? 'mixed' : 'photo',
        quality: options?.quality ?? 0.8,
        includeBase64: options?.includeBase64,
        maxWidth: options?.maxWidth,
        maxHeight: options?.maxHeight,
        cameraType: options?.cameraType ?? 'back',
        saveToPhotos: options?.saveToPhotos ?? false,
      });
      if ((res as any).errorCode) {
        const code = (res as any).errorCode;
        if (code === 'camera_unavailable') {
          if (Platform.OS === 'ios') {
            // Auto-fallback to Gallery on iOS Simulator
            const message = 'Camera is not available on the iOS Simulator. Opening Gallery instead.';
            Alert.alert('Camera unavailable', message, [{ text: 'OK', onPress: () => {} }], { cancelable: true });
            const gallery = await launchImageLibrary({
              mediaType: options?.allowVideo ? 'mixed' : 'photo',
              quality: options?.quality ?? 0.8,
              includeBase64: options?.includeBase64,
              maxWidth: options?.maxWidth,
              maxHeight: options?.maxHeight,
              selectionLimit: 1,
            });
            if (!gallery.didCancel && gallery.assets && gallery.assets[0]) {
              resolve({ canceled: false, asset: gallery.assets[0] });
            } else {
              resolve({ canceled: true });
            }
            return;
          }
          Alert.alert('Camera unavailable', 'Camera is not available on this device.');
        } else if (code === 'permission') {
          Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
        } else {
          Alert.alert('Error', (res as any).errorMessage || 'Failed to open camera.');
        }
        resolve({ canceled: true });
        return;
      }
      if (res.didCancel || !res.assets || !res.assets[0]) {
        resolve({ canceled: true });
      } else {
        resolve({ canceled: false, asset: res.assets[0] });
      }
    };

    const openGallery = async () => {
      if (Platform.OS === 'android') {
        const granted = await requestAndroidGalleryPermission();
        if (!granted) {
          Alert.alert('Permission required', 'Photos permission is needed to choose an image.');
          resolve({ canceled: true });
          return;
        }
      }
      const res = await launchImageLibrary({
        mediaType: options?.allowVideo ? 'mixed' : 'photo',
        quality: options?.quality ?? 0.8,
        includeBase64: options?.includeBase64,
        maxWidth: options?.maxWidth,
        maxHeight: options?.maxHeight,
        selectionLimit: 1,
      });
      if (res.didCancel || !res.assets || !res.assets[0]) {
        resolve({ canceled: true });
      } else {
        resolve({ canceled: false, asset: res.assets[0] });
      }
    };

    const presentSheet = () => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Take Photo', 'Choose from Gallery', 'Cancel'],
            cancelButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 0) openCamera();
            else if (buttonIndex === 1) openGallery();
            else resolve({ canceled: true });
          }
        );
      } else {
        // Simple Android bottom-style chooser via Alert for speed; can be replaced with a bottom sheet
        Alert.alert(
          'Select Image',
          undefined,
          [
            { text: 'Take Photo', onPress: openCamera },
            { text: 'Choose from Gallery', onPress: openGallery },
            { text: 'Cancel', style: 'cancel', onPress: () => resolve({ canceled: true }) },
          ],
          { cancelable: true }
        );
      }
    };

    presentSheet();
  });
};


