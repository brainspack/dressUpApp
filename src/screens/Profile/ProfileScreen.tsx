import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from '../../components/Button';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const { currentLanguage, setAppLanguage } = useLanguage();
  const { accessToken, setAccessToken, setIsAuthenticated, userInfo, updateUserProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  useEffect(() => {
    // Load user data from context
    if (userInfo) {
      const displayName = userInfo.name || userInfo.phone || 'User';
      setUserName(displayName);
      setTempUserName(displayName);
      setProfileImage(userInfo.profileImage || null);
      console.log('ProfileScreen: Loaded user data:', userInfo);
    } else {
      // Fallback for new users
      setUserName('User');
      setTempUserName('User');
      setProfileImage(null);
    }
  }, [userInfo]);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage]);

  const handleLanguageChange = async (newLanguage: string) => {
    console.log('Changing language from', selectedLanguage, 'to', newLanguage);
    // Update UI immediately
    setSelectedLanguage(newLanguage);
    try {
      await setAppLanguage(newLanguage);
      await i18n.changeLanguage(newLanguage);
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
      // Update profile data in context and storage
      await updateUserProfile({ 
        name: tempUserName.trim(),
        profileImage: profileImage || undefined 
      });
      setUserName(tempUserName.trim());
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      console.log('ProfileScreen: Profile saved successfully');
    } catch (error) {
      console.error('ProfileScreen: Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
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

  const handleChangePhoto = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          setProfileImage(imageUri);
          // Save image immediately to context
          try {
            await updateUserProfile({ profileImage: imageUri });
            console.log('ProfileScreen: Profile image updated successfully');
          } catch (error) {
            console.error('ProfileScreen: Error updating profile image:', error);
          }
        }
      }
    });
  };

  console.log('Current language in render:', currentLanguage, 'Selected:', selectedLanguage);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="menu" size={24} color={colors.textPrimary} />
        <TitleText style={styles.headerTitle}>Profile</TitleText>
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
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImageRounded} />
            ) : (
              <Text style={styles.profileInitials}>{getInitials(userName)}</Text>
            )}
          </View>
          <TitleText style={styles.profileName}>{userName}</TitleText>
          <TouchableOpacity style={styles.changePhotoButton} onPress={handleChangePhoto}>
            <RegularText style={styles.changePhotoText}>{t('profile.changePhoto') || 'Change Photo'}</RegularText>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Profile Information Section */}
      {!isEditing ? (
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <TitleText style={styles.sectionTitle}>Profile Information</TitleText>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.brand,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.brand,
    fontWeight: '600',
  },

  profileCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  profileGradient: {
    padding: 40,
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImageRounded: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 34,
    paddingVertical: 4,
  },
  changePhotoButton: {
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  infoSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  editSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '600',
    lineHeight: 22,
  },
  nameWithEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editIconButton: {
    padding: 4,
    marginLeft: 8,
  },
  editInputContainer: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  actionSection: {
    margin: 16,
    marginBottom: 32,
  },
});

export default ProfileScreen;