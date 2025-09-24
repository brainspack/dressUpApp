/* eslint-disable no-trailing-spaces, react-native/no-inline-styles, no-new */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, ScrollView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/Button';
import { profileScreenStyles as styles } from './styles/ProfileScreenStyles';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import apiService from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ProfileScreen = () => {
  // const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { currentLanguage, setAppLanguage } = useLanguage();
  const { showToast } = useToast();
  const { accessToken, setAccessToken, setIsAuthenticated, userInfo, updateUserProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [imageCacheKey, setImageCacheKey] = useState<number>(Date.now());
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load user data from context
    if (userInfo) {
      // Prioritize name over phone number, but if no name, show a default
      const displayName = userInfo.name && userInfo.name.trim() ? userInfo.name : 'User';
      setUserName(displayName);
      setTempUserName(displayName);
      // Ensure profileImage is a string, not an object
      const profileImageValue = typeof userInfo.profileImage === 'string' 
        ? userInfo.profileImage 
        : null;
      setProfileImage(profileImageValue);
      
      // Force refresh image cache on iOS when profile image changes
      if (Platform.OS === 'ios' && profileImageValue) {
        setImageCacheKey(Date.now());
      }
      console.log('ProfileScreen: Loaded user data:', userInfo);
      console.log('ProfileScreen: Profile image from userInfo:', userInfo.profileImage);
      console.log('ProfileScreen: Profile image type:', typeof userInfo.profileImage);
      console.log('ProfileScreen: Profile image length:', userInfo.profileImage?.length);
      
      // If user doesn't have a name, automatically enter edit mode
      if (!userInfo.name || !userInfo.name.trim()) {
        setIsEditing(true);
      }
    } else {
      // Fallback for new users
      setUserName('User');
      setTempUserName('User');
      setProfileImage(null);
      setIsEditing(true); // Auto-enter edit mode for new users
    }
  }, [userInfo]);

  // Load fresh user profile data from API when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (accessToken) {
        try {
          console.log('ProfileScreen: Loading user profile from API...');
          const profileData = await apiService.getUserProfile();
          console.log('ProfileScreen: API profile data:', profileData);
          
          // Update local context with fresh data
          if (profileData) {
            // Prioritize name over mobile number, but if no name, show a default
            const displayName = profileData.name && profileData.name.trim() ? profileData.name : 'User';
            setUserName(displayName);
            setTempUserName(displayName);
            
            // Set profile image with cache refresh for iOS
            if (profileData.profileImage) {
              setProfileImage(profileData.profileImage);
              // Force refresh image cache on iOS
              if (Platform.OS === 'ios') {
                setImageCacheKey(Date.now());
              }
            } else {
              setProfileImage(null);
            }
            
            // If user doesn't have a name, automatically enter edit mode
            if (!profileData.name || !profileData.name.trim()) {
              setIsEditing(true);
            }
            
            // Language handling
            // Rule: For brand new users (no name) or missing language, default to English tab and app language.
            // Otherwise, keep app language and tab in sync with server preference to avoid mismatch.
            try {
              const apiLang = (profileData.language || '').toLowerCase();
              const isNewUser = !profileData.name || !profileData.name.trim();
              if (!apiLang || isNewUser) {
                // Force English as default
                if (currentLanguage !== 'en') {
                  await setAppLanguage('en');
                  await i18n.changeLanguage('en');
                }
                setSelectedLanguage('en');
                // Persist preference so next loads are consistent
                try { await apiService.updateUserProfile({ language: 'EN' }); } catch {}
              } else if (apiLang !== currentLanguage) {
                console.log('ProfileScreen: Syncing app language with API:', apiLang);
                await setAppLanguage(apiLang);
                await i18n.changeLanguage(apiLang);
                setSelectedLanguage(apiLang);
              } else {
                setSelectedLanguage(currentLanguage);
              }
            } catch (e) {
              setSelectedLanguage(currentLanguage);
            }
          }
        } catch (error) {
          console.error('ProfileScreen: Error loading user profile from API:', error);
          // Don't show error to user, just use context data
        }
      }
    };

    loadUserProfile();
  }, [accessToken, currentLanguage, i18n, setAppLanguage]);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  // Ensure default selected tab is always English when opening Profile
  useFocusEffect(
    React.useCallback(() => {
      setSelectedLanguage('en'); // do not change app language; just the tab UI
      
      // Force refresh profile image on iOS when screen comes into focus
      if (Platform.OS === 'ios' && profileImage) {
        setImageCacheKey(Date.now());
      }
    }, [profileImage])
  );

  const handleLanguageChange = async (newLanguage: string) => {
    console.log('Changing language from', selectedLanguage, 'to', newLanguage);
    // Update UI immediately
    setSelectedLanguage(newLanguage);
    try {
      // Update language in the app
      await setAppLanguage(newLanguage);
      await i18n.changeLanguage(newLanguage);
      
      // Update language preference in the backend
      try {
        const updateData = {
          language: newLanguage.toUpperCase(), // Convert to EN/HI format
        };
        console.log('ProfileScreen: Updating language preference:', updateData);
        await apiService.updateUserProfile(updateData);
        console.log('ProfileScreen: Language preference updated successfully');
      } catch (apiError) {
        console.error('ProfileScreen: Error updating language preference:', apiError);
        // Don't revert UI changes if API fails, just log the error
      }
      
      console.log('Language changed successfully to', newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
      // Revert on error
      setSelectedLanguage(currentLanguage);
    }
  };

  const handleSave = async () => {
    if (!tempUserName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      // Update profile data via API
      const updateData = {
        name: tempUserName.trim(),
        language: selectedLanguage.toUpperCase(), // Convert to EN/HI format
      };
      
      console.log('ProfileScreen: Updating profile with data:', updateData);
      const updatedProfile = await apiService.updateUserProfile(updateData);
      console.log('ProfileScreen: API response:', updatedProfile);
      
      // Update local context and storage
      await updateUserProfile({ 
        name: tempUserName.trim(),
        profileImage: profileImage || undefined 
      });
      
      setUserName(tempUserName.trim());
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
      console.log('ProfileScreen: Profile saved successfully');
    } catch (error) {
      console.error('ProfileScreen: Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setTempUserName(userName);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setAccessToken(null);
            setIsAuthenticated(false);
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Removed unused testImageUrl helper

  // Validate image source string for RN Image (support http(s), file, content, asset-library, ph, data URIs)
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    if (
      lower.startsWith('http://') ||
      lower.startsWith('https://') ||
      lower.startsWith('file://') ||
      lower.startsWith('content://') ||
      lower.startsWith('asset-library://') ||
      lower.startsWith('ph://') ||
      lower.startsWith('data:')
    ) {
      return true;
    }
    // Fallback: attempt URL parsing, but don't block non-standard schemes
    try { new URL(url); return true; } catch { return true; }
  };


  const handleChangePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const imageUri = asset.uri;
        const fileName = asset.fileName || `profile_${Date.now()}.jpg`;
        const fileType = asset.type || 'image/jpeg';

        if (imageUri && fileName && fileType) {
          try {
            console.log('🚀 ProfileScreen: Starting S3 profile image upload...');
            
            // Show loading state
            setLocalImageUri(imageUri); // Store local image URI
            setProfileImage(imageUri); // Show local image immediately
            
            // Upload to S3
            const uploadResult = await apiService.uploadProfileImage(imageUri, fileName, fileType);
            
            if (uploadResult.success && uploadResult.profileImageUrl) {
              console.log('🚀 ProfileScreen: Profile image uploaded to S3 successfully!');
              console.log('🚀 ProfileScreen: S3 URL received:', uploadResult.profileImageUrl);
              
              // Update profile with S3 URL
              await updateUserProfile({ profileImage: uploadResult.profileImageUrl });
              console.log('ProfileScreen: Profile image updated successfully with S3 URL');
              
              // Update local state with backend serving URL
              setProfileImage(uploadResult.profileImageUrl);
              console.log('ProfileScreen: Local state updated with backend URL:', uploadResult.profileImageUrl);
              
              // Force refresh image cache on iOS
              if (Platform.OS === 'ios') {
                setImageCacheKey(Date.now());
              }
              
              // Clear local image URI since we now have the backend URL
              setLocalImageUri(null);
              
              showToast('Profile image updated successfully!', 'success');
            } else {
              console.error('ProfileScreen: Upload failed:', uploadResult);
              throw new Error(uploadResult.error || 'Failed to upload profile image');
            }
          } catch (error: any) {
            console.error('ProfileScreen: Error uploading profile image:', error);
            
            // Revert to previous image on error
            setProfileImage(userInfo?.profileImage || null);
            
            let errorMessage = 'Failed to upload profile image. Please try again.';
            if (error.message && error.message.includes('Access Denied')) {
              errorMessage = 'AWS S3 Access Denied. Please check your AWS permissions.';
            } else if (error.message && error.message.includes('403')) {
              errorMessage = 'Permission denied. Please contact administrator to fix AWS S3 permissions.';
            }
            
            Alert.alert('Upload Error', errorMessage);
          }
        } else {
          Alert.alert('Error', 'Invalid image data. Please try again.');
        }
      }
    });
  };

  console.log('Current language in render:', currentLanguage, 'Selected:', selectedLanguage);
  console.log('ProfileScreen: Current profileImage state:', profileImage);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="menu" size={24} color={colors.textPrimary} />
        <TitleText style={styles.headerTitle}>{t('profile.profile') || 'Profile'}</TitleText>
        <View style={{ width: 24 }} />
      </View>

      {/* Language Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedLanguage === 'en' && styles.activeTab]}
          onPress={() => handleLanguageChange('en')}
        >
          <RegularText style={[styles.tabText, selectedLanguage === 'en' && styles.activeTabText]}>
            English
          </RegularText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedLanguage === 'hi' && styles.activeTab]}
          onPress={() => handleLanguageChange('hi')}
        >
          <RegularText style={[styles.tabText, selectedLanguage === 'hi' && styles.activeTabText]}>
            हिंदी
          </RegularText>
        </TouchableOpacity>
      </View>

      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#229B73', '#1a8f6e', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <View style={styles.profileIconContainer}>
            {profileImage && isValidImageUrl(profileImage) ? (
              <Image 
                source={{ 
                  uri: Platform.OS === 'ios' 
                    ? `${profileImage}?cb=${imageCacheKey}`
                    : profileImage,
                  cache: Platform.OS === 'ios' ? 'reload' : 'default'
                }} 
                style={styles.profileImageRounded}
                resizeMode="cover"
                key={`${profileImage}-${imageCacheKey}`}
                onLoad={() => {
                  console.log('✅ ProfileScreen: Profile image loaded successfully:', profileImage);
                  setIsImageLoading(false);
                  // Clear local image URI since S3 image loaded successfully
                  if (localImageUri && profileImage !== localImageUri) {
                    setLocalImageUri(null);
                  }
                }}
                onError={(error) => {
                  console.log('🚨 ProfileScreen: Profile image load error:', error.nativeEvent.error);
                  console.log('🚨 ProfileScreen: Failed image URI:', profileImage);
                  setIsImageLoading(false);
                  
                  // Don't change state on error to avoid infinite loops
                  // Just log the error and let the user retry
                }}
                onLoadStart={() => {
                  if (!isImageLoading) {
                    console.log('🔄 ProfileScreen: Starting to load image:', profileImage);
                    setIsImageLoading(true);
                  }
                }}
                onLoadEnd={() => {
                  console.log('🏁 ProfileScreen: Finished loading image:', profileImage);
                  setIsImageLoading(false);
                }}
              />
            ) : (
              <Text style={styles.profileInitials}>{getInitials(userName)}</Text>
            )}
          </View>
          <TitleText style={styles.profileName}>{userName}</TitleText>
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
            <RegularText style={styles.changePhotoText}>
              {profileImage ? (t('profile.changePhoto') || 'Change Photo') : (t('profile.addPhoto') || 'Add Photo')}
            </RegularText>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Profile Information Section */}
      {!isEditing ? (
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <TitleText style={styles.sectionTitle}>{t('profile.profileInformation')}</TitleText>
          </View>

          {/* Name Display */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="person" size={20} color={colors.brand} />
            </View>
            <View style={styles.infoContent}>
              <RegularText style={styles.infoLabel}>Name</RegularText>
              <View style={styles.nameWithEdit}>
                <RegularText style={styles.infoValue}>{userName}</RegularText>
                <TouchableOpacity
                  style={styles.editIconButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Icon name="edit" size={18} color={colors.brand} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Phone Number */}
          {userInfo?.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="phone" size={20} color={colors.brand} />
              </View>
              <View style={styles.infoContent}>
                <RegularText style={styles.infoLabel}>Phone Number</RegularText>
                <RegularText style={styles.infoValue}>{userInfo.phone}</RegularText>
              </View>
            </View>
          )}

          {/* User Role */}
          {userInfo?.role && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Icon name="work" size={20} color={colors.brand} />
              </View>
              <View style={styles.infoContent}>
                <RegularText style={styles.infoLabel}>Role</RegularText>
                <RegularText style={styles.infoValue}>{userInfo.role}</RegularText>
              </View>
            </View>
          )}

          {/* Member Since
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="event" size={20} color={colors.brand} />
            </View>
            <View style={styles.infoContent}>
              <RegularText style={styles.infoLabel}>Member Since</RegularText>
              <RegularText style={styles.infoValue}>Recently</RegularText>
            </View>
          </View> */}
        </View>
      ) : (
        /* Edit Mode */
        <View style={styles.editSection}>
          <View style={styles.sectionHeader}>
            <TitleText style={styles.sectionTitle}>Edit Profile</TitleText>
          </View>
          
          {/* Show helpful message for new users */}
          {(!userInfo?.name || !userInfo.name.trim()) && (
            <View style={styles.helpMessageContainer}>
              <RegularText style={styles.helpMessage}>
                👋 Welcome! Please set your name to personalize your profile.
              </RegularText>
            </View>
          )}
          
          <View style={styles.editInputContainer}>
            <RegularText style={styles.editLabel}>Name</RegularText>
            <TextInput
              style={styles.editInput}
              value={tempUserName}
              onChangeText={setTempUserName}
              placeholder={t('profile.enterName') || 'Enter your name'}
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {isEditing ? (
          <>
            <Button
              variant="gradient"
              title={t('common.save') || 'Save'}
              height={56}
              gradientColors={['#229B73', '#1a8f6e', '#000000']}
              icon={<Icon name="check" size={24} color="#fff" />}
              onPress={handleSave}
              style={{ marginBottom: 12, borderRadius: 12 }}
            />
            
            <Button
              variant="light"
              title={t('common.cancel') || 'Cancel'}
              height={56}
              onPress={handleCancel}
              style={{ borderRadius: 12, marginBottom: 12 }}
            />
          </>
        ) : null}
        
        
        <Button
          variant="gradient"
          title={t('profile.logout') || 'Logout'}
          height={56}
          gradientColors={['#ef4444', '#dc2626', '#b91c1c']}
          icon={<Icon name="logout" size={24} color="#fff" />}
          onPress={handleLogout}
          style={{ 
            borderRadius: 12,
            marginBottom: 32
          }}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;