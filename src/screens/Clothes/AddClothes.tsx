import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from '../../navigation/types';
import Button from '../../components/Button';
import Input from '../../components/Input';
import MediaUploader from '../../components/MediaUploader';

type AddClothesScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'AddClothes'>;

interface ClothesForm {
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
}

const AddClothes = () => {
  const navigation = useNavigation<AddClothesScreenNavigationProp>();
  const { t } = useTranslation();
  const [form, setForm] = useState<ClothesForm>({
    name: '',
    type: '',
    description: '',
    price: '',
    size: '',
    color: '',
    material: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('validation.required'));
      return false;
    }
    if (!form.type.trim()) {
      Alert.alert(t('common.error'), t('validation.required'));
      return false;
    }
    if (!form.price.trim()) {
      Alert.alert(t('common.error'), t('validation.required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          if (key === 'imageUri' || key === 'videoUri') {
            formData.append(key, {
              uri: value,
              type: key === 'imageUri' ? 'image/jpeg' : 'video/mp4',
              name: key === 'imageUri' ? 'photo.jpg' : 'video.mp4',
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      const response = await fetch('/api/clothes', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to add clothes');

      Alert.alert(t('common.success'), t('clothes.addSuccess'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('common.error'), t('clothes.addError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Input
          label={t('clothes.name')}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholder={t('clothes.name')}
        />
        <Input
          label={t('clothes.type')}
          value={form.type}
          onChangeText={(text) => setForm({ ...form, type: text })}
          placeholder={t('clothes.type')}
        />
        <Input
          label={t('clothes.description')}
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          placeholder={t('clothes.description')}
          multiline
        />
        <Input
          label={t('clothes.price')}
          value={form.price}
          onChangeText={(text) => setForm({ ...form, price: text })}
          placeholder={t('clothes.price')}
          keyboardType="numeric"
        />
        <Input
          label={t('clothes.size')}
          value={form.size}
          onChangeText={(text) => setForm({ ...form, size: text })}
          placeholder={t('clothes.size')}
        />
        <Input
          label={t('clothes.color')}
          value={form.color}
          onChangeText={(text) => setForm({ ...form, color: text })}
          placeholder={t('clothes.color')}
        />
        <Input
          label={t('clothes.fabric')}
          value={form.material}
          onChangeText={(text) => setForm({ ...form, material: text })}
          placeholder={t('clothes.fabric')}
        />

        <View style={styles.mediaSection}>
          <Text style={styles.sectionTitle}>{t('clothes.media')}</Text>
          <View style={styles.mediaButtons}>
            <MediaUploader
              label={t('clothes.addImage')}
              value={form.imageUri}
              onChange={uri => setForm({ ...form, imageUri: uri })}
              type="image"
            />
            <MediaUploader
              label={t('clothes.addVideo')}
              value={form.videoUri}
              onChange={uri => setForm({ ...form, videoUri: uri })}
              type="video"
            />
          </View>
        </View>

        <Input
          label={t('clothes.notes')}
          value={form.notes}
          onChangeText={(text) => setForm({ ...form, notes: text })}
          placeholder={t('clothes.notes')}
          multiline
        />

        <Button
          title={{ key: 'clothes.addClothes' }}
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
  mediaSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default AddClothes;