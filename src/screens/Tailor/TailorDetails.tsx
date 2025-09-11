import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { tailorDetailsStyles as styles } from './styles';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/api';
import Button from '../../components/Button';
import { TailorStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';

interface TailorDetailsRouteParams {
  tailorId: string;
}

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

const TailorDetails = () => {
  const navigation = useNavigation<TailorDetailsNavigationProp>();
  const route = useRoute<RouteProp<TailorStackParamList, 'TailorDetails'>>();
  const { tailorId } = route.params;
  const [tailor, setTailor] = useState<Tailor | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTailorDetails();
  }, [tailorId]);



  // Refresh data when screen comes back into focus (e.g., after editing)
  useFocusEffect(
    React.useCallback(() => {
      console.log('[TailorDetails] Screen focused, refreshing data for tailorId:', tailorId);
      if (tailorId) {
        // Force a fresh fetch when screen comes into focus
        setTailor(null);
        setShop(null);
        fetchTailorDetails();
      }
    }, [tailorId])
  );

  const fetchTailorDetails = async () => {
    try {
      console.log('[TailorDetails] Fetching tailor details for ID:', tailorId);
      setLoading(true);
      
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const tailorData = await apiService.getTailorById(tailorId);
      console.log('[TailorDetails] Received tailor data:', tailorData, 'at timestamp:', timestamp);
      setTailor(tailorData);
      
      // Also fetch shop details if we have a shopId
      if (tailorData?.shopId) {
        console.log('[TailorDetails] Fetching shop details for shopId:', tailorData.shopId);
        fetchShopDetails(tailorData.shopId);
      }
    } catch (error) {
      console.error('Error fetching tailor details:', error);
      Alert.alert('Error', 'Failed to fetch tailor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopDetails = async (shopId?: string) => {
    const targetShopId = shopId || tailor?.shopId;
    if (!targetShopId) return;
    
    try {
      console.log('[TailorDetails] Fetching shop details for shopId:', targetShopId);
      const shopData = await apiService.getShopById(targetShopId);
      console.log('[TailorDetails] Received shop data:', shopData);
      setShop(shopData);
    } catch (error) {
      console.error('Error fetching shop details:', error);
      // Don't show error alert for shop details, just log it
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTailorDetails();
      if (tailor?.shopId) {
        await fetchShopDetails();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async () => {
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
              // Use available soft-delete API to satisfy types
              // Fallback to deleteTailor if implemented later
              await (apiService as any).softDeleteTailor(tailorId);
              Alert.alert('Success', 'Tailor deleted successfully');
              (navigation as any).goBack();
            } catch (e) {
              Alert.alert('Error', 'Failed to delete tailor');
            }
          },
        },
      ]
    );
  };

  const getTailorNumber = (tailor: Tailor) => {
    if (tailor.serialNumber) {
      return `TLR-${String(tailor.serialNumber).padStart(4, '0')}`;
    }
    // Fallback: generate from ID hash
    const hash = Math.abs(Array.from(tailor.id).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
    return `TLR-${String(hash).padStart(4, '0')}`;
  };

  const getShopNumber = (shop: Shop | null) => {
    if (shop?.serialNumber) {
      return `SHP-${String(shop.serialNumber).padStart(4, '0')}`;
    }
    // Fallback: generate from shop ID hash
    if (shop?.id) {
      const hash = Math.abs(Array.from(shop.id).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
      return `SHP-${String(hash).padStart(4, '0')}`;
    }
    return 'SHP-0000';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
        <RegularText style={styles.loadingText}>Loading tailor details...</RegularText>
      </View>
    );
  }

  if (!tailor) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.danger} />
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.brand]}
          tintColor={colors.brand}
        />
      }
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
          <TitleText style={styles.tailorName}>{tailor.name}</TitleText>
          <RegularText style={styles.tailorNumber}>{getTailorNumber(tailor)}</RegularText>
        </LinearGradient>
      </View>

      {/* Tailor Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <TitleText style={styles.sectionTitle}>Contact Information</TitleText>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Icon name="delete-outline" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Phone Number */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="phone" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>Phone Number</RegularText>
            <RegularText style={styles.infoValue}>{tailor.mobileNumber}</RegularText>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="location-on" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>Address</RegularText>
            <RegularText style={styles.infoValue}>
              {tailor.address || 'No address provided'}
            </RegularText>
          </View>
        </View>

        {/* Shop Information */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon name="store" size={20} color={colors.brand} />
          </View>
          <View style={styles.infoContent}>
            <RegularText style={styles.infoLabel}>Shop</RegularText>
            <RegularText style={styles.infoValue}>
              {shop?.name || 'Unknown Shop'} ({getShopNumber(shop)})
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
            title="Edit Tailor"
            height={56}
            gradientColors={['#229B73', '#1a8f6e', '#000000']}
            icon={<Icon name="edit" size={24} color="#fff" />}
            onPress={() => navigation.navigate('EditTailor', { tailorId: tailor.id })}
            style={[styles.topButton, { borderRadius: 12 }]}
          />
          
          <Button
            variant="light"
            title="Assign Orders"
            height={56}
            onPress={() => {
              const root = (navigation as any).getParent?.();
              if (root) {
                root.navigate('Orders', {
                  screen: 'OrderList',
                  params: { tailorId: tailor.id, tailorName: tailor.name }
                });
              } else {
                (navigation as any).navigate('Orders', {
                  screen: 'OrderList',
                  params: { tailorId: tailor.id, tailorName: tailor.name }
                });
              }
            }}
            style={[styles.topButton, { borderRadius: 12 }]}
          />
        </View>

        {/* Bottom Row - 1 full width button */}
        <Button
          variant="gradient"
          title="View Assigned Orders"
          height={56}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          icon={<Icon name="assignment" size={24} color="#fff" />}
          onPress={() => navigation.navigate('TailorAssignedOrders', { 
            tailorId: tailor.id, 
            tailorName: tailor.name 
          })}
          style={{ borderRadius: 12 }}
        />
      </View>
    </ScrollView>
  );
};


export default TailorDetails;