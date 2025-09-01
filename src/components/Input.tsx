import React from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet, StyleProp, TextStyle, ViewStyle } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  // New props
  variant?: 'boxed' | 'underline';
  light?: boolean; // when true, renders text/labels suitable for dark backgrounds
}

const Input = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  variant = 'boxed',
  light = false,
  ...props
}: InputProps) => {
  const isUnderline = variant === 'underline';
  const placeholderColor = props.placeholderTextColor ?? (light ? '#ffffff' : '#999');

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, light && styles.labelLight, labelStyle]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          isUnderline && styles.inputUnderline,
          light && (isUnderline ? styles.inputUnderlineLight : styles.inputLight),
          props.multiline && styles.multilineInput,
          inputStyle,
        ]}
        placeholderTextColor={placeholderColor}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  labelLight: {
    color: '#ffffff',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputLight: {
    color: '#ffffff',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.6)',
  },
  inputUnderline: {
    height: 42,
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderBottomWidth: 1.25,
    borderBottomColor: '#ccc',
  },
  inputUnderlineLight: {
    color: '#ffffff',
    borderBottomColor: 'rgba(255,255,255,0.9)',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Input; 