import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { pickImageFromUser } from '../utils/imagePicker';

interface MediaUploaderProps {
  label?: string;
  value?: string;
  onChange: (uri: string) => void;
  error?: string;
  aspect?: [number, number];
  quality?: number;
  type?: 'image' | 'video';
}

const MediaUploader = ({ 
  label, 
  value, 
  onChange, 
  error,
  aspect = [1, 1],
  quality = 0.5,
  type = 'image',
}: MediaUploaderProps) => {
  const [loading, setLoading] = useState(false);

  const pickMedia = async () => {
    try {
      setLoading(true);
      const result = await pickImageFromUser({ mediaType: type === 'video' ? 'video' : 'photo', quality: 1 });
      if (!result.canceled && result.asset?.uri) {
        onChange(result.asset.uri);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error picking media. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={[styles.uploader, error && styles.uploaderError]} 
        onPress={pickMedia}
        disabled={loading}
      >
        {value ? (
          type === 'image' ? (
            <Image source={{ uri: value }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Video selected</Text>
            </View>
          )
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Tap to upload {type}</Text>
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  uploader: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  uploaderError: {
    borderColor: '#ff3b30',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
});

export default MediaUploader; 