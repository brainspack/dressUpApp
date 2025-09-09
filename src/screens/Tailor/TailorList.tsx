// src/screens/Tailor/TailorList.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, TextInput } from 'react-native';
import { tailorListStyles as styles } from './styles';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../constants/colors';
import { useTranslation } from 'react-i18next';

type TailorListNavigationProp = NativeStackNavigationProp<any>;

interface Tailor {
  id: string;
  serialNumber: number;
  name: string;
  mobileNumber: string;
  address?: string;
  createdAt: string;
  shopId: string;
  deletedAt?: string | null;
  status: 'INACTIVE' | 'ACTIVE';
}

const TailorList = () => {
  const navigation = useNavigation<TailorListNavigationProp>();
  const { accessToken } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [allTailors, setAllTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const decodeShopIdFromJwt = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const part = token.split('.')[1] || '';
      let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const json = decodeURIComponent(
        atob(b64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(json);
      return payload?.shopId || payload?.user?.shopId || null;
    } catch {
      try {
        // @ts-ignore
        const { Buffer } = require('buffer');
        const json = Buffer.from((token.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        const payload = JSON.parse(json);
        return payload?.shopId || payload?.user?.shopId || null;
      } catch {
        return null;
      }
    }
  };

  const fetchTailors = async () => {
    try {
      setLoading(true);
      let shopId: string | null = null;
      try {
        // Prefer persisted shopId set at login time
        shopId = await AsyncStorage.getItem('shopId');
      } catch { }
      if (!shopId) {
        shopId = decodeShopIdFromJwt(accessToken);
      }
      let data: Tailor[] = [];
      if (shopId) {
        data = await apiService.getTailorsByShop(shopId);
      } else {
        // Fallback to all and filter on client if needed
        data = await apiService.getTailors();
      }
      console.log('Fetched tailors:', data);
      
      // Additional client-side filter to ensure no soft-deleted tailors are shown
      const activeTailors = data.filter(tailor => !tailor.deletedAt);
      console.log('Active tailors (filtered):', activeTailors);
      
      setAllTailors(activeTailors);
      setTailors(activeTailors);
    } catch (error) {
      console.error('Error fetching tailors:', error);
      Alert.alert('Error', 'Failed to load tailors');
    } finally {
      setLoading(false);
    }
  };

  // Filter tailors based on search query
  const filterTailors = (query: string) => {
    if (!query.trim()) {
      setTailors(allTailors);
      return;
    }

    const filtered = allTailors.filter(tailor =>
      tailor.name.toLowerCase().includes(query.toLowerCase()) ||
      tailor.mobileNumber.includes(query) ||
      (tailor.address && tailor.address.toLowerCase().includes(query.toLowerCase()))
    );
    setTailors(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTailors();
    setRefreshing(false);
  };

  // Fetch tailors when component mounts
  useEffect(() => {
    fetchTailors();
  }, []);

  // Refresh tailors when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchTailors();
    }, [])
  );

  const renderTailorItem = ({ item }: { item: Tailor }) => (
    <View style={styles.tailorItem}>
      <LinearGradient
        colors={['#229B73', '#1a8f6e', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.cardAccent}
      />
      <TouchableOpacity
        style={styles.tailorInfo}
        onPress={() => navigation.navigate('TailorDetails', { tailorId: item.id })}
      >
        <View style={styles.tailorField}>
          <Icon name="person" size={16} color="#229B73" style={styles.fieldIcon} />
          <Text style={styles.tailorName}>{item.name}</Text>
        </View>
        <View style={styles.tailorField}>
          <Icon name="phone" size={16} color="#64748b" style={styles.fieldIcon} />
          <Text style={styles.tailorContact}>{item.mobileNumber}</Text>
        </View>
        <View style={styles.tailorField}>
          <Icon name="location-on" size={16} color="#6b7280" style={styles.fieldIcon} />
          <Text style={styles.tailorAddress}>{item.address || t('tailor.noAddress')}</Text>
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Button
          variant="gradient"
          title={t('common.assign')}
          height={36}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={() => (navigation as any).navigate('Orders', {
            screen: 'AssignTailor',
            params: { tailorId: item.id, tailorName: item.name, shopId: item.shopId },
          })}
          style={{ width: 96, borderRadius: 8 }}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#64748b" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('tailor.searchTailor')}
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              filterTailors(text);
            }}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <Button
          variant="gradient"
          title={t('tailor.addTailor')}
          height={56}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          icon={<Icon name="add" size={24} color="#fff" />}
          onPress={() => navigation.navigate('AddTailor')}
          style={{ borderRadius: 12 }}
        />
      </View>

      <FlatList
        data={tailors}
        renderItem={renderTailorItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>{loading ? t('tailor.loadingTailors') : t('tailor.noTailors')}</Text>}
      />
    </View>
  );
};


export default TailorList;