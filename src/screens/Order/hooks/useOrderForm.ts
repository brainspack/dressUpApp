import { useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { OrderStackParamList } from '../../../navigation/types';
import { OrderFormData, OrderFormItem, Cloth, Measurement } from '../types/orderTypes';
import { OrderStatus } from '../../../types/order';

export const useOrderForm = () => {
  const route = useRoute<RouteProp<OrderStackParamList, 'AddOrder'>>();
  
  const [formData, setFormData] = useState<OrderFormData>({
    items: [],
    clothes: [],
    status: 'pending' as OrderStatus,
    notes: '',
    tailorName: '',
    tailorNumber: '',
    deliveryDate: '',
    trialDate: '',
    orderType: route.params?.orderType || 'stitching',
    alterationPrice: '',
    measurements: {},
  });

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
    materialCost: '0',
    designNotes: '',
    imageUrls: [] as (string | { url: string; fileKey: string; originalUrl?: string })[],
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

  const [customerName, setCustomerName] = useState(route.params?.customerName || '');
  const [clothImages, setClothImages] = useState<(string | { url: string; fileKey: string; originalUrl?: string })[]>([]);

  // Auto-fill forms with outfit data when screen loads
  useEffect(() => {
    if (route.params?.outfitType) {
      setCurrentItem(prev => ({
        ...prev,
        name: route.params.outfitType || ''
      }));
      
      setCurrentCloth(prev => ({
        ...prev,
        type: route.params.outfitType || ''
      }));

      // Auto-add cloth for alteration orders
      if (formData.orderType === 'alteration' && route.params?.outfitType && formData.clothes.length === 0) {
        const autoCloth = {
          id: Date.now().toString(),
          type: route.params.outfitType,
          color: '',
          fabric: '',
          materialCost: 0,
          designNotes: 'For alteration',
          imageUrls: [],
          videoUrls: [],
        };
        
        setFormData(prev => ({
          ...prev,
          clothes: [autoCloth]
        }));
      }
    }
  }, [route.params?.outfitType, route.params?.gender]);

  return {
    formData,
    setFormData,
    currentItem,
    setCurrentItem,
    currentCloth,
    setCurrentCloth,
    currentMeasurement,
    setCurrentMeasurement,
    customerName,
    setCustomerName,
    clothImages,
    setClothImages,
  };
};
