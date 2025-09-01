import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserInfo {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  shopId?: string;
  role?: string;
  profileImage?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  loading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
  updateUserProfile: (updates: Partial<UserInfo>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      let timeout = setTimeout(() => setLoading(false), 3000); // fallback after 3s
      try {
        const token = await AsyncStorage.getItem('accessToken');
        const storedUserInfo = await AsyncStorage.getItem('userInfo');
        
        setAccessToken(token);
        setIsAuthenticated(!!token);
        
        if (token && storedUserInfo) {
          try {
            // Try to load stored user info
            const userData = JSON.parse(storedUserInfo);
            setUserInfo(userData);
          } catch (e) {
            // If stored data is corrupted, decode from token
            try {
              const tokenPayload = JSON.parse(atob(token.split('.')[1]));
              setUserInfo(tokenPayload);
            } catch (tokenError) {
              console.error('Failed to decode token:', tokenError);
            }
          }
        } else if (token) {
          // Decode user info from token if no stored data
          try {
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setUserInfo(tokenPayload);
            // Save to storage for next time
            await AsyncStorage.setItem('userInfo', JSON.stringify(tokenPayload));
          } catch (tokenError) {
            console.error('Failed to decode token:', tokenError);
          }
        }
      } catch (e) {
        setIsAuthenticated(false);
        setAccessToken(null);
        setUserInfo(null);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSetAccessToken = async (token: string | null) => {
    console.log('AuthContext: Setting access token:', token ? 'Token provided' : 'No token');
    setAccessToken(token);
    if (token) {
      await AsyncStorage.setItem('accessToken', token);
      console.log('AuthContext: Token saved to AsyncStorage');
      setIsAuthenticated(true);
      console.log('AuthContext: isAuthenticated set to true');
      
      // Decode and save user info from token
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserInfo(tokenPayload);
        await AsyncStorage.setItem('userInfo', JSON.stringify(tokenPayload));
        console.log('AuthContext: User info saved:', tokenPayload);
      } catch (error) {
        console.error('AuthContext: Failed to decode token:', error);
      }
    } else {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('userInfo');
      console.log('AuthContext: Token and user info removed from AsyncStorage');
      setIsAuthenticated(false);
      setUserInfo(null);
      console.log('AuthContext: isAuthenticated set to false');
    }
  };

  const updateUserProfile = async (updates: Partial<UserInfo>) => {
    if (!userInfo) return;
    
    const updatedUserInfo = { ...userInfo, ...updates };
    setUserInfo(updatedUserInfo);
    await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
    console.log('AuthContext: User profile updated:', updatedUserInfo);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      loading, 
      accessToken, 
      setAccessToken: handleSetAccessToken,
      userInfo,
      setUserInfo,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 