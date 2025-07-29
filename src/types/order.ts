export type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface TimelineEvent {
  date: string;
  event: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  status: OrderStatus;
  timeline?: TimelineEvent[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
} 