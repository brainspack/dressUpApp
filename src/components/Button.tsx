// components/Button.tsx
import { Text, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle, View, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TOptions } from 'i18next';
import LinearGradient from 'react-native-linear-gradient';

interface ButtonProps extends TouchableOpacityProps {
  title: string | { key: string; options?: TOptions };
  variant?: 'primary' | 'secondary' | 'light' | 'green' | 'gradient';
  textStyle?: StyleProp<TextStyle>;
  height?: number;
  gradientColors?: string[];
  icon?: React.ReactNode;
}

const Button = ({ title, onPress, variant = 'primary', style, textStyle, height = 56, gradientColors = ['#229B73', '#1a8f6e', '#000000'], icon, disabled, ...rest }: ButtonProps) => {
  const { t } = useTranslation();

  const getTitle = () => {
    if (typeof title === 'string') {
      return title;
    }
    return t(title.key, title.options);
  };

  const baseContainer: ViewStyle = {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure consistent height across platforms
    minHeight: height,
  };

  const containerByVariant: Record<NonNullable<ButtonProps['variant']>, ViewStyle> = {
    primary: { backgroundColor: '#4A90E2' },
    secondary: { backgroundColor: '#ccc' },
    light: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(170, 177, 174, 0.25)',
    },
    green: { backgroundColor: '#2DBE91' },
    gradient: {},
  };

  const textByVariant: Record<NonNullable<ButtonProps['variant']>, TextStyle> = {
    primary: { color: '#fff', fontWeight: '700' },
    secondary: { color: '#333', fontWeight: '600' },
    light: { color: '#2DBE91', fontWeight: '800' },
    green: { color: '#fff', fontWeight: '800' },
    gradient: { color: '#fff', fontWeight: '800' },
  };

  if (variant === 'gradient') {
    return (
      <View style={[
        { 
          borderRadius: 12, 
          overflow: 'hidden', 
          height,
          minHeight: height,
          // Platform-specific styling for gradient buttons
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            },
            android: {
              elevation: 4,
            },
          }),
        }, 
        style
      ] as StyleProp<ViewStyle>}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1}}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[styles.overlay, { height, minHeight: height }]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
          {...rest}
        >
          <View style={styles.buttonContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[textByVariant[variant], textStyle]}>{getTitle()}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[baseContainer, containerByVariant[variant], { height, minHeight: height }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      {...rest}
    >
      <View style={styles.buttonContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[textByVariant[variant], textStyle]}>{getTitle()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button; 