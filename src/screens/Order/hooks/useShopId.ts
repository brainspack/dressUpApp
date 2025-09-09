import { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderStackParamList } from '../../../navigation/types';
import { useAuth } from '../../../context/AuthContext';

export const useShopId = () => {
  const route = useRoute<RouteProp<OrderStackParamList, 'AddOrder'>>();
  const { accessToken } = useAuth();
  const [resolvedShopId, setResolvedShopId] = useState<string>(route.params?.shopId || '');

  const getCurrentUserShopId = (): string | null => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('[AddOrder] JWT payload:', payload);
      return payload?.shopId || payload?.user?.shopId || null;
    } catch (error) {
      console.error('[AddOrder] Failed to decode JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadShopId = async () => {
      try {
        // 1. First try JWT token (most reliable)
        const jwtShopId = getCurrentUserShopId();
        if (jwtShopId) {
          console.log('[AddOrder] Using shopId from JWT:', jwtShopId);
          setResolvedShopId(jwtShopId);
          return;
        }

        // 2. Then try route params
        if (route.params?.shopId) {
          console.log('[AddOrder] Using shopId from route params:', route.params.shopId);
          setResolvedShopId(route.params.shopId);
          return;
        }

        // 3. Finally fallback to AsyncStorage
        const sid = await AsyncStorage.getItem('shopId');
        if (sid) {
          console.log('[AddOrder] Using shopId from AsyncStorage:', sid);
          setResolvedShopId(sid);
        } else {
          console.warn('[AddOrder] No shopId found in any source!');
        }
      } catch (error) {
        console.error('[AddOrder] Error loading shopId:', error);
      }
    };
    loadShopId();
  }, [accessToken, route.params?.shopId]);

  return { resolvedShopId, getCurrentUserShopId };
};
