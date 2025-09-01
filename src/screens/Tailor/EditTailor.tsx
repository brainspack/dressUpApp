import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/api';
import Button from '../../components/Button';
import { TailorStackParamList } from '../../navigation/types';
import { RegularText, TitleText } from '../../components/CustomText';
import colors from '../../constants/colors';

interface EditTailorRouteParams {
  tailorId: string;
}

interface Tailor {
  id: string;
  serialNumber?: number;
  name: string;
  mobileNumber: string;
  address?: string;
  createdAt: string;
  shopId: string;
  status: 'INACTIVE' | 'ACTIVE';
}

const EditTailor = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<TailorStackParamList, 'EditTailor'>>();
  const { tailorId } = route.params;
  
  const [tailor, setTailor] = useState<Tailor | null>(null);
  const [form, setForm] = useState<Partial<Tailor>>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTailorDetails();
  }, [tailorId]);

  const fetchTailorDetails = async () => {
    try {
      setLoading(true);
      const tailorData = await apiService.getTailorById(tailorId);
      setTailor(tailorData);
      setForm({
        name: tailorData.name || '',
        mobileNumber: tailorData.mobileNumber || '',
        address: tailorData.address || '',
      });
    } catch (error) {
      console.error('Error fetching tailor details:', error);
      Alert.alert('Error', 'Failed to fetch tailor details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!form.mobileNumber?.trim()) {
      Alert.alert('Error', 'Mobile number is required');
      return;
    }

    setUpdating(true);
    try {
      const updatedTailor = await apiService.updateTailor(tailorId, {
        name: form.name.trim(),
        mobileNumber: form.mobileNumber.trim(),
        address: form.address?.trim() || undefined,
      });
      
      // Show success message and navigate back
      Alert.alert('Success', 'Tailor updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('Error', 'Failed to update tailor. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getTailorNumber = (tailor: Tailor) => {
    if (tailor.serialNumber) {
      return `TLR-${String(tailor.serialNumber).padStart(4, '0')}`;
    }
    // Fallback: generate from ID hash
    const hash = Math.abs(Array.from(tailor.id).reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0)) % 10000;
    return `TLR-${String(hash).padStart(4, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
        <RegularText style={styles.loadingText}>Loading tailor details...</RegularText>
      </View>
    );
  }

  if (!tailor) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={64} color={colors.danger} />
        <TitleText style={styles.errorTitle}>Tailor Not Found</TitleText>
        <RegularText style={styles.errorText}>The tailor you're trying to edit doesn't exist or has been deleted.</RegularText>
        <Button
          variant="gradient"
          title="Go Back"
          height={48}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          onPress={() => navigation.goBack()}
          style={{ marginTop: 24, borderRadius: 12 }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <LinearGradient
          colors={['#229B73', '#1a8f6e', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <View style={styles.profileIconContainer}>
            <Icon name="content-cut" size={48} color="#ffffff" />
          </View>
          <TitleText style={styles.tailorName}>{tailor.name}</TitleText>
          <RegularText style={styles.tailorNumber}>{getTailorNumber(tailor)}</RegularText>
        </LinearGradient>
      </View>

      {/* Edit Form Section */}
      <View style={styles.formSection}>
        <View style={styles.sectionHeader}>
          <TitleText style={styles.sectionTitle}>Edit Information</TitleText>
          <Icon name="edit" size={24} color={colors.brand} />
        </View>

        {/* Name Field */}
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelContainer}>
            <Icon name="person" size={20} color={colors.brand} />
            <RegularText style={styles.inputLabel}>Name</RegularText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter tailor name"
            placeholderTextColor={colors.textSecondary}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>

        {/* Mobile Number Field */}
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelContainer}>
            <Icon name="phone" size={20} color={colors.brand} />
            <RegularText style={styles.inputLabel}>Mobile Number</RegularText>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            placeholderTextColor={colors.textSecondary}
            value={form.mobileNumber}
            onChangeText={(text) => setForm({ ...form, mobileNumber: text })}
            keyboardType="phone-pad"
            autoCorrect={false}
          />
        </View>

        {/* Address Field */}
        <View style={styles.inputContainer}>
          <View style={styles.inputLabelContainer}>
            <Icon name="location-on" size={20} color={colors.brand} />
            <RegularText style={styles.inputLabel}>Address (Optional)</RegularText>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter address"
            placeholderTextColor={colors.textSecondary}
            value={form.address}
            onChangeText={(text) => setForm({ ...form, address: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          variant="gradient"
          title={updating ? "Updating..." : "Update Tailor"}
          height={56}
          gradientColors={['#229B73', '#1a8f6e', '#000000']}
          icon={<Icon name="save" size={24} color="#fff" />}
          onPress={handleSubmit}
          disabled={updating}
          style={{ marginBottom: 12, borderRadius: 12 }}
        />
        
        <Button
          variant="light"
          title="Cancel"
          height={56}
          onPress={() => navigation.goBack()}
          style={{ borderRadius: 12 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  profileCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  profileGradient: {
    padding: 32,
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tailorName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tailorNumber: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  formSection: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  actionSection: {
    margin: 16,
    marginBottom: 32,
  },
});

export default EditTailor;