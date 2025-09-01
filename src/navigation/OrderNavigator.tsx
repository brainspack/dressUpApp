import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrderList from '../screens/Order/OrderList';
import OrderDetails from '../screens/Order/OrderDetails';
import AddOrder from '../screens/Order/AddOrder';
import OrderSummary from '../screens/Order/OrderSummary';
import type { OrderStackParamList } from './types';

const Stack = createNativeStackNavigator<OrderStackParamList>();

const OrderNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="OrderList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OrderList" component={OrderList} />
      <Stack.Screen name="OrderDetails" component={OrderDetails} />
      <Stack.Screen name="AddOrder" component={AddOrder} />
      <Stack.Screen name="OrderSummary" component={OrderSummary} />
    </Stack.Navigator>
  );
};

export default OrderNavigator;
