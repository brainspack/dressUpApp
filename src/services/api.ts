// import { Platform } from 'react-native';
// Ensure __DEV__ is known to TypeScript in environments where it's not declared by RN types
declare const __DEV__: boolean;
import { Order } from '../types/order';

// For local development nuances across platforms
// Android emulator can use 10.0.2.2 to reach host; however, we're defaulting to the hosted API to keep both platforms in sync
const getHostedApiUrl = () => 'https://dressup-api.brainspack.com';

// Use the same hosted API for both Android and iOS in dev to avoid localhost mismatch on iOS simulator
const API_BASE_URL = __DEV__
  ? getHostedApiUrl()
  : getHostedApiUrl();

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    name: string;
    profileImage: string | null;
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
  private offlineCallback: (() => void) | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setOfflineCallback(callback: (() => void) | null) {
    this.offlineCallback = callback;
  }

  // Manual method to trigger offline detection (for testing)
  triggerOfflineDetection() {
    if (this.offlineCallback) {
      console.log('🚀 API: Manually triggering offline detection');
      this.offlineCallback();
    }
  }

  setAccessToken(token: string | null) {
    console.log('Setting access token:', token ? 'Token provided' : 'No token');
    this.accessToken = token;
  }

  // Debug utility: preview or access token for logs
  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // In dev we now use hosted API for both platforms to keep data consistent
    const urlsToTry = [`${this.baseUrl}${endpoint}`];

    let lastError: Error | null = null;

    for (const url of urlsToTry) {
      console.log(`🚀 API: Attempting request to: ${url}`);
      
      if (this.accessToken) {
        console.log('Token starts with:', this.accessToken.substring(0, 20) + '...');
      }
      
      const headers: Record<string, string> = { 'X-Client': 'mobile-app' };

      // Only set Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        console.log('🚀 API: Setting Content-Type to application/json');
      } else {
        console.log('🚀 API: FormData detected, not setting Content-Type header');
      }

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
        console.log(`🚀 API: Successfully connected to: ${url}`);
        return data;
      } catch (error) {
        console.warn(`API request failed for ${url}:`, error);
        console.warn('🚀 API: Error details:', {
          message: (error as Error).message,
          name: (error as Error).name,
          stack: (error as Error).stack?.substring(0, 200)
        });
        lastError = error as Error;
        
        // If this is not the last URL to try, continue to the next one
        if (url !== urlsToTry[urlsToTry.length - 1]) {
          console.log(`🚀 API: Trying next URL... (${urlsToTry.indexOf(url) + 2}/${urlsToTry.length})`);
          continue;
        }
      }
    }

    // Trigger offline callback if all requests failed (any network-related error)
    if (lastError && (
      (lastError instanceof TypeError && (
        lastError.message.includes('Network request failed') ||
        lastError.message.includes('fetch') ||
        lastError.message.includes('connection') ||
        lastError.message.includes('timeout')
      )) ||
      lastError.message.includes('Failed to fetch') ||
      lastError.message.includes('NetworkError') ||
      lastError.message.includes('AbortError')
    )) {
      if (this.offlineCallback) {
        console.log('🚀 API: All requests failed, triggering offline callback. Error:', lastError.message);
        this.offlineCallback();
      }
    }
    
    // If all URLs failed, throw the last error with helpful information
    if (lastError instanceof TypeError && lastError.message.includes('Network request failed')) {
      const triedUrls = urlsToTry.map(url => `• ${url}`).join('\n');
      throw new Error(`Network connection failed after trying ${urlsToTry.length} URLs:\n${triedUrls}\n\nPlease ensure:\n1. Backend server is running on port 3000\n2. Android emulator can access your machine's network\n3. Firewall allows connections on port 3000`);
    }
    throw lastError || new Error('All API endpoints failed');
  }

  // Send OTP to mobile number
  async sendOtp(mobileNumber: string): Promise<OtpResponse> {
         
    try {
      const result = await this.request<OtpResponse>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ mobileNumber }),
      });
      console.log('🚀 [API] sendOtp success:', result);
      return result;
    } catch (error) {
      console.error('🚀 [API] sendOtp error:', error);
      throw error;
    }
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
      price: number; // 🚀 FIXED: Add missing price field
      designNotes?: string;
      color?: string | null;
      fabric?: string | null;
      imageUrls?: string[]; // S3 URLs
      videoUrls?: string[];
    }>;
    costs?: Array<{
      materialCost: number;
      laborCost: number;
      totalCost: number;
    }>; // 🚀 ADDED: Cost data for cost table
    notes?: string;
  }): Promise<Order> {
    console.log('=== API SERVICE: Creating order ===');
    console.log('🚀 Order data clothes with S3 URLs:', orderData.clothes?.map(c => ({ 
      type: c.type,
      materialCost: c.materialCost,
      price: c.price,
      color: c.color,
      fabric: c.fabric,
      designNotes: c.designNotes,
      s3ImageUrls: c.imageUrls, 
      imageUrlsCount: c.imageUrls?.length || 0,
      hasS3Images: !!(c.imageUrls && c.imageUrls.length > 0)
    })));
    console.log('🚀 Order data costs:', orderData.costs?.map(c => ({
      materialCost: c.materialCost,
      laborCost: c.laborCost,
      totalCost: c.totalCost
    })));
    
    // 🚀 Log S3 URLs to verify content
    orderData.clothes?.forEach((cloth, index) => {
      if (cloth.imageUrls && cloth.imageUrls.length > 0) {
        console.log(`🚀 API: Cloth ${index} S3 URLs:`, cloth.imageUrls);
      }
    });
    
    console.log('🚀 Full order data (without images):', {
      ...orderData,
      clothes: orderData.clothes?.map(c => ({
        ...c,
        imageUrls: c.imageUrls ? `[${c.imageUrls.length} S3 images]` : '[]'
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

  // 🚀 USER PROFILE METHODS
  async getUserProfile(): Promise<any> {
    return this.request<any>('/users/profile', {
      method: 'GET',
    });
  }

  async updateUserProfile(updateData: { name?: string; language?: string; profileImage?: string }): Promise<any> {
    return this.request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // Profile image upload method
  async uploadProfileImage(imageUri: string, fileName: string, fileType: string): Promise<{
    success: boolean;
    profileImageUrl?: string;
    fileKey?: string;
    s3Url?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 API: Starting profile image upload...');
      
      // 1. Create FormData for direct backend upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: fileType,
        name: fileName,
      } as any);

      console.log('🚀 API: FormData created for profile image upload:', {
        fileName: fileName,
        fileType: fileType,
        imageUri: imageUri.substring(0, 50) + '...',
        formDataKeys: Object.keys(formData as any)
      });
      
      // 2. Upload directly to backend
      const uploadResponse = await this.request<{
        success: boolean;
        fileKey?: string;
        viewUrl?: string;
        publicUrl?: string;
        error?: string;
      }>('/users/profile/upload-image', {
        method: 'POST',
        body: formData as any,
      });
      
      console.log('🚀 API: Backend upload response:', uploadResponse);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Failed to upload profile image');
      }

      // Prefer backend serving URL (stable), fallback to short-lived signed URL
      const signedUrl = (uploadResponse as any).viewUrl;
      const backendImageKey = uploadResponse.fileKey ?? '';
      const backendImageUrl = backendImageKey
        ? `${this.baseUrl.replace(/\/$/, '')}/users/profile/image/${encodeURIComponent(backendImageKey)}`
        : undefined;

      return {
        success: true,
        profileImageUrl: backendImageUrl || signedUrl,
        fileKey: uploadResponse.fileKey ?? undefined,
        s3Url: uploadResponse.publicUrl
      };
      
    } catch (error: any) {
      console.error('🚀 API: Profile image upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload profile image'
      };
    }
  }

  // Refresh profile image URL when it expires
  async refreshProfileImageUrl(fileKey: string): Promise<{
    success: boolean;
    signedUrl?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 API: Refreshing profile image URL for fileKey:', fileKey);
      
      const response = await this.request<any>('/users/profile/refresh-image-url', {
        method: 'POST',
        body: JSON.stringify({ fileKey }),
      });

      return response;
    } catch (error: any) {
      console.error('🚀 API: Error refreshing profile image URL:', error);
      return {
        success: false,
        error: error.message || 'Failed to refresh profile image URL'
      };
    }
  }

  // Order image upload method - S3 Direct Upload
  async uploadOrderImage(imageUri: string, fileName: string, fileType: string): Promise<{
    success: boolean;
    orderImageUrl?: string;
    fileKey?: string;
    s3Url?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 API: Starting S3 order image upload...');
      
      // 1. Create FormData for S3 upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: fileType,
        name: fileName,
      } as any);

      console.log('🚀 API: FormData created for S3 order image upload:', {
        fileName: fileName,
        fileType: fileType,
        imageUri: imageUri.substring(0, 50) + '...',
        formDataKeys: Object.keys(formData),
        isFormData: formData instanceof FormData
      });
      
      // 2. Upload directly to S3 via backend
      const uploadResponse = await this.request<{
        success: boolean;
        fileKey?: string;
        s3Url?: string;
        signedUrl?: string;
        message?: string;
        error?: string;
      }>('/orders/s3/upload', {
        method: 'POST',
        body: formData as any,
      });
      
      console.log('🚀 API: S3 upload response:', uploadResponse);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Failed to upload order image to S3');
      }

      return {
        success: true,
        orderImageUrl: uploadResponse.signedUrl || uploadResponse.s3Url,
        fileKey: uploadResponse.fileKey,
        s3Url: uploadResponse.s3Url
      };
      
    } catch (error: any) {
      console.error('🚀 API: S3 Order image upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload order image to S3'
      };
    }
  }

  // Get order image from S3
  async getOrderImageFromS3(fileKey: string): Promise<{
    success: boolean;
    imageUrl?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 API: Getting order image from S3 for fileKey:', fileKey);
      
      const imageUrl = `http://192.168.29.79:3001/orders/s3/image/${encodeURIComponent(fileKey)}`;
      
      return {
        success: true,
        imageUrl: imageUrl
      };
    } catch (error: any) {
      console.error('🚀 API: Error getting order image from S3:', error);
      return {
        success: false,
        error: error.message || 'Failed to get order image from S3'
      };
    }
  }

  // Refresh order image URL when it expires
  async refreshOrderImageUrl(fileKey: string): Promise<{
    success: boolean;
    signedUrl?: string;
    error?: string;
  }> {
    try {
      console.log('🚀 API: Refreshing order image URL for fileKey:', fileKey);
      
      const response = await this.request<any>('/orders/refresh-image-url', {
        method: 'POST',
        body: JSON.stringify({ fileKey }),
      });

      return response;
    } catch (error: any) {
      console.error('🚀 API: Error refreshing order image URL:', error);
      return {
        success: false,
        error: error.message || 'Failed to refresh order image URL'
      };
    }
  }

  // 🚀 S3 UPLOAD METHODS
  async getUploadUrl(fileName: string, fileType: string): Promise<{
    success: boolean;
    uploadUrl?: string;
    fileKey?: string;
    viewUrl?: string;
    publicUrl?: string;
    error?: string;
  }> {
    return this.request('/orders/upload-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
    });
  }

  async uploadToS3(uploadUrl: string, file: any): Promise<Response> {
    console.log('🚀 Uploading to S3:', {
      uploadUrl: uploadUrl.substring(0, 100) + '...',
      fileType: file.type,
      fileSize: file.size
    });
    
    return fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'image/jpeg',
      },
    });
  }

  async listUploadedImages(): Promise<{
    success: boolean;
    count?: number;
    images?: any[];
    error?: string;
  }> {
    return this.request('/orders/uploaded-images', {
      method: 'GET',
    });
  }

  async getViewUrl(fileKey: string): Promise<{
    success: boolean;
    viewUrl?: string;
    error?: string;
  }> {
    return this.request('/orders/view-url', {
      method: 'POST',
      body: JSON.stringify({ fileKey }),
    });
  }

  async refreshImageUrls(imageUrls: string[]): Promise<{
    success: boolean;
    refreshedUrls?: string[];
    error?: string;
  }> {
    return this.request('/orders/refresh-image-urls', {
      method: 'POST',
      body: JSON.stringify({ imageUrls }),
    });
  }
}

export const apiService = new ApiService();
export default apiService; 