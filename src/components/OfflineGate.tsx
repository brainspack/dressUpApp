import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import apiService from '../services/api';

type Props = {
  children: React.ReactNode;
};

const NoInternetScreen = ({ onRetry, isLoading }: { onRetry: () => void; isLoading: boolean }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📡</Text>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.subtitle}>Please check your connection and try again.</Text>
        <TouchableOpacity style={styles.button} onPress={onRetry} disabled={isLoading}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.buttonText, { marginLeft: 8 }]}>Checking...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Retry</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function OfflineGate({ children }: Props) {
  const [isOffline, setIsOffline] = React.useState<boolean>(false);
  const [checking, setChecking] = React.useState<boolean>(false); // Changed to false - no initial loading
  const [lastApiCheck, setLastApiCheck] = React.useState<number>(0);
  const [hasShownOffline, setHasShownOffline] = React.useState<boolean>(false);
  const [retryLoading, setRetryLoading] = React.useState<boolean>(false);


  // Test actual internet connectivity (not just local API)
  const testInternetConnectivity = React.useCallback(async () => {
    try {
      
      // Use different approach for iOS vs Android
      const testUrls = Platform.OS === 'ios' 
        ? [
            'https://www.apple.com',
            'https://www.google.com',
            'https://httpbin.org/get',
            'https://api.github.com',
            'https://www.cloudflare.com',
            'https://www.microsoft.com'
          ] // More iOS-friendly URLs for better reliability
        : ['https://www.google.com', 'https://httpbin.org/get']; // Android URLs
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), Platform.OS === 'ios' ? 5000 : 3000); // Longer timeout for iOS
      
      // Try multiple URLs for better reliability
      for (const url of testUrls) {
        try {
          const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache',
            }
          });
          
          if (response.ok || response.status < 500) {
            clearTimeout(timeoutId);
            return true;
          } else {
          }
        } catch (urlError) {
          continue; // Try next URL
        }
      }
      
      clearTimeout(timeoutId);
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const evaluate = React.useCallback(async (state: any) => {
    
    // For iOS, use a more aggressive approach to detect restored connections
    if (Platform.OS === 'ios') {
      
      // Always test internet connectivity on iOS since NetInfo can be unreliable
      const internetConnected = await testInternetConnectivity();
      
      const offline = !internetConnected;
      
      if (offline && !isOffline) {
        setHasShownOffline(true);
      } else if (!offline && (isOffline || hasShownOffline)) {
        setHasShownOffline(false);
      }
      
      setIsOffline(offline);
      return;
    }
    
    // For Android, use internet connectivity test
    const internetConnected = await testInternetConnectivity();
    
    const newOfflineState = !internetConnected;
    
    
    if (newOfflineState && !isOffline) {
      setHasShownOffline(true);
    } else if (!newOfflineState && (isOffline || hasShownOffline)) {
      setHasShownOffline(false);
    }
    
    setIsOffline(newOfflineState);
  }, [testInternetConnectivity, isOffline]);

  const checkNow = React.useCallback(async () => {
    setChecking(true);
    setRetryLoading(true);
    
    // Minimum loading time to show the loader properly
    const minLoadingTime = 2000; // 2 seconds minimum
    const startTime = Date.now();
    
    try {
      // Test internet connectivity multiple times for retry to be more reliable
      let internetConnected = false;
      
      // Try more times on iOS for better reliability
      const maxAttempts = Platform.OS === 'ios' ? 5 : 3;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        internetConnected = await testInternetConnectivity();
        
        if (internetConnected) {
          break; // Success, exit loop
        }
        
        // Smaller delay between attempts on iOS
        if (attempt < maxAttempts) {
          const delay = Platform.OS === 'ios' ? 300 : 500;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      
      if (internetConnected) {
        setIsOffline(false);
        setHasShownOffline(false);
        
        // Also fetch NetInfo state for completeness
        try {
          const state = await NetInfo.fetch();
        } catch (netInfoError) {
        }
      } else {
        setIsOffline(true);
        setHasShownOffline(true);
        
        // Also check NetInfo state
        try {
          const state = await NetInfo.fetch();
        } catch (netInfoError) {
        }
      }
    } catch (error) {
      console.error('🌐 Error during retry check:', error);
      setIsOffline(true); // Assume offline if we can't check
      setHasShownOffline(true);
    } finally {
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      
      setTimeout(() => {
        setChecking(false);
        setRetryLoading(false);
      }, remainingTime);
    }
  }, [testInternetConnectivity]);

  // Periodic API connectivity check (fallback for when NetInfo fails)
  React.useEffect(() => {
    const checkInterval = Platform.OS === 'ios' ? 2000 : 1000; // More aggressive on iOS
    const interval = setInterval(async () => {
      const now = Date.now();
      // Only check if we haven't checked recently
      const minInterval = Platform.OS === 'ios' ? 1000 : 1000;
      if (now - lastApiCheck > minInterval) {
        setLastApiCheck(now);
        const isConnected = await testInternetConnectivity();
        
        if (!isConnected && !isOffline) {
          setIsOffline(true);
          setHasShownOffline(true);
        } else if (isConnected && (isOffline || hasShownOffline)) {
          setIsOffline(false);
          setHasShownOffline(false);
        }
      }
    }, checkInterval);

    return () => {
      clearInterval(interval);
    };
  }, [testInternetConnectivity, lastApiCheck, isOffline]);

  // Connect API service to offline detection
  React.useEffect(() => {
    const handleApiOffline = () => {
      setIsOffline(true);
      setHasShownOffline(true);
    };

    apiService.setOfflineCallback(handleApiOffline);
    
    return () => {
      apiService.setOfflineCallback(null);
    };
  }, []);

  React.useEffect(() => {
    
    // Test NetInfo immediately without showing loading state
    NetInfo.fetch().then(state => {
      evaluate(state);
    }).catch(error => {
      console.error(' NetInfo fetch error:', error);
      setIsOffline(true); // Assume offline if we can't check
      setHasShownOffline(true);
    });
    
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      
      // For iOS, be more responsive to any connection changes
      if (Platform.OS === 'ios') {
        const internetConnected = await testInternetConnectivity();
        
        if (internetConnected && (isOffline || hasShownOffline)) {
          setIsOffline(false);
          setHasShownOffline(false);
          return;
        } else if (!internetConnected && !isOffline) {
          setIsOffline(true);
          setHasShownOffline(true);
          return;
        }
      }
      
      await evaluate(state);
    });
    return () => {
      unsubscribe();
    };
  }, [evaluate, testInternetConnectivity, isOffline, hasShownOffline]);

  // iOS-specific: Check connectivity when app comes to foreground
  React.useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && (isOffline || hasShownOffline)) {
        // Small delay to ensure network is ready
        setTimeout(async () => {
          const internetConnected = await testInternetConnectivity();
          if (internetConnected) {
            setIsOffline(false);
            setHasShownOffline(false);
          }
        }, 1000);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [testInternetConnectivity, isOffline, hasShownOffline]);



  // Show loading overlay when retry is pressed (highest priority)
  if (retryLoading) {
    return (
      <View style={{ flex: 1 }}>
        {children}
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#2DBE91" />
            <Text style={styles.loadingText}>Checking connection...</Text>
          </View>
        </View>
      </View>
    );
  }
  
  if (isOffline || hasShownOffline) {
    return <NoInternetScreen onRetry={checkNow} isLoading={retryLoading} />;
  }
  
  
  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2DBE91',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
});


