import { Platform } from 'react-native';
import { Order, OrderItem } from '../types/order';

// For Android emulator, use 10.0.2.2 to access host machine for iOS simulator, use localhost
// For physical devices, use your computer's IP address
const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:3000' 
    : 'http://localhost:3000'
  : 'http://your-production-api-url.com';

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    phone: string;
    role: string;
    shopId: string | null;
  };
}

export interface OtpResponse {
  message: string;
  otp: string;
}

export interface CustomerData {
  name: string;
  mobileNumber: string;
  address?: string;
  // Note: email and measurements are not supported by the backend yet
  // They will be handled separately in future updates
}

export interface CustomerResponse {
  id: string;
  name: string;
  mobileNumber: string;
  email?: string;
  address?: string;
  measurements?: any;
  shopId: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null) {
    console.log('Setting access token:', token ? 'Token provided' : 'No token');
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('Making API request to:', url);
    console.log('Access token available:', !!this.accessToken);
    if (this.accessToken) {
      console.log('Token starts with:', this.accessToken.substring(0, 20) + '...');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('Authorization header set:', `Bearer ${this.accessToken.substring(0, 20)}...`);
    } else {
      console.log('No access token available for request');
    }

    const defaultOptions: RequestInit = {
      headers: {
        ...headers,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Network connection failed. Please check your internet connection and ensure the backend server is running.');
      }
      throw error;
    }
  }

  // Send OTP to mobile number
  async sendOtp(mobileNumber: string): Promise<OtpResponse> {
    return this.request<OtpResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber }),
    });
  }

  // Verify OTP and get tokens
  async verifyOtp(mobileNumber: string, otp: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, otp }),
    });
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Create customer
  async createCustomer(customerData: CustomerData): Promise<CustomerResponse> {
    return this.request<CustomerResponse>('/customers/create', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Get customers for current user
  async getCustomers(): Promise<CustomerResponse[]> {
    return this.request<CustomerResponse[]>('/customers/my-customers', {
      method: 'GET',
    });
  }

  async deleteCustomer(customerId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/customers/${encodeURIComponent(customerId)}`, {
      method: 'DELETE',
    });
  }

  // Update customer
  async updateCustomer(customerId: string, customerData: CustomerData): Promise<CustomerResponse> {
    return this.request<CustomerResponse>(`/customers/${encodeURIComponent(customerId)}`, {
      method: 'PATCH',
      body: JSON.stringify(customerData),
    });
  }

  // Create order
  async createOrder(orderData: {
    customerId: string;
    shopId: string;
    status?: string;
    orderDate?: string;
    deliveryDate?: string | null;
    tailorName?: string | null;
    tailorNumber?: string | null;
    clothes: Array<{
      type: string;
      materialCost: number;
      designNotes?: string;
      color?: string | null;
      fabric?: string | null;
      imageUrls?: string[];
      imageData?: string[]; // Add imageData field
      videoUrls?: string[];
    }>;
    notes?: string;
  }): Promise<Order> {
    console.log('=== API SERVICE: Creating order ===');
    console.log('🚀 Order data clothes:', orderData.clothes?.map(c => ({ 
      type: c.type, 
      imageUrls: c.imageUrls, 
      imageData: c.imageData,
      imageUrlsLength: c.imageUrls?.length || 0,
      imageDataLength: c.imageData?.length || 0,
      hasImages: !!(c.imageUrls && c.imageUrls.length > 0),
      hasImageData: !!(c.imageData && c.imageData.length > 0)
    })));
    
    // 🚀 Log first few characters of imageData to verify content
    orderData.clothes?.forEach((cloth, index) => {
      if (cloth.imageUrls && cloth.imageUrls.length > 0) {
        console.log(`🚀 API: Cloth ${index} imageUrls samples:`, cloth.imageUrls.map(img => img.substring(0, 50) + '...'));
      }
      if (cloth.imageData && cloth.imageData.length > 0) {
        console.log(`🚀 API: Cloth ${index} imageData samples:`, cloth.imageData.map(img => img.substring(0, 50) + '...'));
      }
    });
    
    console.log('🚀 Full order data (without images):', {
      ...orderData,
      clothes: orderData.clothes?.map(c => ({
        ...c,
        imageUrls: c.imageUrls ? `[${c.imageUrls.length} images]` : '[]',
        imageData: c.imageData ? `[${c.imageData.length} images]` : '[]'
      }))
    });
    console.log('=== END API SERVICE LOG ===');
    
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Get all orders
  async getOrders(status?: string): Promise<Order[]> {
    console.log('[API] getOrders called with status:', status, 'accessToken:', this.accessToken ? 'Present' : 'Missing');
    const url = status && status !== 'all' ? `/orders?status=${status}` : '/orders';
    const result = await this.request<Order[]>(url, {
      method: 'GET',
    });
    console.log('[API] getOrders result:', result);
    return result;
  }

  async getOrdersByShop(shopId: string, status?: string): Promise<Order[]> {
    let url = `/orders?shopId=${encodeURIComponent(shopId)}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    return this.request<Order[]>(url, {
      method: 'GET',
    });
  }

  async getPaymentsByRange(shopId: string, startIso: string, endIso: string): Promise<{ payments: Array<{ id: string; orderId: string; shopId: string; amount: number; paidAt: string }> }> {
    console.log('[API] getPaymentsByRange called with:', { shopId, startIso, endIso });
    const qs = `shopId=${encodeURIComponent(shopId)}&start=${encodeURIComponent(startIso)}&end=${encodeURIComponent(endIso)}`;
    return this.request(`/payments?${qs}`, { method: 'GET' });
  }

  // Get order by ID
  async getOrderById(orderId: string): Promise<any> {
    return this.request<any>(`/orders/${orderId}`, {
      method: 'GET',
    });
  }

  async softDeleteOrder(orderId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Assign order to tailor
  async assignOrder(orderId: string, tailorId: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ tailorId }),
    });
  }

  // Unassign order
  async unassignOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/unassign`, {
      method: 'POST',
    });
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Create clothes
  async createClothes(clothesData: any): Promise<any> {
    return this.request<any>('/clothes', {
      method: 'POST',
      body: JSON.stringify(clothesData),
    });
  }

  // Get shop by ID (for stats)
  async getShopById(shopId: string): Promise<any> {
    return this.request<any>(`/shops/${shopId}`, {
      method: 'GET',
    });
  }

  // Get shops for current authenticated owner
  async getMyShops(): Promise<any[]> {
    return this.request<any[]>(`/shops/my-shops`, {
      method: 'GET',
    });
  }

  async addTailor(data: { name: string; mobileNumber: string; address?: string; shopId: string }) {
    return this.request<any>('/tailors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTailors(): Promise<any[]> {
    return this.request<any[]>('/tailors', {
      method: 'GET',
    });
  }

  async getTailorsByShop(shopId: string): Promise<any[]> {
    return this.request<any[]>(`/tailors/by-shop/${encodeURIComponent(shopId)}`, {
      method: 'GET',
    });
  }

  async getTailorById(tailorId: string): Promise<any> {
    return this.request<any>(`/tailors/${tailorId}`, {
      method: 'GET',
    });
  }

  async updateTailor(id: string, data: { name: string; mobileNumber: string; address?: string }) {
    return this.request<any>(`/tailors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async softDeleteTailor(tailorId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/tailors/${tailorId}`, {
      method: 'DELETE',
    });
  }

  async getCustomerById(customerId: string): Promise<any> {
    return this.request<any>(`/customers/${customerId}`, {
      method: 'GET',
    });
  }

  async getMeasurementsByOrder(orderId: string): Promise<any[]> {
    return this.request<any[]>(`/measurements/order/${orderId}`, {
      method: 'GET',
    });
  }

  async getMeasurementsByCustomer(customerId: string): Promise<any[]> {
    return this.request<any[]>(`/measurements/customer/${customerId}`, {
      method: 'GET',
    });
  }

  async createMeasurement(payload: any): Promise<any> {
    return this.request<any>(`/measurements/add`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 🚀 ANALYTICS METHODS

  async getOrderTypeAnalytics(shopId?: string, dateRange?: string): Promise<any> {
    let url = '/analytics/order-types';
    const params = new URLSearchParams();
    
    if (shopId) {
      params.append('shopId', shopId);
    }
    if (dateRange) {
      params.append('dateRange', dateRange);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request<any>(url, {
      method: 'GET',
    });
  }

  async getOrderStatusAnalytics(shopId?: string, dateRange?: string): Promise<any> {
    let url = '/analytics/order-status';
    const params = new URLSearchParams();
    
    if (shopId) {
      params.append('shopId', shopId);
    }
    if (dateRange) {
      params.append('dateRange', dateRange);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request<any>(url, {
      method: 'GET',
    });
  }

  async getMonthlyRevenue(shopId?: string, year?: string): Promise<any> {
    let url = '/analytics/monthly-revenue';
    const params = new URLSearchParams();
    
    if (shopId) {
      params.append('shopId', shopId);
    }
    if (year) {
      params.append('year', year);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request<any>(url, {
      method: 'GET',
    });
  }

  // 🚀 GET ASSIGNED ORDERS FOR TAILOR
  async getAssignedOrdersForTailor(tailorId: string): Promise<any[]> {
    return this.request<any[]>(`/orders/assigned/${encodeURIComponent(tailorId)}`, {
      method: 'GET',
    });
  }
}

export const apiService = new ApiService();
export default apiService; 