import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ClothesStackParamList } from '../../navigation/types';
import Button from '../../components/Button';

type ClothesHistoryScreenNavigationProp = NativeStackNavigationProp<ClothesStackParamList, 'ClothesHistory'>;

interface Clothes {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  size: string;
  color: string;
  material: string;
  imageUri?: string;
  videoUri?: string;
  notes?: string;
  createdAt: string;
}

const ClothesHistory = () => {
  const navigation = useNavigation<ClothesHistoryScreenNavigationProp>();
  const { t } = useTranslation();
  const [clothes, setClothes] = useState<Clothes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClothes = async () => {
      try {
        const response = await fetch('/api/clothes');
        if (!response.ok) throw new Error('Failed to fetch clothes');
        const data = await response.json();
        setClothes(data);
      } catch (error) {
        console.error('Error fetching clothes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClothes();
  }, []);

  const renderClothesItem = ({ item }: { item: Clothes }) => (
    <TouchableOpacity
      style={styles.clothesItem}
      onPress={() => {
        // TODO: Add ClothesDetails to navigation stack
        console.log('Navigate to clothes details:', item.id);
      }}
    >
      {item.imageUri && (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.clothesImage}
        />
      )}
      <View style={styles.clothesInfo}>
        <Text style={styles.clothesName}>{item.name}</Text>
        <Text style={styles.clothesType}>{item.type}</Text>
        <Text style={styles.clothesPrice}>₹{item.price}</Text>
        <View style={styles.clothesDetails}>
          <Text style={styles.detail}>{t('clothes.size')}: {item.size}</Text>
          <Text style={styles.detail}>{t('clothes.color')}: {item.color}</Text>
          <Text style={styles.detail}>{t('clothes.fabric')}: {item.material}</Text>
        </View>
        {item.notes && (
          <Text style={styles.notes}>{t('clothes.notes')}: {item.notes}</Text>
        )}
        <Text style={styles.date}>
          {t('clothes.dateAdded')}: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Button
        title={{ key: 'clothes.addClothes' }}
        onPress={() => navigation.navigate('AddClothes')}
        variant="primary"
        style={styles.addButton}
      />

      {loading ? (
        <Text style={styles.loading}>{t('common.loading')}</Text>
      ) : (
        <FlatList
          data={clothes}
          renderItem={renderClothesItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('clothes.noClothes')}</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  addButton: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  clothesItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  clothesImage: {
    width: '100%',
    height: 200,
  },
  clothesInfo: {
    padding: 16,
    gap: 8,
  },
  clothesName: {
    fontSize: 18,
    fontWeight: '600',
  },
  clothesType: {
    fontSize: 16,
    color: '#666',
  },
  clothesPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  clothesDetails: {
    gap: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loading: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});

export default ClothesHistory; 