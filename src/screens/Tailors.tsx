import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TailorList from './Tailor/TailorList';
import AddTailor from './Tailor/AddTailor';
import TailorDetails from './Tailor/TailorDetails';
import EditTailor from './Tailor/EditTailor';
import TailorAssignedOrders from './Tailor/TailorAssignedOrders';
import { useTranslation } from 'react-i18next';

const TailorStack = createNativeStackNavigator();

const Title = ({ icon, label }: { icon: string; label: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Icon name={icon} size={30} color="#111827" />
    <Text style={{ marginLeft: 8, fontSize: 20, fontWeight: '700', color: '#111827' }}>{label}</Text>
  </View>
);

const Tailors = () => {
  const { t } = useTranslation();
  return (
    <TailorStack.Navigator>
      <TailorStack.Screen name="TailorList" component={TailorList} options={{ headerTitle: () => <Title icon="content-cut" label={t('tailor.tailors')} /> }} />
      <TailorStack.Screen name="AddTailor" component={AddTailor} options={{ headerTitle: () => <Title icon="person-add" label={t('tailor.addTailor')} /> }} />
      <TailorStack.Screen name="TailorDetails" component={TailorDetails} options={{ headerTitle: () => <Title icon="person" label={t('tailor.tailorDetails')} /> }} />
      <TailorStack.Screen name="EditTailor" component={EditTailor} options={{ headerTitle: () => <Title icon="edit" label={t('tailor.editTailor')} /> }} />
      <TailorStack.Screen name="TailorAssignedOrders" component={TailorAssignedOrders} options={{ headerShown: false }} />
    </TailorStack.Navigator>
  );
};

export default Tailors;