import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  GetStarted: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: undefined;
  AddTailor: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Customers: undefined;
  Tailors: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type CustomerStackParamList = {
  CustomerList: undefined;
  CustomerDetails: { customerId: string };
  AddCustomer: undefined;
  EditCustomer: { customerId: string };
};

export type OrderStackParamList = {
  OrderList: undefined;
  OrderDetails: { orderId: string };
  AddOrder: { 
    customerId: string; 
    shopId: string; 
    customerName: string;
    outfitType?: string;
    gender?: 'female' | 'male';
    orderType?: 'stitching' | 'alteration';
    outfitId: string;
    outfitPrice?: number; // Keep this for AddOrder navigation but it will be 0 initially
  };
  OutfitSelection: {
    customerId?: string;
    shopId?: string;
    customerName?: string;
    orderType?: 'stitching' | 'alteration';
    existingOutfits?: Array<{
      id: string;
      name: string;
      type: string;
      image: any;
      gender: 'male' | 'female';
    }>;
  };
  OrderSummary: {
    customerId: string;
    shopId: string;
    customerName: string;
    selectedOutfits: Array<{
      id: string;
      name: string;
      type: string;
      image: any;
      gender: 'male' | 'female';
      price?: number; // Keep this for OrderSummary but it will be set by user input
    }>;
  };
};



export type TailorStackParamList = {
  TailorList: undefined;
  TailorDetails: { tailorId: string };
  AddTailor: undefined;
  EditTailor: { tailorId: string };
  TailorAssignedOrders: { tailorId: string; tailorName: string };
}; 