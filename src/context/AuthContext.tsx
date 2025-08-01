import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  loading: boolean;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      let timeout = setTimeout(() => setLoading(false), 3000); // fallback after 3s
      try {
        const token = await AsyncStorage.getItem('accessToken');
        setAccessToken(token);
        setIsAuthenticated(!!token);
      } catch (e) {
        setIsAuthenticated(false);
        setAccessToken(null);
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
    } else {
      await AsyncStorage.removeItem('accessToken');
      console.log('AuthContext: Token removed from AsyncStorage');
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      loading, 
      accessToken, 
      setAccessToken: handleSetAccessToken 
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