// components/Button.tsx
import { Text, TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle, View, StyleSheet } from 'react-native';
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
  };

  const containerByVariant: Record<NonNullable<ButtonProps['variant']>, ViewStyle> = {
    primary: { backgroundColor: '#4A90E2' },
    secondary: { backgroundColor: '#ccc' },
    light: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      borderWidth: 1,
      borderColor: 'rgba(85,173,136,0.25)',
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
      <View style={[{ borderRadius: 12, overflow: 'hidden', height }, style] as StyleProp<ViewStyle>}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 2}}
          style={StyleSheet.absoluteFillObject}
        />
        <TouchableOpacity
          style={[styles.overlay, { height }]}
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
      style={[baseContainer, containerByVariant[variant], { height }, style]}
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
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

export default Button; 