import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { RegularText } from '../CustomText';
import colors from '../../constants/colors';
import { styles } from '../../screens/Order/styles/OutfitSelectionScreenStyles';

interface GenderFilterProps {
  selectedGender: 'female' | 'male';
  onGenderChange: (gender: 'female' | 'male') => void;
}

export const GenderFilter: React.FC<GenderFilterProps> = ({
  selectedGender,
  onGenderChange,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.genderFilter}>
      <TouchableOpacity
        style={styles.genderButton}
        onPress={() => onGenderChange('female')}
      >
        <LinearGradient
          colors={selectedGender === 'female' 
            ? [colors.brand, colors.brandDark, colors.blueDark]
            : ['#f3f4f6', '#e5e7eb']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.genderButtonGradient}
        >
          <RegularText style={[
            styles.genderButtonText,
            selectedGender === 'female' && styles.genderButtonTextActive,
          ]}>{t('order.female')}</RegularText>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.genderButton}
        onPress={() => onGenderChange('male')}
      >
        <LinearGradient
          colors={selectedGender === 'male' 
            ? [colors.brand, colors.brandDark, colors.blueDark]
            : ['#f3f4f6', '#e5e7eb']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.genderButtonGradient}
        >
          <RegularText style={[
            styles.genderButtonText,
            selectedGender === 'male' && styles.genderButtonTextActive,
          ]}>{t('order.male')}</RegularText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default GenderFilter;

