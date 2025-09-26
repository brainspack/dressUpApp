import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import colors from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'action' | 'stats';
}

const Card = ({ children, style, variant = 'default' }: CardProps) => {
  return (
    <View style={[styles.card, styles[variant], style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  default: {
    padding: 20,
  },
  action: {
    paddingVertical: 24,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 34, 69, 0.95)', // Made darker from 0.85 to 0.95
    borderRadius: 16, // Added explicit border radius to match the card
  },
  stats: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Card;
