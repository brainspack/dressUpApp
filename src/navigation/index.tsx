import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View, Text } from 'react-native';
import colors from '../constants/colors';

// Import screens
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import GetStartedScreen from '../screens/GetStarted/GetStartedScreen';
import Login from '../screens/Auth/Login';
import Register from '../screens/Auth/Register';
import Home from '../screens/Home';
import CustomerListScreen from '../screens/Customer/CustomerList';
import CustomerDetailsScreen from '../screens/Customer/CustomerDetails';
import AddCustomerScreen from '../screens/Customer/AddCustomer';
import EditCustomerScreen from '../screens/Customer/EditCustomer';
import OrderListScreen from '../screens/Order/OrderList';
import OrderDetailsScreen from '../screens/Order/OrderDetails';
import AddOrderScreen from '../screens/Order/AddOrder';
import OutfitSelectionScreen from '../screens/Order/OutfitSelectionScreen';
import OrderSummaryScreen from '../screens/Order/OrderSummary';

import AddTailor from '../screens/Tailor/AddTailor';
import TailorList from '../screens/Tailor/TailorList';
import TailorDetails from '../screens/Tailor/TailorDetails';
import EditTailor from '../screens/Tailor/EditTailor';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import AddMeasurement from '../screens/Measurement/AddMeasurement';
import MeasurementHistory from '../screens/Measurement/MeasurementHistory';

// Import types
import {
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  CustomerStackParamList,
  OrderStackParamList,

} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const OrderStack = createNativeStackNavigator<OrderStackParamList>();

const TailorStack = createNativeStackNavigator();

// Auth Navigator
const AuthNavigator = ({ setIsAuthenticated, setAccessToken }: { setIsAuthenticated: (v: boolean) => void; setAccessToken: (token: string | null) => void }) => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login">
        {props => <Login {...props} setIsAuthenticated={setIsAuthenticated} setAccessToken={setAccessToken} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {props => <Register {...props} setIsAuthenticated={setIsAuthenticated} setAccessToken={setAccessToken} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

// Customer Navigator
const CustomerNavigator = () => {
  return (
    <CustomerStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <CustomerStack.Screen 
        name="CustomerList" 
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <CustomerStack.Screen 
        name="CustomerDetails" 
        component={CustomerDetailsScreen}
        options={{ headerShown: false }}
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
      <CustomerStack.Screen 
        name="AddMeasurement" 
        component={AddMeasurement}
        options={{ title: 'Add Measurement' }}
      />
      <CustomerStack.Screen 
        name="MeasurementHistory" 
        component={MeasurementHistory}
        options={{ title: 'Measurement History' }}
      />
    </CustomerStack.Navigator>
  );
};

// Order Navigator
const OrderNavigator = () => {
  return (
    <OrderStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <OrderStack.Screen 
        name="OrderList" 
        component={OrderListScreen}
      />
      <OrderStack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen}
      />
      <OrderStack.Screen 
        name="AddOrder" 
        component={AddOrderScreen}
      />
      <OrderStack.Screen 
        name="OutfitSelection" 
        component={OutfitSelectionScreen}
      />
      <OrderStack.Screen 
        name="OrderSummary" 
        component={OrderSummaryScreen}
        // Force reload - OrderSummary screen registration - Updated at 4:21 PM
      />
    </OrderStack.Navigator>
  );
};



// Tailor Navigator
const TailorNavigator = () => {
  const { t, i18n } = useTranslation();
  
  // Force re-render when language changes
  const screenOptions = React.useMemo(() => ({
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.white,
    },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      fontWeight: 'bold' as const,
    },
  }), [i18n.language]);

  return (
    <TailorStack.Navigator screenOptions={screenOptions}>
      <TailorStack.Screen 
        name="TailorList" 
        component={TailorList} 
        options={({ route }) => ({ title: t('tailor.tailors') })}
      />
      <TailorStack.Screen 
        name="TailorDetails" 
        component={TailorDetails} 
        options={({ route }) => ({ title: t('tailor.tailorDetails') })}
      />
      <TailorStack.Screen 
        name="AddTailor" 
        component={AddTailor} 
        options={({ route }) => ({ title: t('tailor.addTailor') })}
      />
      <TailorStack.Screen 
        name="EditTailor" 
        component={EditTailor} 
        options={({ route }) => ({ title: t('tailor.editTailor') })}
      />
    </TailorStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { t } = useTranslation();
  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.gray400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          textAlign: 'center',
          maxWidth: 60,
          overflow: 'hidden',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minWidth: 0,
        }
      }}
    >
      <MainTab.Screen 
        name="Home" 
        component={Home}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 50 }}>
              <Text style={{ fontSize: 9, fontWeight: '500', color: focused ? colors.brand : colors.gray400, textAlign: 'center' }}>
                {t('order.home')}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <MainTab.Screen 
        name="Customers" 
        component={CustomerNavigator}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 50 }}>
              <Text style={{ fontSize: 9, fontWeight: '500', color: focused ? colors.brand : colors.gray400, textAlign: 'center' }}>
                {t('order.customers')}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Reset Customers stack to CustomerList when tab is pressed
            (navigation as any).navigate('Customers', { screen: 'CustomerList' });
          },
        })}
      />
      <MainTab.Screen 
        name="Tailors" 
        component={TailorNavigator}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 50 }}>
              <Text style={{ fontSize: 9, fontWeight: '500', color: focused ? colors.brand : colors.gray400, textAlign: 'center' }}>
                {t('order.tailors')}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Icon name="scissors-cutting" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Reset Tailors stack to TailorList when tab is pressed
            (navigation as any).navigate('Tailors', { screen: 'TailorList' });
          },
        })}
      />
      <MainTab.Screen 
        name="Orders" 
        component={OrderNavigator}
        options={{
          headerShown: false,
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 50 }}>
              <Text style={{ fontSize: 9, fontWeight: '500', color: focused ? colors.brand : colors.gray400, textAlign: 'center' }}>
                {t('order.orders')}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-list" size={size} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Reset Orders stack to OrderList when tab is pressed
            (navigation as any).navigate('Orders', { screen: 'OrderList' });
          },
        })}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 50 }}>
              <Text style={{ fontSize: 9, fontWeight: '500', color: focused ? colors.brand : colors.gray400, textAlign: 'center' }}>
                {t('order.profile')}
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </MainTab.Navigator>
  );
};

// SplashScreen Wrapper Component
const SplashScreenWrapper = ({ navigation }: { navigation: any }) => {
  console.log('SplashScreenWrapper rendered');
  
  React.useEffect(() => {
    console.log('SplashScreen timer started');
    const timer = setTimeout(() => {
      console.log('Navigating to GetStarted');
      navigation.replace('GetStarted');
    }, 3000);

    return () => {
      console.log('SplashScreen timer cleared');
      clearTimeout(timer);
    };
  }, [navigation]);

  return <SplashScreen />;
};

// GetStarted Wrapper Component
const GetStartedWrapper = ({  }: { navigation: any }) => {
  console.log('GetStartedWrapper rendered');
  
  // GetStartedScreen uses useNavigation directly, so we don't need to pass props
  return <GetStartedScreen />;
};

// Root Navigator
const AppNavigatorInner = () => {
  const { isAuthenticated, setIsAuthenticated, setAccessToken, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.brandDark} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash">
          {(props) => <SplashScreenWrapper navigation={props.navigation} />}
        </Stack.Screen>
        <Stack.Screen name="GetStarted">
          {(props) => <GetStartedWrapper navigation={props.navigation} />}
        </Stack.Screen>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator setIsAuthenticated={setIsAuthenticated} setAccessToken={setAccessToken} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="AddTailor" component={AddTailor} />
          </>
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