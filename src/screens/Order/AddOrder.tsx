import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { OrderStatus } from '../../types/order';
import StatusDropdown from '../../components/StatusDropdown';
import { OrderStackParamList } from '../../navigation/types';
import apiService from '../../services/api';
import orderCache from '../../services/orderCache';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';

interface Cloth {
  id: string;
  type: string;
  color?: string | null;
  fabric?: string | null;
  materialCost: number;
  designNotes?: string;
  imageUrls: string[];
  imageData?: string[]; // ✅ Add imageData field
  videoUrls: string[];
}

interface OrderFormItem {
  id: string;
  name: string;
  quantity: string;  // Use string for form input
  price: string;     // Use string for form input
  notes: string;
  color?: string;
  fabric?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes: string;
  color?: string;
  fabric?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

const AddOrder = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OrderStackParamList, 'AddOrder'>>();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    items: [] as OrderItem[],
    clothes: [] as Cloth[],
    status: 'pending' as OrderStatus,
    notes: '',
    tailorName: '',
    tailorNumber: '',
    deliveryDate: '',
    trialDate: '',
    orderType: route.params?.orderType || 'stitching',
    alterationPrice: '',
    measurements: {} as Record<string, {
      height?: number;
      chest?: number;
      waist?: number;
      hip?: number;
      shoulder?: number;
      sleeveLength?: number;
      inseam?: number;
      neck?: number;
      armhole?: number;
      bicep?: number;
      wrist?: number;
      outseam?: number;
      thigh?: number;
      knee?: number;
      calf?: number;
      ankle?: number;
    }>,
  });
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isClothModalVisible, setIsClothModalVisible] = useState(false);
  const [isMeasurementModalVisible, setIsMeasurementModalVisible] = useState(false);
  const [isStatusDropdownVisible, setIsStatusDropdownVisible] = useState(false);
  const [selectedMeasurementField, setSelectedMeasurementField] = useState('chest');
  const [showDeliveryDatePicker, setShowDeliveryDatePicker] = useState(false);
  const [showTrialDatePicker, setShowTrialDatePicker] = useState(false);
  const [deliveryDateObj, setDeliveryDateObj] = useState<Date>(new Date());
  const [trialDateObj, setTrialDateObj] = useState<Date>(new Date());
  const [clothImages, setClothImages] = useState<string[]>([]);
  
  // 🚀 FIXED: Image upload handler for cloth images with base64 data
  const handleClothImageUpload = async () => {
    try {
      console.log('[AddOrder] Starting image upload...');
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.5, // 🚀 REDUCED: Lower quality to reduce file size
        maxWidth: 800, // 🚀 ADDED: Resize image to max 800px width
        maxHeight: 800, // 🚀 ADDED: Resize image to max 800px height
        includeBase64: true, // ✅ CRITICAL: Enable base64 for database storage
      });

      console.log('[AddOrder] Image picker result:', {
        didCancel: result.didCancel,
        assets: result.assets?.length || 0,
        errorMessage: result.errorMessage
      });

      if (!result.didCancel && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        console.log('[AddOrder] Selected image asset:', {
          uri: asset.uri,
          hasBase64: !!asset.base64,
          base64Length: asset.base64?.length || 0,
          fileName: asset.fileName,
          type: asset.type
        });

        // Store base64 data with proper MIME prefix for database
        let imageData: string;
        if (asset.base64) {
          imageData = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
          console.log('[AddOrder] Created base64 data string, length:', imageData.length);
        } else if (asset.uri) {
          imageData = asset.uri;
          console.log('[AddOrder] Using URI as fallback:', imageData);
        } else {
          console.error('[AddOrder] No valid image data found');
          return;
        }

        // 🚀 Update both clothImages global state AND currentCloth state
        setClothImages(prev => {
          const updated = [...prev, imageData];
          console.log('[AddOrder] Updated clothImages array:', {
            count: updated.length,
            latestEntry: imageData.substring(0, 50) + '...'
          });
          return updated;
        });
        
        // ✅ CRITICAL: Also add to currentCloth state for immediate association
        setCurrentCloth(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, imageData],
          imageData: [...prev.imageData, imageData]
        }));
      }
    } catch (error) {
      console.error('[AddOrder] Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // 🚀 UPDATED: Remove cloth image from both states
  const removeClothImage = (index: number) => {
    setClothImages(prev => prev.filter((_, i) => i !== index));
    
    // ✅ Also remove from currentCloth state
    setCurrentCloth(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      imageData: prev.imageData.filter((_, i) => i !== index)
    }));
  };

  // DatePicker handlers
  const handleDeliveryDateChange = (event: any, selectedDate?: Date) => {
    setShowDeliveryDatePicker(false);
    if (selectedDate) {
      setDeliveryDateObj(selectedDate);
      setFormData({ ...formData, deliveryDate: selectedDate.toLocaleDateString() });
    }
  };

  const handleTrialDateChange = (event: any, selectedDate?: Date) => {
    setShowTrialDatePicker(false);
    if (selectedDate) {
      setTrialDateObj(selectedDate);
      setFormData({ ...formData, trialDate: selectedDate.toLocaleDateString() });
    }
  };
  
  // Measurement key -> image mapping (static requires for RN bundler)
  const measurementImages: Record<string, any> = {
    height: require('../../assets/height.png'), // Correct height image
    chest: require('../../assets/chest.png'),
    waist: require('../../assets/waist.png'),
    shoulder: require('../../assets/shoulder.png'),
    hip: require('../../assets/hip.webp'),
    armhole: require('../../assets/arm_hole.webp'),
    sleeveLength: require('../../assets/sleeve_lenght.webp'),
    neck: require('../../assets/neck.webp'), // Using neck image
    bicep: require('../../assets/bicep.webp'), // Using bicep image
    wrist: require('../../assets/arm_wrist.webp'), // Using wrist image
    // Temporary placeholders: replace files with dedicated images named below
    inseam: require('../../assets/inseam_.webp'),
    outseam: require('../../assets/outseam.webp'),
    knee: require('../../assets/knee.webp'),
    thigh: require('../../assets/thigh.webp'),
    calf: require('../../assets/calf.webp'),
    ankle: require('../../assets/ankle_length.webp'),
  };
  
  // Function to get required measurements based on outfit type and gender
  const getRequiredMeasurements = (outfitType: string, gender: string) => {
    const baseMeasurements = ['height', 'chest', 'waist', 'shoulder'];
    
    switch (outfitType.toLowerCase()) {
      // Quick aliases / normalizations
      case 'pajama':
      case 'pajamas':
      case 'pants':
      case 'pant':
      case 'trouser':
      case 'trousers':
        // Bottom wear: prefer lower-body measurements
        return ['waist', 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];

      case 'kurti':
      case 'top':
      case 'tshirt':
      case 'shirt':
      case 'formal shirt':
      case 'casual shirt':
        // Upper garments
        return ['height', 'chest', 'waist', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];

      case 'skirt':
        // Skirt-like bottom
        return ['waist', 'hip', 'outseam'];

      case 'jacket':
      case 'blazer':
      case 'women_blazer':
      case 'ethnic_jacket':
      case 'indo_western':
        return ['height', 'chest', 'waist', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];

      case 'lehenga':
      case 'sharara':
      case 'underskirt':
        return ['waist', 'hip', 'outseam'];

      case 'gown':
      case 'dress':
        return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck'];

      case 'camisole':
      case 'nighty':
        return ['height', 'chest', 'waist', 'hip'];

      case 'kurta':
        return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck'];

      case 'kurta pajama':
        return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];

      // Female Traditional Wear
      case 'salwar kameez':
      case 'churidar suit':
      case 'anarkali':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam'];
      
      case 'kurti with palazzo/pants':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'lehenga choli':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'waist'];
      
      case 'blouse (for saree)':
      case 'princess cut blouse':
        return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck'];
      
      case 'saree petticoat':
        return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'saree fall & pico (stitching service)':
        return [...baseMeasurements, 'waist'];
      
      // Female Western Wear
      case 'dress (a-line, bodycon, maxi, etc.)':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'formal shirt':
        return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];
      
      case 'trousers':
        return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'jumpsuit':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'puff sleeves kurti':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck'];
      
      case 'flared palazzo':
        return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'asymmetrical dress':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      // Male Traditional Wear
      case 'kurta':
      case 'kurta pajama':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam'];
      
      case 'sherwani':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'bicep', 'wrist'];
      
      case 'dhoti kurta':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam'];
      
      // Male Western/Formal Wear
      case 'shirt':
      case 'casual shirt':
      case 'formal shirt':
        return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];
      
      case 'half sleeve / full sleeve':
        return [...baseMeasurements, 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist'];
      
      case 'pant / trouser':
        return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      case 'blazer / coat / suit':
      case 'tuxedo':
      case '3-piece suit':
        return [...baseMeasurements, 'hip', 'armhole', 'sleeveLength', 'neck', 'inseam', 'outseam', 'bicep', 'wrist'];
      
      case 'shorts':
        return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf'];
      
      case 'jeans (custom fit)':
        return [...baseMeasurements, 'hip', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
      
      default:
        // Return all measurements for unknown outfit types
        return ['height', 'chest', 'waist', 'hip', 'shoulder', 'armhole', 'sleeveLength', 'neck', 'bicep', 'wrist', 'inseam', 'outseam', 'thigh', 'knee', 'calf', 'ankle'];
    }
  };
  
  // Get current required measurements
  const currentRequiredMeasurements = getRequiredMeasurements(
    route.params?.outfitType || 'unknown',
    route.params?.gender || 'unknown'
  );

  const [currentItem, setCurrentItem] = useState<OrderFormItem>({
    id: '',
    name: '',
    quantity: '',
    price: '',
    notes: '',
    color: '',
    fabric: '',
    imageUrls: [],
    videoUrls: [],
  });

  const [currentCloth, setCurrentCloth] = useState({
    id: '',
    type: '',
    color: '',
    fabric: '',
    materialCost: '',
    designNotes: '',
    imageUrls: [] as string[],
    imageData: [] as string[], // ✅ Add imageData field
    videoUrls: [] as string[],
  });

  const [currentMeasurement, setCurrentMeasurement] = useState({
    id: '',
    height: '',
    chest: '',
    waist: '',
    hip: '',
    shoulder: '',
    sleeveLength: '',
    inseam: '',
    neck: '',
    armhole: '',
    bicep: '',
    wrist: '',
    outseam: '',
    thigh: '',
    knee: '',
    calf: '',
    ankle: '',
  });

  // Local state for customer name input
  const [customerName, setCustomerName] = useState(route.params?.customerName || '');
  
  // Debug: Log route params to see what's being passed
  useEffect(() => {
    console.log('AddOrder - Route params:', route.params);
    console.log('AddOrder - Customer name from params:', route.params?.customerName);
    console.log('AddOrder - Current customerName state:', customerName);
  }, [route.params, customerName]);

  // Debug: Monitor modal state changes
  useEffect(() => {
    console.log('AddOrder - isClothModalVisible changed to:', isClothModalVisible);
  }, [isClothModalVisible]);
  useEffect(() => {
    console.log('isStatusDropdownVisible changed to:', isStatusDropdownVisible);
  }, [isStatusDropdownVisible]);
  const [resolvedShopId, setResolvedShopId] = useState<string>(route.params?.shopId || '');

  // 🚀 PROPER SHOPID RESOLUTION: Get shopId from JWT token (most reliable)
  const getCurrentUserShopId = (): string | null => {
    if (!accessToken) return null;
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('[AddOrder] JWT payload:', payload);
      return payload?.shopId || payload?.user?.shopId || null;
    } catch (error) {
      console.error('[AddOrder] Failed to decode JWT:', error);
      return null;
    }
  };

  // Auto-fill forms with outfit data when screen loads
  useEffect(() => {
    if (route.params?.outfitType) {
      // Auto-fill the item name field with outfit type
      setCurrentItem(prev => ({
        ...prev,
        name: route.params.outfitType || ''
      }));
      
      // 🚀 IMPROVED: Auto-fill the cloth type field with actual outfit type
      setCurrentCloth(prev => ({
        ...prev,
        type: route.params.outfitType || (
          route.params.gender === 'female' ? t('order.female') : 
          route.params.gender === 'male' ? t('order.male') : 
          (route.params.gender || '')
        )
      }));

      // 🚀 AUTO-ADD CLOTH for alteration orders to prevent error
      if (formData.orderType === 'alteration' && route.params?.outfitType && formData.clothes.length === 0) {
        const autoCloth = {
          id: Date.now().toString(),
          type: route.params.outfitType,
          color: '',
          fabric: '',
          materialCost: 0,
          designNotes: 'For alteration',
          imageUrls: [],
          imageData: [],
          videoUrls: [],
        };
        
        console.log('[AddOrder] Auto-adding cloth for alteration:', autoCloth);
        setFormData(prev => ({
          ...prev,
          clothes: [autoCloth]
        }));
      }
    }
  }, [route.params?.outfitType, route.params?.gender]);

  // 🚀 PRIORITY ORDER: JWT > Route Params > AsyncStorage
  useEffect(() => {
    const loadShopId = async () => {
      try {
        // 1. First try JWT token (most reliable)
        const jwtShopId = getCurrentUserShopId();
        if (jwtShopId) {
          console.log('[AddOrder] Using shopId from JWT:', jwtShopId);
          setResolvedShopId(jwtShopId);
          return;
        }

        // 2. Then try route params
        if (route.params?.shopId) {
          console.log('[AddOrder] Using shopId from route params:', route.params.shopId);
          setResolvedShopId(route.params.shopId);
          return;
        }

        // 3. Finally fallback to AsyncStorage
        const sid = await AsyncStorage.getItem('shopId');
        if (sid) {
          console.log('[AddOrder] Using shopId from AsyncStorage:', sid);
          setResolvedShopId(sid);
        } else {
          console.warn('[AddOrder] No shopId found in any source!');
        }
      } catch (error) {
        console.error('[AddOrder] Error loading shopId:', error);
      }
    };
    loadShopId();
  }, [accessToken, route.params?.shopId]);

  const statusOptions = [
    { label: t('order.pending'), value: 'pending' as OrderStatus },
    { label: t('order.inProgress'), value: 'in_progress' as OrderStatus },
    { label: t('order.delivered'), value: 'delivered' as OrderStatus },
    { label: t('order.cancelled'), value: 'cancelled' as OrderStatus },
  ];

  const handleAddItem = () => {
    if (!currentItem.name || currentItem.name.trim() === '') return;
    
    // Convert form item to order item
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: currentItem.name.trim(),
      quantity: currentItem.quantity === '' ? 1 : parseInt(currentItem.quantity, 10) || 1,
      price: currentItem.price === '' ? 0 : parseFloat(currentItem.price) || 0,
      notes: currentItem.notes || '',
      color: currentItem.color || '',
      fabric: currentItem.fabric || '',
      imageUrls: currentItem.imageUrls || [],
      videoUrls: currentItem.videoUrls || [],
    };
    setFormData((prev: any) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setCurrentItem({
      id: '',
      name: '',
      quantity: '',
      price: '',
      notes: '',
      color: '',
      fabric: '',
      imageUrls: [],
      videoUrls: [],
    });
    setIsItemModalVisible(false);
  };

  const handleAddCloth = () => {
    if (!currentCloth.type || currentCloth.type.trim() === '') return;
    
    // 🚀 SIMPLIFIED: Images are already in currentCloth state
    const newCloth: Cloth = {
      id: Date.now().toString(),
      type: currentCloth.type.trim(),
      color: currentCloth.color || null,
      fabric: currentCloth.fabric || null,
      materialCost: currentCloth.materialCost === '' ? 0 : parseFloat(currentCloth.materialCost) || 0,
      designNotes: currentCloth.designNotes || '',
      imageUrls: currentCloth.imageUrls, // ✅ Images already stored in currentCloth
      imageData: currentCloth.imageData, // ✅ Images already stored in currentCloth
      videoUrls: currentCloth.videoUrls,
    };

    console.log('[AddOrder] 🚀 Creating cloth with images:', {
      type: newCloth.type,
      imageUrls: newCloth.imageUrls,
      imageData: newCloth.imageData,
      imageUrlsLength: newCloth.imageUrls?.length || 0,
      imageDataLength: newCloth.imageData?.length || 0,
      clothImagesCount: clothImages.length
    });

    setFormData((prev) => ({
      ...prev,
      clothes: [...prev.clothes, newCloth],
    }));

    // Clear both current cloth state and uploaded images
    setCurrentCloth({
      id: '',
      type: '',
      color: '',
      fabric: '',
      materialCost: '',
      designNotes: '',
      imageUrls: [],
      imageData: [], // ✅ Clear imageData too
      videoUrls: [],
    });
    setClothImages([]); // ✅ Clear uploaded images after adding to cloth
    setIsClothModalVisible(false);
  };

  const handleAddMeasurement = () => {
    const newMeasurement = {
      id: Date.now().toString(),
      height: currentMeasurement.height === '' ? null : parseFloat(currentMeasurement.height),
      chest: currentMeasurement.chest === '' ? null : parseFloat(currentMeasurement.chest),
      waist: currentMeasurement.waist === '' ? null : parseFloat(currentMeasurement.waist),
      hip: currentMeasurement.hip === '' ? null : parseFloat(currentMeasurement.hip),
      shoulder: currentMeasurement.shoulder === '' ? null : parseFloat(currentMeasurement.shoulder),
      sleeveLength: currentMeasurement.sleeveLength === '' ? null : parseFloat(currentMeasurement.sleeveLength),
      inseam: currentMeasurement.inseam === '' ? null : parseFloat(currentMeasurement.inseam),
      neck: currentMeasurement.neck === '' ? null : parseFloat(currentMeasurement.neck),
      armhole: currentMeasurement.armhole === '' ? null : parseFloat(currentMeasurement.armhole),
      bicep: currentMeasurement.bicep === '' ? null : parseFloat(currentMeasurement.bicep),
      wrist: currentMeasurement.wrist === '' ? null : parseFloat(currentMeasurement.wrist),
      outseam: currentMeasurement.outseam === '' ? null : parseFloat(currentMeasurement.outseam),
      thigh: currentMeasurement.thigh === '' ? null : parseFloat(currentMeasurement.thigh),
      knee: currentMeasurement.knee === '' ? null : parseFloat(currentMeasurement.knee),
      calf: currentMeasurement.calf === '' ? null : parseFloat(currentMeasurement.calf),
      ankle: currentMeasurement.ankle === '' ? null : parseFloat(currentMeasurement.ankle),
    };

    setFormData((prev: any) => ({
      ...prev,
      measurements: {
        ...(prev.measurements || {}),
        [newMeasurement.id]: newMeasurement,
      },
    }));

    setCurrentMeasurement({
      id: '',
      height: '',
      chest: '',
      waist: '',
      hip: '',
      shoulder: '',
      sleeveLength: '',
      inseam: '',
      neck: '',
      armhole: '',
      bicep: '',
      wrist: '',
      outseam: '',
      thigh: '',
      knee: '',
      calf: '',
      ankle: '',
    });
    setIsMeasurementModalVisible(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId),
    });
  };

  // Save details locally and go back to summary without creating an order
  const handleSaveAndBack = async () => {
    try {
      // Compute totals
      const itemsTotal = formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const materialSum = formData.clothes.reduce((total, cloth) => total + cloth.materialCost, 0);
      const alterationVal = formData.orderType === 'alteration' && formData.alterationPrice
        ? parseFloat(formData.alterationPrice)
        : 0;
      // For stitching: clothTotal = materialSum; For alteration: clothTotal = alterationVal
      const clothesTotal = formData.orderType === 'alteration' ? alterationVal : materialSum;
      const totalAmount = itemsTotal + clothesTotal;

      // Persist values for OrderSummary to pick up
      const lastOutfitId = (route.params as any)?.outfitId || `${route.params?.outfitType || 'ot'}-${Date.now()}`;
      const measurementsArray = Object.values(formData.measurements || {});
      await AsyncStorage.multiSet([
        ['lastCalculatedPrice', String(totalAmount)],
        ['lastOutfitId', String(lastOutfitId)],
        ['lastMeasurements', JSON.stringify(measurementsArray)],
      ]);
      // Store detailed breakdown to let summary create correct price/materialCost
      const breakdown = { id: String(lastOutfitId), itemsTotal, clothTotal: clothesTotal, notesText: formData.notes || '', orderType: formData.orderType };
      await AsyncStorage.setItem('lastBreakdown', JSON.stringify(breakdown));

      // Return to summary
      (navigation as any).goBack();
    } catch (error) {
      console.error('Failed to save details:', error);
      Alert.alert('Error', 'Failed to save details.');
    }
  };

  const handleSubmit = async () => {
    try {
      // 🚀 ENHANCED SHOPID VALIDATION
      console.log('[AddOrder] handleSubmit called with resolvedShopId:', resolvedShopId);
      console.log('[AddOrder] JWT shopId check:', getCurrentUserShopId());
      
      if (!resolvedShopId) {
        console.error('[AddOrder] No shopId available for order creation!');
        Alert.alert('Error', 'Shop information is required. Please restart the app.');
        return;
      }

      // Ensure customerId present; if not, create lightweight customer using entered name
      let customerId: string | undefined = route.params?.customerId;
      if (!customerId) {
        if (!customerName || customerName.trim() === '') {
          Alert.alert('Error', 'Please enter customer name');
          return;
        }
        try {
          const generatedPhone = `9${Date.now().toString().slice(-9)}`;
          const createdCustomer = await apiService.createCustomer({
            name: customerName.trim(),
            mobileNumber: generatedPhone,
          });
          customerId = createdCustomer?.id;
        } catch (e) {
          console.error('Auto-create customer failed:', e);
          Alert.alert('Error', 'Failed to create customer. Please try again.');
          return;
        }
      }

      if (formData.clothes.length === 0) {
        Alert.alert('Error', 'Please add at least one cloth item');
        return;
      }

      // 🚀 CRITICAL FIX: Prepare clothes with measurements and images
      const clothesWithMeasurements = formData.clothes.map((cloth, index) => {
        // Find matching measurement for this cloth
        const measurementId = Object.keys(formData.measurements)[index];
        const measurement = measurementId ? formData.measurements[measurementId] : null;

        // 🚀 ENSURE imageData is always present
        const clothWithImages = {
          type: cloth.type,
          color: cloth.color,
          fabric: cloth.fabric,
          materialCost: cloth.materialCost,
          price: cloth.materialCost, // Use materialCost as price
          designNotes: cloth.designNotes,
          imageUrls: cloth.imageUrls || [], // ✅ From cloth
          imageData: cloth.imageData || [], // ✅ From cloth
          videoUrls: cloth.videoUrls || [],
          measurements: measurement ? [
            {
              ...measurement,
              customerId
            }
          ] : []
        };

        console.log('[AddOrder] 🚀 Prepared cloth with images:', {
          type: cloth.type,
          imageUrls: clothWithImages.imageUrls,
          imageData: clothWithImages.imageData,
          imageUrlsLength: clothWithImages.imageUrls?.length || 0,
          imageDataLength: clothWithImages.imageData?.length || 0,
          hasImageUrls: !!(clothWithImages.imageUrls && clothWithImages.imageUrls.length > 0),
          hasImageData: !!(clothWithImages.imageData && clothWithImages.imageData.length > 0)
        });

        return clothWithImages;
      });

      // Map status to backend enum
      const statusMap: Record<string, string> = {
        pending: 'PENDING',
        in_progress: 'IN_PROGRESS',
        ready: 'READY',
        delivered: 'DELIVERED',
        cancelled: 'CANCELLED',
      };

      const payload = {
        customerId: customerId!,
        shopId: resolvedShopId,
        status: statusMap[formData.status] || 'PENDING',
        orderType: formData.orderType.toUpperCase(), // ✅ Add orderType
        notes: formData.notes || undefined, // ✅ Add simple notes field
        alterationPrice: formData.alterationPrice ? parseFloat(formData.alterationPrice) : null, // ✅ Add alteration price
        orderDate: new Date().toISOString(),
        deliveryDate: formData.deliveryDate || null,
        tailorName: formData.tailorName || null,
        tailorNumber: formData.tailorNumber || null,
        clothes: clothesWithMeasurements,
      };

      // 🚀 ENHANCED Debug logs
      console.log('=== ORDER CREATION: Starting ===');
      console.log('📊 Form data clothes count:', formData.clothes.length);
      console.log('📊 Form data clothes details:', formData.clothes.map((c, i) => ({
        index: i,
        type: c.type,
        imageUrls: c.imageUrls,
        imageData: c.imageData,
        imageUrlsLength: c.imageUrls?.length || 0,
        imageDataLength: c.imageData?.length || 0
      })));
      console.log('📊 Cloth images global count:', clothImages.length);
      console.log('📊 Prepared clothes with measurements:', clothesWithMeasurements.map((c, i) => ({
        index: i,
        type: c.type,
        imageUrls: c.imageUrls,
        imageData: c.imageData,
        imageUrlsLength: c.imageUrls?.length || 0,
        imageDataLength: c.imageData?.length || 0
      })));
      console.log('📊 Final payload clothes:', payload.clothes.map((c, i) => ({
        index: i,
        type: c.type,
        imageUrls: c.imageUrls,
        imageData: c.imageData,
        imageUrlsLength: c.imageUrls?.length || 0,
        imageDataLength: c.imageData?.length || 0,
        hasImages: !!(c.imageUrls && c.imageUrls.length > 0),
        hasImageData: !!(c.imageData && c.imageData.length > 0)
      })));
      
      // 🚀 Sample image data
      payload.clothes.forEach((cloth, index) => {
        if (cloth.imageUrls && cloth.imageUrls.length > 0) {
          console.log(`📊 Cloth ${index} imageUrls samples:`, cloth.imageUrls.map(img => img.substring(0, 50) + '...'));
        }
        if (cloth.imageData && cloth.imageData.length > 0) {
          console.log(`📊 Cloth ${index} imageData samples:`, cloth.imageData.map(img => img.substring(0, 50) + '...'));
        }
      });
      console.log('=== ORDER CREATION: Calling API ===');
      
      const created: any = await apiService.createOrder(payload);
      
      console.log('=== ORDER CREATION: API Response ===');
      console.log('Created order:', created);
      console.log('Order ID:', created?.id || created?.order?.id);
      // Persist measurements directly to DB as well so they can be fetched later
      try {
        const orderId = created?.id || created?.order?.id;
        const notesObj = typeof payload.notes === 'string' ? JSON.parse(payload.notes) : payload.notes;
        const clothesArr = notesObj?.clothes || clothesWithMeasurements;
        if (orderId && Array.isArray(clothesArr) && clothesArr.length > 0) {
          // Fetch saved order to get real cloth UUIDs created by backend
          let savedOrder: any | null = null;
          try {
            savedOrder = await apiService.getOrderById(orderId);
          } catch (e) {
            console.log('Fetch created order failed (will still try persisting measurements):', e);
          }
          const savedClothes: any[] = Array.isArray(savedOrder?.clothes) ? savedOrder!.clothes : [];

          const pickClothId = (c: any, idx: number): string | undefined => {
            // Try match by type first; then by index fallback
            let match = savedClothes.find(sc => sc?.type === c?.type);
            if (!match && savedClothes[idx]) match = savedClothes[idx];
            return match?.id;
          };

          for (let i = 0; i < clothesArr.length; i++) {
            const c = clothesArr[i];
            const ms = Array.isArray(c?.measurements) ? c.measurements : (c?.measurements ? [c.measurements] : []);
            if (ms.length === 0) continue;
            const clothId = pickClothId(c, i);
            if (!clothId) {
              console.log('Skip measurement persist: missing clothId for cloth index', i, 'type', c?.type);
              continue;
            }
            for (const m of ms) {
              const payloadMs: any = {
                ...m,
                orderId,
                customerId,
                type: c.type,
                clothId,
              };
              try {
                await apiService.createMeasurement(payloadMs);
              } catch (e) {
                console.log('Persist single measurement failed:', e);
              }
            }
          }
        }
        if (orderId) {
          orderCache.setSnapshot(orderId, { 
            clothes: clothesArr, 
            notes: notesObj?.notes,
            uploadedImages: clothImages 
          });
        }
      } catch (e) {
        console.log('Persisting measurements failed (non-blocking):', e);
      }
      Alert.alert('Success', 'Order added successfully!');
      (navigation as any).navigate('OrderList');
    } catch (error) {
      console.error('Failed to add order:', error);
      Alert.alert('Error', 'Failed to add order.');
    }
  };

  return (
    <View style={styles.container}>
     
      
      <ScrollView style={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.customerName')}</RegularText>
            <TextInput
              style={[styles.input, {paddingVertical: 12, color: colors.textPrimary}]}
              placeholder={t('order.enterCustomerName')}
              placeholderTextColor={colors.textMuted}
              value={customerName}
              onChangeText={setCustomerName}
              editable={true}
            />
          </View>

          {/* Order Type Selection */}
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>Type</RegularText>
            <View style={styles.orderTypeOptions}>
              <TouchableOpacity 
                style={[
                  styles.orderTypeOption, 
                  formData.orderType === 'stitching' && styles.selectedOrderType
                ]}
                onPress={() => setFormData({...formData, orderType: 'stitching'})}
              >
                <View style={[
                  styles.radioButton, 
                  formData.orderType === 'stitching' && styles.selectedRadioButton
                ]} />
                <RegularText style={[
                  styles.orderTypeText,
                  formData.orderType === 'stitching' && styles.selectedOrderTypeText
                ]}>Stitching</RegularText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.orderTypeOption, 
                  formData.orderType === 'alteration' && styles.selectedOrderType
                ]}
                onPress={() => setFormData({...formData, orderType: 'alteration'})}
              >
                <View style={[
                  styles.radioButton, 
                  formData.orderType === 'alteration' && styles.selectedRadioButton
                ]} />
                <RegularText style={[
                  styles.orderTypeText,
                  formData.orderType === 'alteration' && styles.selectedOrderTypeText
                ]}>Alteration</RegularText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Action Cards - Show for both stitching and alteration orders */}
          <View style={styles.actionCardsContainer}>
              
              {/* Add Item Card - only for stitching orders */}
              {formData.orderType === 'stitching' && (
                <TouchableOpacity
                  style={styles.actionCard}
                  onPress={() => setIsItemModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardContent}>
                    <RegularText style={styles.cardTitle}>{t('order.add_item')}</RegularText>
                    <RegularText style={styles.cardSubtitle}>{t('order.addClothingItems')}</RegularText>
                  </View>
                  <View style={styles.cardActionButton}>
                    <View style={styles.cardActionButtonGradient}>
                      <Text style={styles.cardButtonText}>+</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Add Cloth Card */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setIsClothModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <RegularText style={styles.cardTitle}>{t('order.add_cloth')}</RegularText>
                  <RegularText style={styles.cardSubtitle}>{t('order.addFabricDetails')}</RegularText>
                </View>
                <View style={styles.cardActionButton}>
                  <View style={styles.cardActionButtonGradient}>
                    <Text style={styles.cardButtonText}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Add Measurement Card */}
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setIsMeasurementModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <RegularText style={styles.cardTitle}>{t('order.add_measurement')}</RegularText>
                  <RegularText style={styles.cardSubtitle}>{t('order.addCustomerMeasurements')}</RegularText>
                </View>
                <View style={styles.cardActionButton}>
                  <View style={styles.cardActionButtonGradient}>
                    <Text style={styles.cardButtonText}>+</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

          {/* Items Display Section - Only show for stitching orders */}
          {formData.orderType === 'stitching' && formData.items.length > 0 && (
            <View style={styles.formGroup}>
              <TitleText style={styles.sectionTitle}>{t('order.items')}</TitleText>
              {formData.items.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <RegularText style={styles.itemName}>{item.name}</RegularText>
                    <RegularText style={styles.itemDetails}>
                      {t('order.quantity')}: {item.quantity} | {t('order.price')}: ₹{item.price.toFixed(2)}
                    </RegularText>
                    {item.notes && <RegularText style={styles.itemNotes}>{item.notes}</RegularText>}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Clothes Display Section - Show for both order types */}
          {formData.clothes && formData.clothes.length > 0 && (
            <View style={styles.formGroup}>
              <TitleText style={styles.sectionTitle}>{t('order.add_cloth')}</TitleText>
              {formData.clothes.map((cloth, index) => (
                <View key={cloth.id} style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <RegularText style={styles.itemName}>{cloth.type}</RegularText>
                    <RegularText style={styles.itemDetails}>
                      {t('order.materialCost')}: ₹{cloth.materialCost}
                    </RegularText>
                    {cloth.color && <RegularText style={styles.itemDetails}>{t('order.color')}: {cloth.color}</RegularText>}
                    {cloth.fabric && <RegularText style={styles.itemDetails}>{t('order.fabric')}: {cloth.fabric}</RegularText>}
                    {cloth.designNotes && <RegularText style={styles.itemNotes}>{cloth.designNotes}</RegularText>}
                    {/* 🚀 Show image count for debugging */}
                    <RegularText style={styles.itemDetails}>
                      📷 Images: {cloth.imageUrls?.length || 0} | Data: {cloth.imageData?.length || 0}
                    </RegularText>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        clothes: prev.clothes.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* 🚀 HELPER MESSAGE for alteration orders when no clothes added */}
          {formData.orderType === 'alteration' && formData.clothes.length === 0 && (
            <View style={[styles.formGroup, { backgroundColor: '#e8f5e8', borderColor: '#229B73', borderWidth: 1, borderRadius: 8, padding: 12 }]}>
              <RegularText style={[styles.label, { color: '#229B73', textAlign: 'center' }]}>
                ℹ️ Please add at least one cloth item for alteration
              </RegularText>
              <RegularText style={[styles.itemDetails, { color: '#666', textAlign: 'center', marginTop: 4 }]}>
                Use "Add Cloth" button above to specify what needs to be altered
              </RegularText>
            </View>
          )}

          {/* Measurements Display Section - Show for both order types when available */}
          {Object.keys(formData.measurements).length > 0 && (
            <View style={styles.formGroup}>
              <TitleText style={styles.sectionTitle}>{t('order.measurements')}</TitleText>
              {Object.entries(formData.measurements).map(([id, measurement]) => (
                <View key={id} style={styles.itemContainer}>
                  <View style={styles.itemInfo}>
                    <View style={styles.measurementGrid}>
                      {Object.entries(measurement).map(([key, value]) => {
                        // Skip id field and check for valid values
                        if (key !== 'id' && value != null) {
                          // Map measurement keys to proper translation keys
                          const translationKey = key === 'sleeveLength' ? 'order.sleeveLength' :
                                               key === 'armhole' ? 'order.armhole' :
                                               key === 'knee' ? 'order.knee' :
                                               key === 'ankle' ? 'order.ankle' :
                                               `order.${key}`;
                          
                          return (
                            <RegularText key={key} style={styles.measurementItem}>
                              {t(translationKey)}: {value}
                            </RegularText>
                          );
                        }
                        return null;
                      })}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => {
                      setFormData(prev => {
                        const { [id]: removed, ...rest } = prev.measurements;
                        return { ...prev, measurements: rest };
                      });
                    }}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.status')}</RegularText>
            <TouchableOpacity 
              style={styles.statusDropdown}
              onPress={() => {
                console.log('Status dropdown pressed, current state:', isStatusDropdownVisible);
                setIsStatusDropdownVisible(true);
                console.log('Set isStatusDropdownVisible to true');
              }}
            >
              <Text style={styles.statusText}>
                {formData.status === 'in_progress' ? t('order.inProgress') : 
                 formData.status === 'pending' ? t('order.pending') :
                 formData.status === 'delivered' ? t('order.delivered') :
                 formData.status === 'cancelled' ? t('order.cancelled') :
                 String(formData.status).charAt(0).toUpperCase() + String(formData.status).slice(1)}
              </Text>
              <Icon name="keyboard-arrow-down" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>



          <View style={styles.formGroup}>
            <RegularText style={styles.label}>{t('order.notes')}</RegularText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder={t('order.notes')}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* 🚀 ALTERATION PRICE INPUT - Only show for alteration orders */}
          {formData.orderType === 'alteration' && (
            <View style={styles.formGroup}>
              <RegularText style={styles.label}>💰 Alteration Price</RegularText>
              <TextInput
                style={styles.input}
                value={formData.alterationPrice || ''}
                onChangeText={(text) => setFormData({ ...formData, alterationPrice: text })}
                placeholder="Enter alteration price (e.g., 500)"
                keyboardType="numeric"
              />
            </View>
          )}

          {/* Show delivery and trial date for both stitching and alteration */}
          <View style={styles.formGroup}>
            <RegularText style={styles.label}>Delivery Date</RegularText>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDeliveryDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.deliveryDate || 'Select delivery date'}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <RegularText style={styles.label}>Trial Date</RegularText>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTrialDatePicker(true)}
            >
              <Text style={styles.datePickerText}>
                {formData.trialDate || 'Select trial date'}
              </Text>
              <Icon name="calendar-today" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 🚀 SINGLE Price Breakdown Block (Only at bottom) */}
          <View style={styles.costBreakdownContainer}>
            <TitleText style={styles.costBreakdownTitle}>💰 Price Breakup</TitleText>
            
            {/* Items Cost */}
            {formData.items.length > 0 && (
              <View style={styles.costRow}>
                <RegularText style={styles.costLabel}>Items:</RegularText>
                <RegularText style={styles.costValue}>
                  {formData.items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </RegularText>
              </View>
            )}
            
            {/* Clothes Cost */}
            {formData.clothes.length > 0 && (
              <View style={styles.costRow}>
                <RegularText style={styles.costLabel}>Clothes:</RegularText>
                <RegularText style={styles.costValue}>
                  ₹{formData.clothes.reduce((total, cloth) => total + cloth.materialCost, 0).toFixed(2)}
                </RegularText>
              </View>
            )}

            {/* 🚀 ALTERATION PRICE - Show only for alteration orders */}
            {formData.orderType === 'alteration' && formData.alterationPrice && (
              <View style={styles.costRow}>
                <RegularText style={styles.costLabel}>Alteration Price:</RegularText>
                <RegularText style={styles.costValue}>
                  ₹{parseFloat(formData.alterationPrice || '0').toFixed(2)}
                </RegularText>
              </View>
            )}
            
            {/* Total Cost with emphasis */}
            <View style={styles.totalCostRow}>
              <TitleText style={styles.totalCostLabel}>Total Amount:</TitleText>
              <TitleText style={styles.totalCostValue}>
                ₹{(
                  formData.items.reduce((total, item) => total + (item.price * item.quantity), 0) +
                  formData.clothes.reduce((total, cloth) => total + cloth.materialCost, 0) +
                  (formData.orderType === 'alteration' && formData.alterationPrice 
                    ? parseFloat(formData.alterationPrice) 
                    : 0)
                ).toFixed(2)}
              </TitleText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createOrderButton}
            onPress={handleSaveAndBack}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#229B73', '#1a8f6e', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createOrderButtonGradient}
            >
              <Text style={styles.createOrderButtonText}>Save Details</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Item Form Modal */}
      {isItemModalVisible && (
        <View style={[styles.modalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
          <View style={styles.modalContent}>
            <TitleText style={styles.modalTitle}>{t('order.add_item')}</TitleText>
            
            <View style={styles.formGroup}>
              <RegularText style={styles.label}>{t('order.itemDetails')}</RegularText>
              <TextInput
                style={styles.input}
                value={currentItem.name}
                onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
                placeholder={t('order.enterItemDetails')}
              />
            </View>

            <View style={styles.formGroup}>
              <RegularText style={styles.label}>{t('order.quantity')}</RegularText>
              <TextInput
                style={styles.input}
                value={currentItem.quantity}
                onChangeText={(text) => setCurrentItem({ ...currentItem, quantity: text.replace(/[^0-9]/g, '') })}
                placeholder={t('order.enterQuantity')}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <RegularText style={styles.label}>{t('order.price')}</RegularText>
              <TextInput
                style={styles.input}
                value={currentItem.price}
                onChangeText={(text) => setCurrentItem({ ...currentItem, price: text.replace(/[^0-9.]/g, '') })}
                placeholder={t('order.enterPrice')}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <RegularText style={styles.label}>{t('order.notes')}</RegularText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={currentItem.notes}
                onChangeText={(text) => setCurrentItem({ ...currentItem, notes: text })}
                placeholder={t('order.enterNotes')}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsItemModalVisible(false)}
              >
                <RegularText style={styles.cancelButtonText}>{t('common.cancel')}</RegularText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddItem}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#229B73', '#1a8f6e', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>{t('order.save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Cloth Form Modal */}
      {isClothModalVisible && (
        <View style={[styles.clothModalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
          <View style={styles.clothModalContent}>
            <TitleText style={styles.modalTitle}>{t('order.add_cloth')}</TitleText>
            
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={styles.clothModalScroll}
              contentContainerStyle={styles.clothModalScrollContent}
            >
              <View style={styles.formGroup}>
                <RegularText style={styles.label}>{t('order.clothType')}</RegularText>
                <TextInput
                  style={styles.input}
                  value={currentCloth.type}
                  onChangeText={(text) => setCurrentCloth({ ...currentCloth, type: text })}
                  placeholder={t('order.enterClothType')}
                />
              </View>

              <View style={styles.formGroup}>
                <RegularText style={styles.label}>{t('order.color')}</RegularText>
                <TextInput
                  style={styles.input}
                  value={currentCloth.color}
                  onChangeText={(text) => setCurrentCloth({ ...currentCloth, color: text })}
                  placeholder={t('order.enterColor')}
                />
              </View>

              <View style={styles.formGroup}>
                <RegularText style={styles.label}>{t('order.fabric')}</RegularText>
                <TextInput
                  style={styles.input}
                  value={currentCloth.fabric}
                  onChangeText={(text) => setCurrentCloth({ ...currentCloth, fabric: text })}
                  placeholder={t('order.enterFabric')}
                />
              </View>

              <View style={styles.formGroup}>
                <RegularText style={styles.label}>{t('order.materialCost')}</RegularText>
                <TextInput
                  style={styles.input}
                  value={currentCloth.materialCost}
                  onChangeText={(text) => setCurrentCloth({ ...currentCloth, materialCost: text.replace(/[^0-9.]/g, '') })}
                  placeholder={t('order.enterMaterialCost')}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <RegularText style={styles.label}>{t('order.designNotes')}</RegularText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={currentCloth.designNotes}
                  onChangeText={(text) => setCurrentCloth({ ...currentCloth, designNotes: text })}
                  placeholder={t('order.enterDesignNotes')}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* 🚀 ADDED: Image Upload Section in Cloth Modal */}
              <View style={styles.formGroup}>
                <RegularText style={styles.label}>📸 Upload Cloth Images</RegularText>
                <TouchableOpacity style={styles.imageUploadButton} onPress={handleClothImageUpload}>
                  <LinearGradient
                    colors={['#229B73', '#1a8f6e', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.imageUploadGradient}
                  >
                    <View style={styles.compactImageUploadContent}>
                      <Icon name="add-a-photo" size={20} color="#ffffff" />
                      <RegularText style={styles.compactImageUploadText}>Add Photos</RegularText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Display uploaded images in cloth modal */}
                {clothImages.length > 0 && (
                  <View style={styles.uploadedImagesContainer}>
                    <RegularText style={styles.uploadedImagesLabel}>📷 Images ({clothImages.length})</RegularText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScrollView}>
                      {clothImages.map((imageUri, index) => (
                        <View key={index} style={styles.imageItem}>
                          <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
                          <TouchableOpacity 
                            style={styles.removeImageButton}
                            onPress={() => removeClothImage(index)}
                          >
                            <Icon name="close" size={12} color="#ffffff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Fixed Buttons at Bottom */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsClothModalVisible(false)}
              >
                <RegularText style={styles.cancelButtonText}>{t('common.cancel')}</RegularText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddCloth}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#229B73', '#1a8f6e', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>{t('order.save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Measurement Form Modal */}
      {isMeasurementModalVisible && (
        <View style={[styles.measurementModalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }]}>
          <View style={styles.measurementModalContent}>
            {/* Fixed Header and Image Section */}
            <TitleText style={styles.modalTitle}>{t('order.recordMeasurement')}</TitleText>
            
            {/* Body Diagram Section */}
            <View style={styles.bodyDiagramContainer}>
              <Image
                source={measurementImages[selectedMeasurementField] || measurementImages.chest}
                style={styles.bodyDiagram}
                resizeMode="contain"
              />
            </View>

            {/* Scrollable Measurement Inputs */}
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={styles.scrollableFields}
              contentContainerStyle={styles.scrollableFieldsContent}
            >
              <View style={styles.measurementInputsContainer}>
                {
                  // Render fields only for measurements relevant to selected outfit
                  (() => {
                    const rows: React.ReactNode[] = [];
                    const addField = (key: string, labelKey: string) => (
                      <View style={styles.measurementField} key={key}>
                        <RegularText style={styles.measurementLabel}>{t(labelKey)}</RegularText>
                        <TextInput
                          style={styles.measurementInput}
                          value={(currentMeasurement as any)[key]}
                          onChangeText={(text) => setCurrentMeasurement({ ...(currentMeasurement as any), [key]: text } as any)}
                          placeholder="0.0"
                          keyboardType="numeric"
                          onFocus={() => setSelectedMeasurementField(key)}
                        />
                      </View>
                    );
                    const labels: Record<string, string> = {
                      height: 'order.height',
                      chest: 'measurement.chest',
                      waist: 'measurement.waist',
                      hip: 'measurement.hip',
                      shoulder: 'measurement.shoulder',
                      sleeveLength: 'order.sleeveLength',
                      inseam: 'order.inseam',
                      outseam: 'order.outseam',
                      neck: 'order.neck',
                      armhole: 'order.armhole',
                      bicep: 'order.bicep',
                      wrist: 'order.wrist',
                      thigh: 'order.thigh',
                      knee: 'order.knee',
                      calf: 'order.calf',
                      ankle: 'order.ankle',
                    };
                    const visible = currentRequiredMeasurements;
                    for (let i = 0; i < visible.length; i += 2) {
                      const left = visible[i];
                      const right = visible[i + 1];
                      rows.push(
                        <View style={styles.measurementRow} key={`row-${i}`}>
                          {addField(left, labels[left] || `order.${left}`)}
                          {right ? addField(right, labels[right] || `order.${right}`) : <View style={styles.measurementField} />}
                        </View>
                      );
                    }
                    return rows;
                  })()
                }
              </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsMeasurementModalVisible(false)}
              >
                <RegularText style={styles.cancelButtonText}>{t('common.cancel')}</RegularText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddMeasurement}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#229B73', '#1a8f6e', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>{t('order.save')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Status Dropdown Modal */}
      {isStatusDropdownVisible && (
        <View style={[styles.modalContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000 }]}> 
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsStatusDropdownVisible(false)} />
          <View style={styles.statusModalContainer}>
            <View style={styles.statusModalContent}>
              {/* Modal Header */}
              <View style={styles.dropdownHeader}>
                <TitleText style={styles.dropdownTitle}>{t('order.selectOption')}</TitleText>
                <TouchableOpacity onPress={() => setIsStatusDropdownVisible(false)}>
                  <Icon name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {/* Status Options */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={styles.statusOption}
                    onPress={() => {
                      setFormData({ ...formData, status: status.value });
                      setIsStatusDropdownVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      formData.status === status.value && styles.selectedStatusText
                    ]}>
                      {status.label}
                    </Text>
                    {formData.status === status.value && (
                      <Icon name="check" size={20} color={colors.brand} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {/* Delivery Date Picker Modal */}
      {showDeliveryDatePicker && (
        <DateTimePicker
          value={deliveryDateObj}
          mode="date"
          display="default"
          onChange={handleDeliveryDateChange}
        />
      )}

      {/* Trial Date Picker Modal */}
      {showTrialDatePicker && (
        <DateTimePicker
          value={trialDateObj}
          mode="date"
          display="default"
          onChange={handleTrialDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    color: colors.textPrimary,
  },
  scrollContainer: {
    flex: 1,
  },
  addButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  addButtonFlex: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: colors.textPrimary,
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measurementItem: {
    fontSize: 14,
    color: colors.textSecondary,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
  },
  itemDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
    color: colors.danger,
  },
  addItemButton: {
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addItemButtonText: {
    color: colors.brand,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 32,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  measurementModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingTop: 100,
  },
  measurementModalContent: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 32,
    flex: 1,
  },
  clothModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    paddingTop: 100,
  },
  clothModalContent: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 24,
    paddingBottom: 32,
    flex: 1,
  },
  clothModalScroll: {
    flex: 1,
    marginBottom: 4,
    minHeight: 300,
  },
  clothModalScrollContent: {
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.brand,
  },
  addButtonText: {
    color: colors.white,
  },
  actionCardsContainer: {
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#229B73',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  cardActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardButtonText: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
  },
  cardActionButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#229B73',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#229B73',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  statusDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 12,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statusOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedStatusText: {
    fontWeight: '600',
    color: colors.brand,
  },
  statusModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  statusModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    maxHeight: '80%',
  },
  createOrderButton: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  createOrderButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createOrderButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    height: 46,
  },
  saveButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3.5, // Adjust as needed for the accent line width
    borderRadius: 4, // Match card border radius
  },
  bodySilhouetteContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 0,
  },
  bodySilhouette: {
    width: '100%',
    aspectRatio: 1.2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyOutline: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.brand,
    opacity: 0.3,
  },
  head: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brand,
  },
  torso: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -20 }],
    width: 40,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.brand,
  },
  leftArm: {
    position: 'absolute',
    top: 30,
    left: '50%',
    transform: [{ translateX: -15 }],
    width: 30,
    height: 10,
    backgroundColor: colors.brand,
  },
  rightArm: {
    position: 'absolute',
    top: 30,
    left: '50%',
    transform: [{ translateX: 15 }],
    width: 30,
    height: 10,
    backgroundColor: colors.brand,
  },
  leftLeg: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -10 }],
    width: 20,
    height: 30,
    backgroundColor: colors.brand,
  },
  rightLeg: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: 10 }],
    width: 20,
    height: 30,
    backgroundColor: colors.brand,
  },
  measurementIndicator: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
    zIndex: 1,
  },
  measurementFieldsContainer: {
    gap: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 12,
  },
  measurementField: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  measurementInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  measurementImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  scrollableFields: {
    flex: 1,
    marginBottom: 20,
  },
  scrollableFieldsContent: {
    paddingBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  outfitInfoHeader: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  outfitInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  outfitInfoSubtitle: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  bodyDiagramContainer: {
    width: '100%',
    height: 120,
    marginBottom: 16,
    alignItems: 'center',
  },
  bodyDiagram: {
    width: '100%',
    height: '100%',
  },
  measurementInputsContainer: {
    gap: 12,
  },
  orderTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    padding: 4,
  },
  orderTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  selectedOrderType: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  selectedOrderTypeText: {
    color: colors.brand,
    fontWeight: '600',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  selectedRadioButton: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  orderTypeText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.white,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  costBreakdownContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  costBreakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalCostLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  priceSummaryContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalPriceRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalPriceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.brand,
  },
  // Beautiful Image upload styles
  imageUploadContainer: {
    marginTop: 8,
  },
  imageUploadButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageUploadGradient: {
    padding: 20,
  },
  imageUploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageUploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageUploadText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  imageUploadSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  uploadedImagesContainer: {
    marginTop: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  uploadedImagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadedImagesLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginLeft: 8,
    fontWeight: '600',
  },
  imagesScrollView: {
    flexDirection: 'row',
  },
  imageItem: {
    position: 'relative',
    marginRight: 16,
  },
  imageWrapper: {
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadedImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  removeButtonGradient: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 🚀 ADDED: Compact styles for cloth modal image upload
  compactImageUploadContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  compactImageUploadText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddOrder; 