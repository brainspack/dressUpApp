import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../../services/api';
import orderCache from '../../../services/orderCache';
import { OrderFormData, OrderFormItem, OrderItem, Cloth } from '../types/orderTypes';
import { statusMap } from '../constants/orderConstants';
import { useToast } from '../../../context/ToastContext';

export const useOrderHandlers = (
  formData: OrderFormData,
  setFormData: (data: OrderFormData) => void,
  currentItem: OrderFormItem,
  setCurrentItem: (item: OrderFormItem) => void,
  currentCloth: any,
  setCurrentCloth: (cloth: any) => void,
  currentMeasurement: any,
  setCurrentMeasurement: (measurement: any) => void,
  clothImages: string[],
  setClothImages: (images: string[]) => void,
  resolvedShopId: string,
  customerName: string,
  route: any
) => {
  const navigation = useNavigation();
  const { showToast } = useToast();

  const handleAddItem = () => {
    if (!currentItem.name || currentItem.name.trim() === '') return;
    
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
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
    
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
  };

  const handleAddCloth = async () => {
    if (!currentCloth.type || currentCloth.type.trim() === '') return;
    
    const materialCostValue = currentCloth.materialCost === '' ? 0 : parseFloat(String(currentCloth.materialCost)) || 0;
    
    const newCloth: Cloth = {
      id: Date.now().toString(),
      type: currentCloth.type.trim(),
      color: currentCloth.color || null,
      fabric: currentCloth.fabric || null,
      materialCost: materialCostValue,
      designNotes: currentCloth.designNotes || '',
      imageUrls: currentCloth.imageUrls,
      videoUrls: currentCloth.videoUrls,
    };

    const newClothes = [...formData.clothes, newCloth];
    setFormData({
      ...formData,
      clothes: newClothes,
    });
    // Persist immediately so Summary can hydrate even if user skips Save Details
    try {
      const outfitId = (route.params as any)?.outfitId || `${route.params?.outfitType || 'ot'}-${Date.now()}`;
      await AsyncStorage.setItem(`clothes_${outfitId}`, JSON.stringify(newClothes));
      await AsyncStorage.setItem('lastClothes', JSON.stringify(newClothes));
    } catch {}

    setCurrentCloth({
      id: '',
      type: '',
      color: '',
      fabric: '',
      materialCost: '0',
      designNotes: '',
      imageUrls: [],
      videoUrls: [],
    });
    setClothImages([]);
  };

  const handleAddMeasurement = () => {
    const newMeasurement = {
      id: Date.now().toString(),
      height: currentMeasurement.height === '' ? undefined : parseFloat(currentMeasurement.height),
      chest: currentMeasurement.chest === '' ? undefined : parseFloat(currentMeasurement.chest),
      waist: currentMeasurement.waist === '' ? undefined : parseFloat(currentMeasurement.waist),
      hip: currentMeasurement.hip === '' ? undefined : parseFloat(currentMeasurement.hip),
      shoulder: currentMeasurement.shoulder === '' ? undefined : parseFloat(currentMeasurement.shoulder),
      sleeveLength: currentMeasurement.sleeveLength === '' ? undefined : parseFloat(currentMeasurement.sleeveLength),
      inseam: currentMeasurement.inseam === '' ? undefined : parseFloat(currentMeasurement.inseam),
      neck: currentMeasurement.neck === '' ? undefined : parseFloat(currentMeasurement.neck),
      armhole: currentMeasurement.armhole === '' ? undefined : parseFloat(currentMeasurement.armhole),
      bicep: currentMeasurement.bicep === '' ? undefined : parseFloat(currentMeasurement.bicep),
      wrist: currentMeasurement.wrist === '' ? undefined : parseFloat(currentMeasurement.wrist),
      outseam: currentMeasurement.outseam === '' ? undefined : parseFloat(currentMeasurement.outseam),
      thigh: currentMeasurement.thigh === '' ? undefined : parseFloat(currentMeasurement.thigh),
      knee: currentMeasurement.knee === '' ? undefined : parseFloat(currentMeasurement.knee),
      calf: currentMeasurement.calf === '' ? undefined : parseFloat(currentMeasurement.calf),
      ankle: currentMeasurement.ankle === '' ? undefined : parseFloat(currentMeasurement.ankle),
    };

    const prevMeasurements = (formData.measurements || {}) as Record<string, typeof newMeasurement>;
    const updatedMeasurements: Record<string, typeof newMeasurement> = {
      ...prevMeasurements,
      [newMeasurement.id]: newMeasurement,
    };

    setFormData({
      ...formData,
      measurements: updatedMeasurements,
    });

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
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId),
    });
  };

  const handleSaveAndBack = async () => {
    try {
      const itemsTotal = formData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const materialSum = formData.clothes.reduce((total, cloth) => total + cloth.materialCost, 0);
      const alterationVal = formData.orderType === 'alteration' && formData.alterationPrice
        ? parseFloat(formData.alterationPrice)
        : 0;
      const clothesTotal = formData.orderType === 'alteration' ? alterationVal : materialSum;
      const totalAmount = itemsTotal + clothesTotal;

      const lastOutfitId = (route.params as any)?.outfitId || `${route.params?.outfitType || 'ot'}-${Date.now()}`;
      const measurementsArray = Object.values(formData.measurements || {});
      await AsyncStorage.multiSet([
        ['lastCalculatedPrice', String(totalAmount)],
        ['lastOutfitId', String(lastOutfitId)],
        ['lastMeasurements', JSON.stringify(measurementsArray)],
      ]);
      // Persist clothes snapshot so OrderSummary can include color/fabric
      try {
        const clothesJson = JSON.stringify(formData.clothes || []);
        await AsyncStorage.setItem(`clothes_${lastOutfitId}`, clothesJson);
        await AsyncStorage.setItem('lastClothes', clothesJson);
      } catch {}
      
      const breakdown = { id: String(lastOutfitId), itemsTotal, clothTotal: clothesTotal, notesText: formData.notes || '', orderType: formData.orderType };
      await AsyncStorage.setItem('lastBreakdown', JSON.stringify(breakdown));

      (navigation as any).goBack();
    } catch (error) {
      console.error('Failed to save details:', error);
      Alert.alert('Error', 'Failed to save details.');
    }
  };

  const handleSubmit = async () => {
    try {
      console.log('🚀🚀🚀 MOBILE APP: handleSubmit called - UPDATED CODE IS RUNNING! 🚀🚀🚀');
      Alert.alert('Debug', 'Updated code is running! Check console for detailed logs.');
      
      if (!resolvedShopId) {
        console.error('[AddOrder] No shopId available for order creation!');
        Alert.alert('Error', 'Shop information is required. Please restart the app.');
        return;
      }

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

      const clothesWithMeasurements = formData.clothes.map((cloth, index) => {
        const measurementKeys = Object.keys(formData.measurements || {});
        const measurementId = measurementKeys[index];
        const measurement = measurementId && formData.measurements ? formData.measurements[measurementId] : null;

        const clothData = {
          type: cloth.type || 'Unknown',
          color: cloth.color && cloth.color.trim() !== '' ? cloth.color.trim() : null,
          fabric: cloth.fabric && cloth.fabric.trim() !== '' ? cloth.fabric.trim() : null,
          materialCost: typeof cloth.materialCost === 'number' ? cloth.materialCost : parseFloat(String(cloth.materialCost)) || 0,
          price: typeof cloth.materialCost === 'number' ? cloth.materialCost : parseFloat(String(cloth.materialCost)) || 0,
          designNotes: cloth.designNotes || '',
          imageUrls: Array.isArray(cloth.imageUrls) ? cloth.imageUrls : [],
          videoUrls: Array.isArray(cloth.videoUrls) ? cloth.videoUrls : [],
          measurements: measurement ? [
            {
              ...measurement,
              customerId
            }
          ] : []
        };

        return clothData;
      });

      const totalMaterialCost = clothesWithMeasurements.reduce((sum, cloth) => sum + cloth.materialCost, 0);
      const totalPrice = clothesWithMeasurements.reduce((sum, cloth) => sum + cloth.price, 0);
      const totalCost = totalMaterialCost + totalPrice;

      const payload: any = {
        customerId: customerId!,
        shopId: resolvedShopId,
        status: statusMap[formData.status] || 'PENDING',
        orderType: (formData.orderType || 'stitching').toUpperCase(),
        notes: formData.notes || undefined,
        alterationPrice: formData.alterationPrice ? parseFloat(String(formData.alterationPrice)) : null,
        orderDate: new Date().toISOString(),
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : null,
        tailorName: formData.tailorName || null,
        tailorNumber: formData.tailorNumber || null,
        clothes: clothesWithMeasurements.map(cloth => {
          const processedImageUrls = cloth.imageUrls.map((img: any) => 
            typeof img === 'string' ? img : img.url || img.originalUrl || ''
          ).filter((url: string) => url);
          
          console.log('🚀 Processing cloth for order submission:', {
            type: cloth.type,
            originalImageUrls: cloth.imageUrls,
            processedImageUrls: processedImageUrls
          });
          
          return {
            type: cloth.type,
            materialCost: cloth.materialCost,
            price: cloth.price,
            designNotes: cloth.designNotes,
            color: cloth.color,
            fabric: cloth.fabric,
            imageUrls: processedImageUrls,
            videoUrls: cloth.videoUrls
          };
        }),
        costs: [{
          materialCost: totalMaterialCost,
          laborCost: totalPrice,
          totalCost: totalCost
        }],
      };

      const created: any = await apiService.createOrder(payload);
      
      console.log('Created order:', created);
      
      try {
        const orderId = created?.id || created?.order?.id;
        const notesObj = typeof payload.notes === 'string' ? JSON.parse(payload.notes) : payload.notes;
        const clothesArr = notesObj?.clothes || clothesWithMeasurements;
        if (orderId && Array.isArray(clothesArr) && clothesArr.length > 0) {
          let savedOrder: any | null = null;
          try {
            savedOrder = await apiService.getOrderById(orderId);
          } catch (e) {
            console.log('Fetch created order failed (will still try persisting measurements):', e);
          }
          const savedClothes: any[] = Array.isArray(savedOrder?.clothes) ? savedOrder!.clothes : [];

          const pickClothId = (c: any, idx: number): string | undefined => {
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
      
      showToast('Order added successfully!', 'success');
      (navigation as any).navigate('OrderList');
    } catch (error) {
      console.error('Failed to add order:', error);
      Alert.alert('Error', 'Failed to add order.');
    }
  };

  return {
    handleAddItem,
    handleAddCloth,
    handleAddMeasurement,
    handleRemoveItem,
    handleSaveAndBack,
    handleSubmit,
  };
};
