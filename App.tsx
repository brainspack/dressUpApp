/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/config';

// Import screens
import Home from './src/screens/Home';
import CustomerList from './src/screens/Customer/CustomerList';
import CustomerDetails from './src/screens/Customer/CustomerDetails';
import AddCustomer from './src/screens/Customer/AddCustomer';
import EditCustomer from './src/screens/Customer/EditCustomer';
import OrderList from './src/screens/Order/OrderList';
import OrderDetails from './src/screens/Order/OrderDetails';
import AddOrder from './src/screens/Order/AddOrder';
import ClothesHistory from './src/screens/Clothes/ClothesHistory';
import AddClothes from './src/screens/Clothes/AddClothes';
import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';
import AccountScreen from './src/screens/Account/AccountScreen';

// Import icons
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const OrderStack = createNativeStackNavigator();
const ClothesStack = createNativeStackNavigator();

const getTabBarIcon = (route: any, color: string, size: number) => {
  let iconName = 'help';
  if (route.name === 'Home') {
    iconName = 'home';
  } else if (route.name === 'Customers') {
    iconName = 'people';
  } else if (route.name === 'Orders') {
    iconName = 'list';
  } else if (route.name === 'Clothes') {
    iconName = 'checkroom';
  } else if (route.name === 'Account') {
    iconName = 'account_circle';
  }
  return <Icon name={iconName} size={size} color={color} />;
};

function OrderStackNavigator() {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen name="OrderList" component={OrderList} options={{ title: 'Orders' }} />
      <OrderStack.Screen name="OrderDetails" component={OrderDetails} options={{ title: 'Order Details' }} />
      <OrderStack.Screen name="AddOrder" component={AddOrder} options={{ title: 'Add Order' }} />
    </OrderStack.Navigator>
  );
}

function CustomerStackNavigator() {
  return (
    <CustomerStack.Navigator>
      <CustomerStack.Screen name="CustomerList" component={CustomerList} options={{ title: 'Customers' }} />
      <CustomerStack.Screen name="CustomerDetails" component={CustomerDetails} options={{ title: 'Customer Details' }} />
      <CustomerStack.Screen name="AddCustomer" component={AddCustomer} options={{ title: 'Add Customer' }} />
      <CustomerStack.Screen name="EditCustomer" component={EditCustomer} options={{ title: 'Edit Customer' }} />
    </CustomerStack.Navigator>
  );
}

function ClothesStackNavigator() {
  return (
    <ClothesStack.Navigator>
      <ClothesStack.Screen name="ClothesHistory" component={ClothesHistory} options={{ title: 'Clothes History' }} />
      <ClothesStack.Screen name="AddClothes" component={AddClothes} options={{ title: 'Add Clothes' }} />
    </ClothesStack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => getTabBarIcon(route, color, size),
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Customers" component={CustomerStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Orders" component={OrderStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Clothes" component={ClothesStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  const isAuthenticated = true;

  return (
    <I18nextProvider i18n={i18n}>
      <NavigationContainer>
        {isAuthenticated 
        ? <MainTabs /> :
         <AuthStack />}
      </NavigationContainer>
    </I18nextProvider>
  );
}

export default App;
