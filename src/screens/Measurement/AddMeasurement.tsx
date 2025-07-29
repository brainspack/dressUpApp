import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';
import Button from '../../components/Button';
import Input from '../../components/Input';

type AddMeasurementScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'AddMeasurement'>;

type MeasurementType = 'men' | 'women' | 'children';

interface MeasurementForm {
  type: MeasurementType;
  // Common measurements
  height: string;
  weight: string;
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

const AddMeasurement = () => {
  const navigation = useNavigation<AddMeasurementScreenNavigationProp>();
  const route = useRoute();
  const [type, setType] = useState<MeasurementType>('men');
  const [form, setForm] = useState<MeasurementForm>({
    type: 'men',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.height.trim()) {
      Alert.alert('Error', 'Height is required');
      return false;
    }
    if (!form.weight.trim()) {
      Alert.alert('Error', 'Weight is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          customerId: route.params?.customerId,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to save measurements');

      Alert.alert('Success', 'Measurements saved successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurements. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderMeasurementFields = () => {
    switch (type) {
      case 'men':
        return (
          <>
            <Input
              label="Chest (cm)"
              value={form.chest}
              onChangeText={(text) => setForm({ ...form, chest: text })}
              keyboardType="numeric"
            />
            <Input
              label="Waist (cm)"
              value={form.waist}
              onChangeText={(text) => setForm({ ...form, waist: text })}
              keyboardType="numeric"
            />
            <Input
              label="Hips (cm)"
              value={form.hips}
              onChangeText={(text) => setForm({ ...form, hips: text })}
              keyboardType="numeric"
            />
            <Input
              label="Shoulder (cm)"
              value={form.shoulder}
              onChangeText={(text) => setForm({ ...form, shoulder: text })}
              keyboardType="numeric"
            />
            <Input
              label="Sleeve (cm)"
              value={form.sleeve}
              onChangeText={(text) => setForm({ ...form, sleeve: text })}
              keyboardType="numeric"
            />
          </>
        );
      case 'women':
        return (
          <>
            <Input
              label="Bust (cm)"
              value={form.bust}
              onChangeText={(text) => setForm({ ...form, bust: text })}
              keyboardType="numeric"
            />
            <Input
              label="Natural Waist (cm)"
              value={form.naturalWaist}
              onChangeText={(text) => setForm({ ...form, naturalWaist: text })}
              keyboardType="numeric"
            />
            <Input
              label="Low Waist (cm)"
              value={form.lowWaist}
              onChangeText={(text) => setForm({ ...form, lowWaist: text })}
              keyboardType="numeric"
            />
            <Input
              label="Hips (cm)"
              value={form.hips}
              onChangeText={(text) => setForm({ ...form, hips: text })}
              keyboardType="numeric"
            />
          </>
        );
      case 'children':
        return (
          <>
            <Input
              label="Age (years)"
              value={form.age}
              onChangeText={(text) => setForm({ ...form, age: text })}
              keyboardType="numeric"
            />
            <Input
              label="Growth Rate (cm/year)"
              value={form.growth}
              onChangeText={(text) => setForm({ ...form, growth: text })}
              keyboardType="numeric"
            />
          </>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.typeSelector}>
          <Button
            title="Men"
            onPress={() => setType('men')}
            variant={type === 'men' ? 'primary' : 'secondary'}
          />
          <Button
            title="Women"
            onPress={() => setType('women')}
            variant={type === 'women' ? 'primary' : 'secondary'}
          />
          <Button
            title="Children"
            onPress={() => setType('children')}
            variant={type === 'children' ? 'primary' : 'secondary'}
          />
        </View>

        <Input
          label="Height (cm)"
          value={form.height}
          onChangeText={(text) => setForm({ ...form, height: text })}
          keyboardType="numeric"
        />
        <Input
          label="Weight (kg)"
          value={form.weight}
          onChangeText={(text) => setForm({ ...form, weight: text })}
          keyboardType="numeric"
        />

        {renderMeasurementFields()}

        <Input
          label="Notes"
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          multiline
        />

        <Button
          title="Save Measurements"
          onPress={handleSubmit}
          variant="primary"
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
    gap: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default AddMeasurement; 