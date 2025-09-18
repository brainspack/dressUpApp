/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { I18nextProvider } from 'react-i18next';
// import { SafeAreaProvider } from 'react-native-safe-area-context';
import i18n from './src/i18n/config';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import {  View, Text, StyleSheet } from 'react-native';
import apiService from './src/services/api';
import { useTranslation } from 'react-i18next';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OfflineGate from './src/components/OfflineGate';

// Import screens
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import GetStartedScreen from './src/screens/GetStarted/GetStartedScreen';
import Home from './src/screens/Home';
import CustomerList from './src/screens/Customer/CustomerList';
import CustomerDetails from './src/screens/Customer/CustomerDetails';
import AddCustomer from './src/screens/Customer/AddCustomer';
import EditCustomer from './src/screens/Customer/EditCustomer';
import OrderList from './src/screens/Order/OrderList';
import OrderDetails from './src/screens/Order/OrderDetails';
import AddOrder from './src/screens/Order/AddOrder';
import OutfitSelectionScreen from './src/screens/Order/OutfitSelectionScreen';
import OrderSummary from './src/screens/Order/OrderSummary';

import Login from './src/screens/Auth/Login';
import Register from './src/screens/Auth/Register';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
// import Tailors from './src/screens/Tailors';
import TailorList from './src/screens/Tailor/TailorList';
import TailorDetails from './src/screens/Tailor/TailorDetails';
import AddTailor from './src/screens/Tailor/AddTailor';
import EditTailor from './src/screens/Tailor/EditTailor';

// Import icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();
const OrderStack = createNativeStackNavigator();
const TailorStack = createNativeStackNavigator();


const getTabBarIcon = (route: any, color: string, size: number) => {
  let iconName = 'help';
  if (route.name === 'Home') {
    iconName = 'home';
  } else if (route.name === 'Customers') {
    iconName = 'account-group';
  } else if (route.name === 'Tailors') {
    iconName = 'scissors-cutting';
  } else if (route.name === 'Orders') {
    iconName = 'clipboard-list';
  } else if (route.name === 'Account') {
    iconName = 'account';
  }
  return <Icon name={iconName} size={size} color={color} />;
};

const StackHeaderTitle: React.FC<{ icon: string; label: string; marginLeft?: number }> = ({ icon, label, marginLeft = 8 }) => (
  <View style={styles.headerRow}>
    <Icon name={icon} size={30} color="#111827" />
    <Text style={[styles.headerText, { marginLeft }]}>{label}</Text>
  </View>
);

function OrderStackNavigator() {
  const { t } = useTranslation();
  return (
    <OrderStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
      }}
    >
      <OrderStack.Screen
        name="OrderList"
        component={OrderList}
        options={{
          // Clear the title so iOS doesn't center it; render our header in headerLeft
          title: '',
          headerLeft: () => (
            <StackHeaderTitle icon="clipboard-list" label={t('order.orders')} />
          ),
        }}
      />
      <OrderStack.Screen
        name="OrderDetails"
        component={OrderDetails}
        options={({  }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="receipt" label={t('order.orderDetails')} />
          ),
          headerBackTitleVisible: false,
        })}
      />
      <OrderStack.Screen
        name="AddOrder"
        component={AddOrder}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="plus-circle" label="Create Order" />
          ),
          headerBackTitleVisible: false,
        })}
      />
      <OrderStack.Screen
        name="OutfitSelection"
        component={OutfitSelectionScreen}
        options={{ headerShown: false }}
      />
      <OrderStack.Screen
        name="OrderSummary"
        component={OrderSummary}
        options={{ headerShown: false }}
      />
    </OrderStack.Navigator>
  );
}

function CustomerStackNavigator() {
  const { t } = useTranslation();
  return (
    <CustomerStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
      }}
    >
      <CustomerStack.Screen
        name="CustomerList"
        component={CustomerList}
        options={{
          title: '',
          headerLeft: () => (
            <StackHeaderTitle icon="account-group" label={t('customer.customers')} marginLeft={10} />
          ),
        }}
      />
      <CustomerStack.Screen
        name="CustomerDetails"
        component={CustomerDetails}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="account" label={t('customer.customerDetails')} />
          ),
          // Use the native back button only; remove custom left icon to avoid duplicates
          headerBackTitleVisible: false,
        })}
      />
      <CustomerStack.Screen
        name="AddCustomer"
        component={AddCustomer}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="account-plus" label={t('customer.addCustomer')} />
          ),
          headerBackTitleVisible: false,
        })}
      />
      <CustomerStack.Screen
        name="EditCustomer"
        component={EditCustomer}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="pencil" label={t('customer.editCustomer')} />
          ),
          headerBackTitleVisible: false,
        })}
      />
    </CustomerStack.Navigator>
  );
}

function TailorStackNavigator() {
  return (
    <TailorStack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
      }}
    >
      <TailorStack.Screen
        name="TailorList"
        component={TailorList}
        options={{
          title: '',
          headerLeft: () => (
            <StackHeaderTitle icon="scissors-cutting" label="Tailors" />
          ),
        }}
      />
      <TailorStack.Screen
        name="TailorDetails"
        component={TailorDetails}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="scissors-cutting" label="Tailor Details" />
          ),
          headerBackTitleVisible: false,
        })}
      />
      <TailorStack.Screen
        name="AddTailor"
        component={AddTailor}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="scissors-cutting" label="Add Tailor" />
          ),
          headerBackTitleVisible: false,
        })}
      />
      <TailorStack.Screen
        name="EditTailor"
        component={EditTailor}
        options={({ navigation: _navigation }) => ({
          headerTitle: () => (
            <StackHeaderTitle icon="scissors-cutting" label="Edit Tailor" />
          ),
          headerBackTitleVisible: false,
        })}
      />
    </TailorStack.Navigator>
  );
}


function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({ color, size}) => getTabBarIcon(route, color, size),
        tabBarActiveTintColor: '#2DBE91',
        tabBarInactiveTintColor: '#9AA0A6',
      })}>
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Tab.Screen name="Customers" component={CustomerStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Tailors" component={TailorStackNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Orders" component={OrderStackNavigator} options={{ headerShown: false }} />

      <Tab.Screen name="Account" component={ProfileScreen} options={{ headerShown: false }} />
      {/* If you want an icon in Account header as well, replace the line above with:
      <Tab.Screen name="Account" component={AccountScreen}
        options={{ headerTitle: () => (
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <Icon name="account-circle" size={20} color="#111827" />
            <Text style={{ marginLeft:8, fontSize:16, fontWeight:'700', color:'#111827' }}>{t('profile.profile')}</Text>
          </View>
        ) }}
      />
      */}
    </Tab.Navigator>
  );
}

function AuthStackWithContext() {
  const { setIsAuthenticated, setAccessToken } = useAuth();
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login">
        {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} setAccessToken={setAccessToken} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {props => <Register {...props} setIsAuthenticated={setIsAuthenticated} setAccessToken={setAccessToken} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function AppInner(): React.JSX.Element {
  const { isAuthenticated, loading, accessToken } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);
  const [showGetStarted, setShowGetStarted] = React.useState(false);


  // Debug logging
  React.useEffect(() => {
    console.log('AppInner: State changed - isAuthenticated:', isAuthenticated, 'showGetStarted:', showGetStarted);
  }, [isAuthenticated, showGetStarted]);

  // Set access token in API service when available
  React.useEffect(() => {
    if (accessToken) {
      apiService.setAccessToken(accessToken);
    }
  }, [accessToken]);

  // Show splash for 2 seconds, then GetStarted
  React.useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setShowGetStarted(true);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <OfflineGate>
      <NavigationContainer>
        {loading || showSplash ? (
          <SplashScreen />
        ) : isAuthenticated ? (
          <MainTabs />
        ) : showGetStarted ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GetStarted" component={GetStartedScreen} />
            <Stack.Screen name="Auth" component={AuthStackWithContext} />
          </Stack.Navigator>
        ) : (
          <AuthStackWithContext />
        )}
      </NavigationContainer>
      </OfflineGate>
    </I18nextProvider>
  );
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerText: { fontSize: 20, fontWeight: '700', color: '#111827' },
});