import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AddTailor from '../screens/Tailor/AddTailor';
import TailorList from '../screens/Tailor/TailorList';
import TailorDetails from '../screens/Tailor/TailorDetails';
import EditTailor from '../screens/Tailor/EditTailor';
import TailorAssignedOrders from '../screens/Tailor/TailorAssignedOrders';
import { TailorStackParamList } from './types';

const Stack = createNativeStackNavigator<TailorStackParamList>();

const TailorNavigator = () => {
  const { t, i18n } = useTranslation();
  
  // Force re-render when language changes
  const screenOptions = React.useMemo(() => ({
    headerShown: true,
    headerStyle: {
      backgroundColor: '#ffffff',
    },
    headerTintColor: '#111827',
    headerTitleStyle: {
      fontWeight: 'bold' as const,
    },
  }), [i18n.language]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="TailorList" 
        component={TailorList} 
        options={({ route }) => ({ title: t('tailor.tailors') })}
      />
      <Stack.Screen 
        name="TailorDetails" 
        component={TailorDetails} 
        options={({ route }) => ({ title: t('tailor.tailorDetails') })}
      />
      <Stack.Screen 
        name="AddTailor" 
        component={AddTailor} 
        options={({ route }) => ({ title: t('tailor.addTailor') })}
      />
      <Stack.Screen 
        name="EditTailor" 
        component={EditTailor} 
        options={({ route }) => ({ title: t('tailor.editTailor') })}
      />
      <Stack.Screen 
        name="TailorAssignedOrders" 
        component={TailorAssignedOrders} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default TailorNavigator;