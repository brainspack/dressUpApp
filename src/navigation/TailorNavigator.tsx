import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddTailor from '../screens/Tailor/AddTailor';
import TailorList from '../screens/Tailor/TailorList';
import TailorDetails from '../screens/Tailor/TailorDetails';
import EditTailor from '../screens/Tailor/EditTailor';
import TailorAssignedOrders from '../screens/Tailor/TailorAssignedOrders';
import { TailorStackParamList } from './types';

const Stack = createNativeStackNavigator<TailorStackParamList>();

const TailorNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TailorList" 
        component={TailorList} 
        options={{ title: 'Tailors' }}
      />
      <Stack.Screen 
        name="TailorDetails" 
        component={TailorDetails} 
        options={{ title: 'Tailor Details' }}
      />
      <Stack.Screen 
        name="AddTailor" 
        component={AddTailor} 
        options={{ title: 'Add Tailor' }}
      />
      <Stack.Screen 
        name="EditTailor" 
        component={EditTailor} 
        options={{ title: 'Edit Tailor' }}
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