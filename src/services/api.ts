import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 to access host machine's localhost
// For iOS simulator, use localhost
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
}

export const apiService = new ApiService();
export default apiService; 