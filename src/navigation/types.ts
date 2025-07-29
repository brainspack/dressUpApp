export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Customers: undefined;
  Orders: undefined;
  Clothes: undefined;
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
  AddOrder: undefined;
  EditOrder: { orderId: string };
};

export type ClothesStackParamList = {
  ClothesHistory: undefined;
  AddClothes: undefined;
}; 