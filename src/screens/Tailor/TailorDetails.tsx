/* eslint-disable react-native/no-inline-styles, no-trailing-spaces */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { tailorDetailsStyles as styles } from './styles';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/api';
import Button from '../../components/Button';
import { TailorStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import { useTranslation } from 'react-i18next';
import colors from '../../constants/colors';
import { useToast } from '../../context/ToastContext';

// TailorDetailsRouteParams was unused; removed to satisfy linter

interface Tailor {
  id: string;
  serialNumber?: number;
  name: string;
  mobileNumber: string;
  address?: string;
  createdAt: string;
  shopId: string;
  status: 'INACTIVE' | 'ACTIVE';
}

interface Shop {
  id: string;
  serialNumber?: number;
  name: string;
}

type TailorDetailsNavigationProp = NativeStackNavigationProp<TailorStackParamList, 'TailorDetails'>;

const TailorDetails = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<TailorDetailsNavigationProp>();
  const route = useRoute<RouteProp<TailorStackParamList, 'TailorDetails'>>();
  const { tailorId } = route.params;
  const { showToast } = useToast();
  const [data, setData] = useState<{
    tailor: Tailor | null;
    shop: Shop | null;
    loading: boolean;
    shopLoading: boolean;
  }>({
    tailor: null,
    shop: null,
    loading: true,
    shopLoading: false,
  });
  const fetchedShopIdRef = useRef<string | null>(null);

  const fetchShopDetails = useCallback(async (shopId: string) => {
    if (!shopId || fetchedShopIdRef.current === shopId) { 
      return; 
    }
    
    try {
      console.log('[TailorDetails] Fetching shop details for shopId:', shopId);
      setData(prev => ({ ...prev, shopLoading: true }));
      const shopData = await apiService.getShopById(shopId);
      console.log('[TailorDetails] Received shop data:', shopData);
      setData(prev => ({ ...prev, shop: shopData, shopLoading: false }));
      fetchedShopIdRef.current = shopId;
    } catch (error) {
      console.error('Error fetching shop details:', error);
      setData(prev => ({ ...prev, shopLoading: false }));
    }
  }, []);

  const fetchTailorDetails = useCallback(async () => {
    try {
      console.log('[TailorDetails] Fetching tailor details for ID:', tailorId);
      setData(prev => ({ ...prev, loading: true }));
      const tailorData = await apiService.getTailorById(tailorId);
      console.log('[TailorDetails] Received tailor data:', tailorData);
      setData(prev => ({ ...prev, tailor: tailorData, loading: false }));
      
      // Fetch shop details if needed
      if (tailorData?.shopId && fetchedShopIdRef.current !== tailorData.shopId) {
        await fetchShopDetails(tailorData.shopId);
      }
    } catch (error) {
      console.error('Error fetching tailor details:', error);
      Alert.alert('Error', 'Failed to fetch tailor details');
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [tailorId, fetchShopDetails]);

  useEffect(() => {
    fetchTailorDetails();
  }, [fetchTailorDetails]);

  // Reset shop ref when tailor changes
  useEffect(() => {
    if (data.tailor?.shopId !== fetchedShopIdRef.current) {
      fetchedShopIdRef.current = null;
    }
  }, [data.tailor?.shopId]);


  const handleDelete = useCallback(async () => {
    Alert.alert(
      'Delete Tailor',
      'Are you sure you want to delete this tailor? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await (apiService as any).softDeleteTailor(tailorId);
              showToast('Tailor deleted successfully', 'success');
              (navigation as any).goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete tailor');
            }
          },
        },
      ]
    );
  }, [tailorId, showToast, navigation]);

  const getTailorNumber = React.useCallback((tailorObj: Tailor) => {
    if (tailorObj.serialNumber) {
      return `TLR-${String(tailorObj.serialNumber).padStart(4, '0')}`;
    }
    // Fallback: generate from ID hash
    const hash = Math.abs(Array.from(tailorObj.id).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
    return `TLR-${String(hash).padStart(4, '0')}`;
  }, []);

  const getShopNumber = React.useCallback((shopObj: Shop | null) => {
    if (shopObj?.serialNumber) {
      return `SHP-${String(shopObj.serialNumber).padStart(4, '0')}`;
    }
    // Fallback: generate from shop ID hash
    if (shopObj?.id) {
      const hash = Math.abs(Array.from(shopObj.id).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
      return `SHP-${String(hash).padStart(4, '0')}`;
    }
    return 'SHP-0000';
  }, []);

  // Memoize tailor number to prevent flickering
  const tailorNumber = React.useMemo(() => {
    return data.tailor ? getTailorNumber(data.tailor) : '';
  }, [data.tailor, getTailorNumber]);

  // Memoize shop display text to prevent flickering
  const shopDisplayText = React.useMemo(() => {
    if (data.shopLoading) {
      return 'Loading...';
    }
    const shopName = data.shop?.name || 'Unknown Shop';
    const shopNumber = getShopNumber(data.shop);
    return `${shopName} (${shopNumber})`;
  }, [data.shop, data.shopLoading, getShopNumber]);

  if (data.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
        <RegularText style={styles.loadingText}>Loading tailor details...</RegularText>
      </View>
    );
  }

  if (!data.tailor) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color={colors.danger} />
        <TitleText style={styles.errorTitle}>Tailor Not Found</TitleText>
        <RegularText style={styles.errorText}>The tailor you're looking for doesn't exist or has been deleted.</RegularText>
          <Button
          variant="gradient"
          title="Go Back"
          height={48}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={() => (navigation as any).goBack()}
          style={{ marginTop: 24, borderRadius: 12 }}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#229B73', '#1a8f6e', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <View style={styles.profileIconContainer}>
            <Icon name="content-cut" size={48} color="#ffffff" />
          </View>
          <TitleText style={styles.tailorName}>{data.tailor.name}</TitleText>
          <RegularText style={styles.tailorNumber}>{tailorNumber}</RegularText>
        </LinearGradient>
      </View>

      {/* Tailor Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <TitleText style={styles.sectionTitle}>{t('tailor.contactInformation') || 'Contact Information'}</TitleText>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Icon name="delete" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Phone Number */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="phone" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>{t('tailor.phoneNumber') || 'Phone Number'}</RegularText>
            <RegularText style={styles.infoValue}>{data.tailor.mobileNumber}</RegularText>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="location-on" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>{t('tailor.address') || 'Address'}</RegularText>
            <RegularText style={styles.infoValue}>
              {data.tailor.address || (t('tailor.noAddress') || 'No address provided')}
            </RegularText>
          </View>
        </View>

        {/* Shop Information */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="store" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>{t('tailor.shop') || 'Shop'}</RegularText>
            <RegularText style={styles.infoValue}>
              {shopDisplayText}
            </RegularText>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {/* Top Row - 2 buttons side by side */}
        <View style={styles.topButtonRow}>
          <Button
            variant="gradient"
            title={t('tailor.editTailor') || 'Edit Tailor'}
            height={56}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            icon={<Icon name="edit" size={24} color="#fff" />}
            onPress={() => navigation.navigate('EditTailor', { tailorId: data.tailor!.id })}
            style={styles.topButton}
          />
          
          <Button
            variant="light"
            title={t('order.assign') || 'Assign Orders'}
            height={56}
            onPress={() => {
              const root = (navigation as any).getParent?.();
              if (root) {
                root.navigate('Orders', {
                  screen: 'OrderList',
                  params: { tailorId: data.tailor!.id, tailorName: data.tailor!.name }
                });
              } else {
                (navigation as any).navigate('Orders', {
                  screen: 'OrderList',
                  params: { tailorId: data.tailor!.id, tailorName: data.tailor!.name }
                });
              }
            }}
            style={styles.topButton}
          />
        </View>

      </View>
    </ScrollView>
  );
});

TailorDetails.displayName = 'TailorDetails';

export default TailorDetails;