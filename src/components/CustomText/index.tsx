import React from 'react';
import { Text, StyleSheet, TextProps, Platform } from 'react-native';

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
  style?: object;
}

export const RegularText: React.FC<CustomTextProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.regularText, style]} {...props}>
      {children}
    </Text>
  );
};

export const TitleText: React.FC<CustomTextProps> = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.titleText, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  regularText: {
    fontSize: 14,
    // Use system font as fallback
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    fontStyle: 'italic',
    // Use system font as fallback
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
