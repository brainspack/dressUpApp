import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type: ToastType;
  duration?: number;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  duration = 3000,
  onHide,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [translateY, opacity, onHide]);

  useEffect(() => {
    if (visible) {
      // Show animation - start from bottom (positive translateY)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, opacity, translateY]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.7)', // Black transparent background
          icon: CheckCircle,
          iconColor: '#2DBE91', // App's green color
          textColor: '#FFFFFF', // White text for better visibility
        };
      case 'error':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black transparent background
          icon: XCircle,
          iconColor: '#EF4444',
          textColor: '#FFFFFF', // White text for better visibility
        };
      case 'warning':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black transparent background
          icon: AlertCircle,
          iconColor: '#F59E0B',
          textColor: '#FFFFFF', // White text for better visibility
        };
      case 'info':
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black transparent background
          icon: Info,
          iconColor: '#3B82F6',
          textColor: '#FFFFFF', // White text for better visibility
        };
      default:
        return {
          backgroundColor: 'rgba(0, 0, 0, 0.8)', // Black transparent background
          icon: CheckCircle,
          iconColor: '#2DBE91', // App's green color
          textColor: '#FFFFFF', // White text for better visibility
        };
    }
  };

  if (!visible) {
    return null;
  }

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: config.backgroundColor }]}>
        <IconComponent size={20} color={config.iconColor} />
        <Text style={[styles.message, { color: config.textColor }]}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
});

export default Toast;
