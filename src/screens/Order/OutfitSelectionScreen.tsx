import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/api';
import { RegularText, TitleText } from '../../components/CustomText';
import Button from '../../components/Button';
import colors from '../../constants/colors';
import { styles } from './styles/OutfitSelectionScreenStyles';

// Define the OutfitType interface
interface OutfitType {
  id: string;
  name: string;
  gender: 'female' | 'male';
  category: string;
  icon: React.ReactNode;
}

type OutfitSelectionScreenNavigationProp = NativeStackNavigationProp<
  OrderStackParamList,
  'OutfitSelection'
>;

type OutfitSelectionScreenRouteProp = RouteProp<
  OrderStackParamList,
  'OutfitSelection'
>;

// Human-friendly labels for outfit names
const formatOutfitLabel = (raw: string): string => {
  const map: Record<string, string> = {
    'ethnic_jacket': 'Ethnic Jacket',
    'women_western_suit': 'Women Western Suit',
    'women_co_ord_set': 'Women Co-ord Set',
    'co_ord_set': 'Co-ord Set',
    'womenssuit': 'Women Suit',
    'saree+blouse': 'Saree + Blouse',
    'indo_western': 'Indo Western',
    'kurta_pajama': 'Kurta Pajama',
    'women_blazer': 'Women Blazer',
    'waistcost': 'Waistcoat',
    'nehrujacket': 'Nehru Jacket',
    'tshirt': 'T-Shirt',
  };
  const withoutCount = (raw || '').replace(/\s*\(\d+\)\s*$/, ''); // e.g., "shirt (1)" -> "shirt"
  if (map[withoutCount]) return map[withoutCount];
  const withSpaces = withoutCount.replace(/_/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const normalized = withSpaces.replace(/\bco ord set\b/i, 'Co-ord Set');
  return normalized
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ');
};

// Custom SVG Icons for each outfit type
const OutfitIcons = {
  // Traditional Indian Wear - Female
  saree: (
    <Image 
      source={require('../../assets/saree.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  kurti: (
    <Image 
      source={require('../../assets/kurti.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  camisole: (
    <Image 
      source={require('../../assets/camisole.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  ethnic_jacket: (
    <Image 
      source={require('../../assets/ethnic_jacket.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  jacket: (
    <Image 
      source={require('../../assets/jacket.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  nighty: (
    <Image 
      source={require('../../assets/nighty.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  slip: (
    <Image 
      source={require('../../assets/slip.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  skirt: (
    <Image 
      source={require('../../assets/skirt.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  shrug: (
    <Image 
      source={require('../../assets/shrug.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  cape: (
    <Image 
      source={require('../../assets/cape.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  top: (
    <Image 
      source={require('../../assets/top.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  women_western_suit: (
    <Image 
      source={require('../../assets/women_western_suit.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  jumpsuit: (
    <Image 
      source={require('../../assets/jumpsuit.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  kaftan: (
    <Image 
      source={require('../../assets/kaftan.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  women_blazer: (
    <Image 
      source={require('../../assets/women_blazer.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  women_co_ord_set: (
    <Image 
      source={require('../../assets/women_co_ord_set.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  sharara: (
    <Image 
      source={require('../../assets/sharara.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  lehenga: (
    <Image 
      source={require('../../assets/lehenga.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  underskirt: (
    <Image 
      source={require('../../assets/underskirt.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  womenssuit: (
    <Image 
      source={require('../../assets/womenssuit.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  gown: (
    <Image 
      source={require('../../assets/gown.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  sareeBlouse: (
    <Image 
      source={require('../../assets/saree+blouse.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  dress: (
    <Image 
      source={require('../../assets/dress.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  coOrdSet: (
    <Image 
      source={require('../../assets/co_ord_set.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  tshirt: (
    <Image 
      source={require('../../assets/tshirt.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  dhoti: (
    <Image 
      source={require('../../assets/dhoti.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  pajama: (
    <Image 
      source={require('../../assets/pajama.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  kurta: (
    <Image 
      source={require('../../assets/kurta.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  blazer: (
    <Image 
      source={require('../../assets/blazer.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  indoWestern: (
    <Image 
      source={require('../../assets/indo_western.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  sherwani: (
    <Image 
      source={require('../../assets/sherwani.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  waistcost: (
    <Image 
      source={require('../../assets/waistcost.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  nehrujacket: (
    <Image 
      source={require('../../assets/nehrujacket.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  shirt1: (
    <Image 
      source={require('../../assets/shirt (1).jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  pants: (
    <Image 
      source={require('../../assets/pants.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  kurtaPajama: (
    <Image 
      source={require('../../assets/kurta_pajama.png')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
  shirt: (
    <Image 
      source={require('../../assets/shirt.jpg')} 
      style={{ width: 50, height: 50, resizeMode: 'contain' }}
    />
  ),
};

// Get outfit types from orderTypeOptions.ts data with proper icons - ALL OPTIONS INCLUDED
const getFemaleOutfits = (): OutfitType[] => [
  { id: 'f1', name: 'saree', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.saree },
  { id: 'f2', name: 'kurti', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.kurti },
  { id: 'f3', name: 'camisole', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.camisole },
  { id: 'f4', name: 'ethnic_jacket', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.ethnic_jacket },
  { id: 'f5', name: 'jacket', gender: 'female', category: 'Western Wear', icon: OutfitIcons.jacket },
  { id: 'f6', name: 'nighty', gender: 'female', category: 'Night Wear', icon: OutfitIcons.nighty },
  { id: 'f7', name: 'slip', gender: 'female', category: 'Inner Wear', icon: OutfitIcons.slip },
  { id: 'f8', name: 'skirt', gender: 'female', category: 'Western Wear', icon: OutfitIcons.skirt },
  { id: 'f9', name: 'shrug', gender: 'female', category: 'Outerwear', icon: OutfitIcons.shrug },
  { id: 'f10', name: 'cape', gender: 'female', category: 'Outerwear', icon: OutfitIcons.cape },
  { id: 'f11', name: 'top', gender: 'female', category: 'Western Wear', icon: OutfitIcons.top },
  { id: 'f12', name: 'women_western_suit', gender: 'female', category: 'Western Wear', icon: OutfitIcons.women_western_suit },
  { id: 'f13', name: 'jumpsuit', gender: 'female', category: 'Western Wear', icon: OutfitIcons.jumpsuit },
  { id: 'f14', name: 'kaftan', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.kaftan },
  { id: 'f15', name: 'women_blazer', gender: 'female', category: 'Western Wear', icon: OutfitIcons.women_blazer },
  { id: 'f16', name: 'women_co_ord_set', gender: 'female', category: 'Western Wear', icon: OutfitIcons.women_co_ord_set },
  { id: 'f17', name: 'sharara', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.sharara },
  { id: 'f18', name: 'lehenga', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.lehenga },
  { id: 'f19', name: 'underskirt', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.underskirt },
  { id: 'f20', name: 'womenssuit', gender: 'female', category: 'Western Wear', icon: OutfitIcons.womenssuit },
  { id: 'f21', name: 'gown', gender: 'female', category: 'Western Wear', icon: OutfitIcons.gown },
  { id: 'f22', name: 'saree+blouse', gender: 'female', category: 'Traditional Wear', icon: OutfitIcons.sareeBlouse },
  { id: 'f23', name: 'dress', gender: 'female', category: 'Western Wear', icon: OutfitIcons.dress },
  
  { id: 'f24', name: 'tshirt', gender: 'female', category: 'Western Wear', icon: OutfitIcons.tshirt },
];

const getMaleOutfits = (): OutfitType[] => [
  { id: 'm1', name: 'dhoti', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.dhoti },
  { id: 'm2', name: 'pajama', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.pajama },
  { id: 'm3', name: 'kurta', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.kurta },
  { id: 'm4', name: 'blazer', gender: 'male', category: 'Western/Formal Wear', icon: OutfitIcons.blazer },
  { id: 'm5', name: 'indo_western', gender: 'male', category: 'Fusion Wear', icon: OutfitIcons.indoWestern },
  { id: 'm6', name: 'sherwani', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.sherwani },
  { id: 'm7', name: 'waistcost', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.waistcost },
  { id: 'm8', name: 'nehrujacket', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.nehrujacket },
  { id: 'm9', name: 'co_ord_set', gender: 'male', category: 'Western Wear', icon: OutfitIcons.coOrdSet },
  { id: 'm10', name: 'pants', gender: 'male', category: 'Western/Formal Wear', icon: OutfitIcons.pants },
  { id: 'm11', name: 'kurta_pajama', gender: 'male', category: 'Traditional Wear', icon: OutfitIcons.kurtaPajama },
];

const OutfitSelectionScreen = () => {
  const navigation = useNavigation<OutfitSelectionScreenNavigationProp>();
  const route = useRoute<OutfitSelectionScreenRouteProp>();
  const { t } = useTranslation();
  
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [outfitSearchQuery, setOutfitSearchQuery] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState(route.params?.customerName || '');
  const [customerCode, setCustomerCode] = useState<string>('');
  
  // Debug: Log when customerNameInput changes
  useEffect(() => {
    console.log('OutfitSelection - customerNameInput changed to:', customerNameInput);
  }, [customerNameInput]);

  // Create or load a friendly customer code like CUS-0001 and persist it locally
  useEffect(() => {
    const ensureCustomerCode = async () => {
      try {
        const cid = route.params?.customerId;
        if (!cid) return;
        // Prefer mobile number from API if available
        try {
          const customer = await apiService.getCustomerById(cid);
          if (customer?.mobileNumber) {
            setCustomerCode(customer.mobileNumber);
            return;
          }
        } catch {}
        // Fallback to any previously cached phone for this id
        const phoneKey = `customerPhone:${cid}`;
        const cachedPhone = await AsyncStorage.getItem(phoneKey);
        if (cachedPhone) {
          setCustomerCode(cachedPhone);
          return;
        }
        // Final fallback to deterministic CUS-0001 if no phone found
        const counterKey = 'customerCodeCounter';
        const raw = await AsyncStorage.getItem(counterKey);
        const current = raw ? parseInt(raw, 10) : 0;
        const next = current + 1;
        const code = `CUS-${String(next).padStart(4, '0')}`;
        await AsyncStorage.multiSet([[counterKey, String(next)], [phoneKey, code]]);
        setCustomerCode(code);
      } catch {
        // Fallback: deterministic short code from id hash
        const cid = route.params?.customerId || '';
        const short = Math.abs(Array.from(cid).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
        setCustomerCode(`CUS-${String(short).padStart(4, '0')}`);
      }
    };
    ensureCustomerCode();
  }, [route.params?.customerId]);

  const handleOutfitSelect = (outfit: OutfitType) => {
    try {
      // Validate customer name input
      if (!customerNameInput.trim()) {
        Alert.alert(
          t('order.error'),
          t('order.pleaseEnterCustomerName'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      console.log('Outfit selected:', outfit);
      console.log('Customer name input:', customerNameInput);
      console.log('Route params:', route.params);
      console.log('Existing outfits:', route.params?.existingOutfits);

      // Get existing outfits or start with empty array
      const existingOutfitsList = route.params?.existingOutfits || [];
      
      // Check if outfit is already selected
      const isAlreadySelected = existingOutfitsList.some(existing => existing.name === outfit.name);
      
      if (isAlreadySelected) {
        Alert.alert(
          t('order.info'),
          `${outfit.name} is already selected!`,
          [{ text: t('common.ok') }]
        );
        return;
      }
      const newChip = {
        id: outfit.id || `${outfit.name}-${Date.now()}`,
        name: outfit.name,
        type: outfit.name,
        image: getOutfitImageSource(outfit.name),
        gender: outfit.gender,
        _orderType: selectedGender === 'female' || selectedGender === 'male' ? (route.params?.orderType || 'stitching') : (route.params?.orderType || 'stitching'),
      } as any;
      const combined = [...existingOutfitsList, newChip];
      navigation.navigate('OrderSummary', {
        customerId: route.params?.customerId || '',
        shopId: route.params?.shopId || '',
        customerName: customerNameInput,
        selectedOutfits: combined,
      });
      
    } catch (error) {
      console.error('Error in handleOutfitSelect:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', 'Failed to select outfit: ' + errorMessage);
    }
  };

  // Helper function to get outfit image source
  const getOutfitImageSource = (outfitName: string) => {
    const outfitImageMap: { [key: string]: any } = {
      saree: require('../../assets/saree.png'),
      kurti: require('../../assets/kurti.png'),
      camisole: require('../../assets/camisole.png'),
      ethnic_jacket: require('../../assets/ethnic_jacket.png'),
      jacket: require('../../assets/jacket.png'),
      nighty: require('../../assets/nighty.png'),
      slip: require('../../assets/slip.png'),
      skirt: require('../../assets/skirt.png'),
      shrug: require('../../assets/shrug.png'),
      cape: require('../../assets/cape.png'),
      top: require('../../assets/top.png'),
      women_western_suit: require('../../assets/women_western_suit.png'),
      jumpsuit: require('../../assets/jumpsuit.png'),
      kaftan: require('../../assets/kaftan.png'),
      women_blazer: require('../../assets/women_blazer.png'),
      women_co_ord_set: require('../../assets/women_co_ord_set.png'),
      sharara: require('../../assets/sharara.jpg'),
      lehenga: require('../../assets/lehenga.jpg'),
      underskirt: require('../../assets/underskirt.jpg'),
      womenssuit: require('../../assets/womenssuit.jpg'),
      gown: require('../../assets/gown.png'),
      'saree+blouse': require('../../assets/saree+blouse.jpg'),
      dress: require('../../assets/dress.jpg'),
      co_ord_set: require('../../assets/co_ord_set.png'),
      tshirt: require('../../assets/tshirt.png'),
      dhoti: require('../../assets/dhoti.png'),
      pajama: require('../../assets/pajama.png'),
      kurta: require('../../assets/kurta.png'),
      blazer: require('../../assets/blazer.png'),
      indo_western: require('../../assets/indo_western.jpg'),
      sherwani: require('../../assets/sherwani.jpg'),
      waistcost: require('../../assets/waistcost.jpg'),
      nehrujacket: require('../../assets/nehrujacket.jpg'),
      'shirt (1)': require('../../assets/shirt (1).jpg'),
      pants: require('../../assets/pants.jpg'),
      kurta_pajama: require('../../assets/kurta_pajama.png'),
      shirt: require('../../assets/shirt.jpg')
    };
    const key = (outfitName || '').replace(/\s*\(\d+\)\s*$/, '');
    const imageSource = outfitImageMap[key];
    if (imageSource) {
      console.log(`Found image for ${outfitName}:`, imageSource);
      return imageSource;
    } else {
      console.log(`No image found for ${outfitName}, using fallback`);
      return require('../../assets/dress.jpg'); // fallback
    }
  };

  const getOutfitsToShow = () => {
    const outfits = selectedGender === 'female' ? getFemaleOutfits() : getMaleOutfits();
    if (!outfitSearchQuery.trim()) return outfits;
    return outfits.filter(outfit =>
      outfit.name.toLowerCase().includes(outfitSearchQuery.toLowerCase()) ||
      outfit.category?.toLowerCase().includes(outfitSearchQuery.toLowerCase())
    );
  };

  // Render outfit item for the grid layout
  const renderOutfitItem = ({ item, index }: { item: OutfitType; index: number }) => {
    const outfits = getOutfitsToShow();
    
    return (
      <TouchableOpacity 
        style={styles.outfitGridItem}
        onPress={() => handleOutfitSelect(item)}
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('OrderList')} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <TitleText style={styles.headerTitle}>{t('order.createOrder')}</TitleText>
        <View style={{ width: 24 }} />
      </View>

      {/* Customer Info Card - Conditional based on route params */}
      {route.params?.customerName ? (
        // Pre-filled customer info (from CustomerList)
        <View style={styles.customerInfoCard}>
          <View style={styles.customerAvatar}>
            <RegularText style={styles.customerInitials}>
              {route.params.customerName.charAt(0).toUpperCase()}
            </RegularText>
          </View>
          <View style={styles.customerDetails}>
            <RegularText style={styles.customerNameText}>{route.params.customerName}</RegularText>
            {!!customerCode && (
              <RegularText style={styles.customerPhone}>{customerCode}</RegularText>
            )}
          </View>
        </View>
      ) : (
        // Blank input for customer name (from OrderList)
        <View style={styles.customerInfoCard}>
          <View style={styles.customerAvatar}>
            <Icon name="person" size={24} color="#fff" />
          </View>
          <View style={styles.customerDetails}>
            <RegularText style={styles.customerNameLabel}>{t('order.customerName')}</RegularText>
            <TextInput
              style={styles.customerNameInput}
              placeholder={t('order.enterCustomerName')}
              placeholderTextColor="#9ca3af"
              value={customerNameInput}
              onChangeText={setCustomerNameInput}
            />
          </View>
        </View>
      )}

      <TitleText style={styles.selectOutfitTitle}>{t('order.selectOutfitType')}</TitleText>

    

      {/* Gender Filter */}
      <View style={styles.genderFilter}>
        <Button
          title={t('order.female')}
          variant="gradient"
          onPress={() => setSelectedGender('female')}
          gradientColors={selectedGender === 'female' 
            ? [colors.brand, colors.brandDark, colors.blueDark]
            : ['#f3f4f6', '#e5e7eb']
          }
          textStyle={[
            styles.genderButtonText,
            selectedGender === 'female' && styles.genderButtonTextActive,
          ]}
          style={styles.genderButton}
          height={48}
        />
        <Button
          title={t('order.male')}
          variant="gradient"
          onPress={() => setSelectedGender('male')}
          gradientColors={selectedGender === 'male' 
            ? [colors.brand, colors.brandDark, colors.blueDark]
            : ['#f3f4f6', '#e5e7eb']
          }
          textStyle={[
            styles.genderButtonText,
            selectedGender === 'male' && styles.genderButtonTextActive,
          ]}
          style={styles.genderButton}
          height={48}
        />
      </View>

      {/* Outfit Grid */}
      <FlatList
        data={getOutfitsToShow()}
        renderItem={renderOutfitItem}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.outfitGrid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.outfitRow}
      />
    </View>
  );
};


export default OutfitSelectionScreen;
