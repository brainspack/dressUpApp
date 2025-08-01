import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLanguage } from '../context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import LoginScreen from '../screens/Auth/Login';
import RegisterScreen from '../screens/Auth/Register';
import Home from '../screens/Home';
import CustomerListScreen from '../screens/Customer/CustomerList';
import CustomerDetailsScreen from '../screens/Customer/CustomerDetails';
import AddCustomerScreen from '../screens/Customer/AddCustomer';
import EditCustomerScreen from '../screens/Customer/EditCustomer';
import OrderListScreen from '../screens/Order/OrderList';
import OrderDetailsScreen from '../screens/Order/OrderDetails';
import AddOrderScreen from '../screens/Order/AddOrder';
import ClothesHistoryScreen from '../screens/Clothes/ClothesHistory';
import AddClothesScreen from '../screens/Clothes/AddClothes';

// Import types
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  CustomerStackParamList,
  OrderStackParamList,
  ClothesStackParamList,
} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const OrderStack = createNativeStackNavigator<OrderStackParamList>();
const ClothesStack = createNativeStackNavigator<ClothesStackParamList>();

// Auth Navigator
const AuthNavigator = ({ setIsAuthenticated }: { setIsAuthenticated: (v: boolean) => void }) => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login">
        {props => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {props => <RegisterScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

// Customer Navigator
const CustomerNavigator = () => {
  return (
    <CustomerStack.Navigator>
      <CustomerStack.Screen 
        name="CustomerList" 
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <CustomerStack.Screen 
        name="CustomerDetails" 
        component={CustomerDetailsScreen}
        options={{ title: 'Customer Details' }}
      />
      <CustomerStack.Screen 
        name="AddCustomer" 
        component={AddCustomerScreen}
        options={{ title: 'Add Customer' }}
      />
      <CustomerStack.Screen 
        name="EditCustomer" 
        component={EditCustomerScreen}
        options={{ title: 'Edit Customer' }}
      />
    </CustomerStack.Navigator>
  );
};

// Order Navigator
const OrderNavigator = () => {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen 
        name="OrderList" 
        component={OrderListScreen}
        options={{ title: 'Orders' }}
      />
      <OrderStack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen}
        options={{ title: 'Order Details' }}
      />
      <OrderStack.Screen 
        name="AddOrder" 
        component={AddOrderScreen}
        options={{ title: 'Add Order' }}
      />
    </OrderStack.Navigator>
  );
};

// Clothes Navigator
const ClothesNavigator = () => {
  return (
    <ClothesStack.Navigator>
      <ClothesStack.Screen 
        name="ClothesHistory" 
        component={ClothesHistoryScreen}
        options={{ title: 'Clothes History' }}
      />
      <ClothesStack.Screen 
        name="AddClothes" 
        component={AddClothesScreen}
        options={{ title: 'Add Clothes' }}
      />
    </ClothesStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  return (
    <MainTab.Navigator>
      <MainTab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen 
        name="Customers" 
        component={CustomerNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen 
        name="Orders" 
        component={OrderNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="clipboard-list" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen 
        name="Clothes" 
        component={ClothesNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="hanger" size={size} color={color} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
};

// Root Navigator
const AppNavigatorInner = () => {
  const { currentLanguage } = useLanguage();
  const { isAuthenticated, setIsAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const AppNavigator = () => (
  <AuthProvider>
    <AppNavigatorInner />
  </AuthProvider>
);

export default AppNavigator; 