import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { MainTabParamList } from '../navigation/types';
import Button from '../components/Button';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>DressUp</Text>
        <Text style={styles.subtitle}>{t('common.appDescription')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.quickActions')}</Text>
        <View style={styles.buttonGrid}>
          <Button
            title={{ key: 'customer.addCustomer' }}
            onPress={() => navigation.navigate('Customers')}
            variant="primary"
          />
          <Button
            title={{ key: 'order.create_new_order' }}
            onPress={() => navigation.navigate('Orders')}
            variant="primary"
          />
          <Button
            title={{ key: 'clothes.addClothes' }}
            onPress={() => navigation.navigate('Clothes')}
            variant="primary"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('common.recentActivity')}</Text>
        <View style={styles.activityList}>
          {/* Add your activity list items here */}
          <Text style={styles.activityItem}>{t('common.no_data')}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonGrid: {
    gap: 12,
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    fontSize: 14,
    color: '#666',
  },
});

export default Home; 