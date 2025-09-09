import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { RegularText } from '../CustomText';
import { OutfitType, formatOutfitLabel } from '../../utils/outfitData';
import { styles } from '../../screens/Order/styles/OutfitSelectionScreenStyles';

interface OutfitGridItemProps {
  item: OutfitType;
  onPress: (outfit: OutfitType) => void;
}

export const OutfitGridItem: React.FC<OutfitGridItemProps> = ({
  item,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.outfitGridItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.outfitGridIconContainer}>
        {item.icon}
      </View>
      <RegularText 
        style={styles.outfitGridName}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {formatOutfitLabel(item.name)}
      </RegularText>
    </TouchableOpacity>
  );
};

export default OutfitGridItem;

