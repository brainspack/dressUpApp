import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

// Create or load a friendly customer code like CUS-0001 and persist it locally
export const ensureCustomerCode = async (customerId?: string): Promise<string> => {
  try {
    if (!customerId) return '';
    
    // Prefer mobile number from API if available
    try {
      const customer = await apiService.getCustomerById(customerId);
      if (customer?.mobileNumber) {
        return customer.mobileNumber;
      }
    } catch {}
    
    // Fallback to any previously cached phone for this id
    const phoneKey = `customerPhone:${customerId}`;
    const cachedPhone = await AsyncStorage.getItem(phoneKey);
    if (cachedPhone) {
      return cachedPhone;
    }
    
    // Final fallback to deterministic CUS-0001 if no phone found
    const counterKey = 'customerCodeCounter';
    const raw = await AsyncStorage.getItem(counterKey);
    const current = raw ? parseInt(raw, 10) : 0;
    const next = current + 1;
    const code = `CUS-${String(next).padStart(4, '0')}`;
    await AsyncStorage.multiSet([[counterKey, String(next)], [phoneKey, code]]);
    return code;
  } catch {
    // Fallback: deterministic short code from id hash
    const short = Math.abs(Array.from(customerId || '').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
    return `CUS-${String(short).padStart(4, '0')}`;
  }
};

// Get current user shopId from JWT token
export const getCurrentUserShopId = (accessToken?: string): string | null => {
  if (!accessToken) return null;
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    console.log('[OrderUtils] JWT payload:', payload);
    return payload?.shopId || payload?.user?.shopId || null;
  } catch (error) {
    console.error('[OrderUtils] Failed to decode JWT:', error);
    return null;
  }
};

// Load shopId with priority: JWT > Route Params > AsyncStorage
export const loadShopId = async (accessToken?: string, routeShopId?: string): Promise<string> => {
  try {
    // 1. First try JWT token (most reliable)
    const jwtShopId = getCurrentUserShopId(accessToken);
    if (jwtShopId) {
      console.log('[OrderUtils] Using shopId from JWT:', jwtShopId);
      return jwtShopId;
    }

    // 2. Then try route params
    if (routeShopId) {
      console.log('[OrderUtils] Using shopId from route params:', routeShopId);
      return routeShopId;
    }

    // 3. Finally fallback to AsyncStorage
    const sid = await AsyncStorage.getItem('shopId');
    if (sid) {
      console.log('[OrderUtils] Using shopId from AsyncStorage:', sid);
      return sid;
    } else {
      console.warn('[OrderUtils] No shopId found in any source!');
      return '';
    }
  } catch (error) {
    console.error('[OrderUtils] Error loading shopId:', error);
    return '';
  }
};

// Create customer if not exists
export const ensureCustomerExists = async (customerName: string, customerId?: string): Promise<string> => {
  if (customerId) return customerId;
  
  if (!customerName || customerName.trim() === '') {
    throw new Error('Customer name is required');
  }
  
  try {
    const generatedPhone = `9${Date.now().toString().slice(-9)}`;
    const createdCustomer = await apiService.createCustomer({
      name: customerName.trim(),
      mobileNumber: generatedPhone,
    });
    return createdCustomer?.id || '';
  } catch (error) {
    console.error('[OrderUtils] Auto-create customer failed:', error);
    throw new Error('Failed to create customer. Please try again.');
  }
};

