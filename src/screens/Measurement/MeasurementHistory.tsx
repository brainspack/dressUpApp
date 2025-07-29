import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import Button from '../../components/Button';

type MeasurementHistoryScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'MeasurementHistory'>;

interface Measurement {
  id: string;
  type: 'men' | 'women' | 'children';
  height: string;
  weight: string;
  createdAt: string;
  // Men's measurements
  chest?: string;
  waist?: string;
  hips?: string;
  shoulder?: string;
  sleeve?: string;
  // Women's measurements
  bust?: string;
  naturalWaist?: string;
  lowWaist?: string;
  // Children's measurements
  age?: string;
  growth?: string;
  notes?: string;
}

const MeasurementHistory = () => {
  const navigation = useNavigation<MeasurementHistoryScreenNavigationProp>();
  const route = useRoute();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const response = await fetch(`/api/measurements/customer/${route.params?.customerId}`);
        if (!response.ok) throw new Error('Failed to fetch measurements');
        const data = await response.json();
        setMeasurements(data);
      } catch (error) {
        console.error('Error fetching measurements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeasurements();
  }, [route.params?.customerId]);

  const renderMeasurementItem = ({ item }: { item: Measurement }) => {
    const getMeasurementDetails = () => {
      switch (item.type) {
        case 'men':
          return (
            <>
              <Text style={styles.detail}>Chest: {item.chest} cm</Text>
              <Text style={styles.detail}>Waist: {item.waist} cm</Text>
              <Text style={styles.detail}>Hips: {item.hips} cm</Text>
              <Text style={styles.detail}>Shoulder: {item.shoulder} cm</Text>
              <Text style={styles.detail}>Sleeve: {item.sleeve} cm</Text>
            </>
          );
        case 'women':
          return (
            <>
              <Text style={styles.detail}>Bust: {item.bust} cm</Text>
              <Text style={styles.detail}>Natural Waist: {item.naturalWaist} cm</Text>
              <Text style={styles.detail}>Low Waist: {item.lowWaist} cm</Text>
              <Text style={styles.detail}>Hips: {item.hips} cm</Text>
            </>
          );
        case 'children':
          return (
            <>
              <Text style={styles.detail}>Age: {item.age} years</Text>
              <Text style={styles.detail}>Growth Rate: {item.growth} cm/year</Text>
            </>
          );
      }
    };

    return (
      <View style={styles.measurementItem}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.type}>{item.type.toUpperCase()}</Text>
        </View>
        <View style={styles.measurements}>
          <Text style={styles.detail}>Height: {item.height} cm</Text>
          <Text style={styles.detail}>Weight: {item.weight} kg</Text>
          {getMeasurementDetails()}
        </View>
        {item.notes && (
          <Text style={styles.notes}>Notes: {item.notes}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Button
        title="Add New Measurement"
        onPress={() => navigation.navigate('AddMeasurement', { customerId: route.params?.customerId })}
        variant="primary"
        style={styles.addButton}
      />

      {loading ? (
        <Text style={styles.loading}>Loading measurements...</Text>
      ) : (
        <FlatList
          data={measurements}
          renderItem={renderMeasurementItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No measurements found</Text>
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
  measurementItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  measurements: {
    gap: 4,
  },
  detail: {
    fontSize: 14,
    color: '#333',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
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

export default MeasurementHistory; 