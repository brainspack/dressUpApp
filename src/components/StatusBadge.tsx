import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge = ({ status, label, size = 'medium' }: StatusBadgeProps) => {
  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'success':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'error':
        return '#FF3B30';
      case 'info':
        return '#007AFF';
      case 'pending':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusBackground = (status: StatusType) => {
    switch (status) {
      case 'success':
        return '#E8F5E9';
      case 'warning':
        return '#FFF3E0';
      case 'error':
        return '#FFEBEE';
      case 'info':
        return '#E3F2FD';
      case 'pending':
        return '#F5F5F5';
      default:
        return '#F5F5F5';
    }
  };

  return (
    <View style={[
      styles.container,
      styles[`${size}Container`],
      { backgroundColor: getStatusBackground(status) }
    ]}>
      <View style={[
        styles.dot,
        styles[`${size}Dot`],
        { backgroundColor: getStatusColor(status) }
      ]} />
      <Text style={[
        styles.label,
        styles[`${size}Label`],
        { color: getStatusColor(status) }
      ]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 8,
  },
  dot: {
    borderRadius: 4,
    marginRight: 4,
  },
  label: {
    fontWeight: '500',
  },
  // Small size
  smallContainer: {
    height: 20,
    paddingHorizontal: 6,
  },
  smallDot: {
    width: 6,
    height: 6,
    marginRight: 3,
  },
  smallLabel: {
    fontSize: 10,
  },
  // Medium size
  mediumContainer: {
    height: 24,
    paddingHorizontal: 8,
  },
  mediumDot: {
    width: 8,
    height: 8,
    marginRight: 4,
  },
  mediumLabel: {
    fontSize: 12,
  },
  // Large size
  largeContainer: {
    height: 32,
    paddingHorizontal: 12,
  },
  largeDot: {
    width: 10,
    height: 10,
    marginRight: 6,
  },
  largeLabel: {
    fontSize: 14,
  },
});

export default StatusBadge; 