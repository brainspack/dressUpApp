// components/Button.tsx
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TOptions } from 'i18next';

interface ButtonProps extends TouchableOpacityProps {
  title: string | { key: string; options?: TOptions };
  variant?: 'primary' | 'secondary';
}

const Button = ({ title, onPress, variant = "primary" }: ButtonProps) => {
  const { t } = useTranslation();

  const getTitle = () => {
    if (typeof title === 'string') {
      return title;
    }
    return t(title.key, title.options);
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: variant === 'primary' ? '#4A90E2' : '#ccc',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>{getTitle()}</Text>
    </TouchableOpacity>
  );
};

export default Button; 