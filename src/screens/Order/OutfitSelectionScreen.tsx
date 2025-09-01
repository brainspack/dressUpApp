import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OrderStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/api';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';

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
  { id: 'f24', name: 'co_ord_set', gender: 'female', category: 'Western Wear', icon: OutfitIcons.coOrdSet },
  { id: 'f25', name: 'tshirt', gender: 'female', category: 'Western Wear', icon: OutfitIcons.tshirt },
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
      const existingOutfits = route.params?.existingOutfits || [];
      
      // Check if outfit is already selected
      const isAlreadySelected = existingOutfits.some(existing => existing.name === outfit.name);
      
      if (isAlreadySelected) {
        Alert.alert(
          t('order.info'),
          `${outfit.name} is already selected!`,
          [{ text: t('common.ok') }]
        );
        return;
      }

    // Go to AddOrder form to enter price, then return with totals
      navigation.navigate('AddOrder', {
        customerId: route.params?.customerId || '',
        shopId: route.params?.shopId || '',
        customerName: customerNameInput,
        outfitId: outfit.id || 'new',
        outfitType: outfit.name,
        gender: outfit.gender,
        onAddComplete: (data: any) => {
          const newOutfits = [
            ...selectedOutfits,
            ...data.items.map((item: any) => ({ name: item.name, price: (Number(item.price)||0) * (Number(item.quantity)||1) })),
            ...data.clothes.map((cloth: any) => ({ name: cloth.type, price: Number(cloth.materialCost)||0 }))
          ];
          setSelectedOutfits(newOutfits);
          const total = newOutfits.reduce((sum, o) => sum + (Number(o.price)||0), 0);
          setTotalFromForms(total);
        }
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
    
    const imageSource = outfitImageMap[outfitName];
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
          {item.name}
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
        <TouchableOpacity
          style={styles.genderButton}
          onPress={() => setSelectedGender('female')}
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
          onPress={() => setSelectedGender('male')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontStyle: 'normal',
  },
  
  // Customer Info Card - Conditional based on route params
  customerInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    margin: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitials: {
    color: '#fff',
    fontSize: 16,
  },
  customerDetails: {
    flex: 1,
  },
  customerNameLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  customerNameInput: {
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  customerNameText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  selectOutfitTitle: {
    fontSize: 18,
    color: '#1f2937',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  
  // Search Bar
  outfitSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outfitSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  searchIcon: {
    marginRight: 8,
  },
  
  // Gender Filter
  genderFilter: {
    flexDirection: 'row',
    padding: 6,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  genderButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  genderButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  genderButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  
  // Outfit Grid
  outfitGrid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  outfitRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  outfitGridItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitGridIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  outfitGridName: {
    fontSize: 11,
    color: '#1f2937',
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
});

export default OutfitSelectionScreen;
