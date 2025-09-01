
export type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  mobileNumber?: string;
  address?: string;
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

export interface ClothItem {
  id: string;
  orderId: string;
  type: string;
  color?: string | null;
  fabric?: string | null;
  materialCost?: number | null;
  designNotes?: string | null;
  imageUrls: string[];
  imageData?: string[]; // Store base64 strings instead of Buffer
  videoUrls: string[];
  createdAt: string;
  measurements: any[];
}

export interface Order {
  id: string;
  customerId: string;
  customer?: Customer;
  items?: OrderItem[];
  clothes?: ClothItem[];
  status: OrderStatus;
  orderType?: 'STITCHING' | 'ALTERATION'; // 🚀 Add orderType field
  alterationPrice?: number; // 🚀 Add alterationPrice field
  timeline?: TimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  serialNumber: number;
  shopId: string;
  tailorName?: string | null;
  tailorNumber?: string | null;
  assignedTo?: string | null; // Add this field for assignment tracking
  assignedAt?: string | null; // Add this field for assignment timestamp
  orderDate?: string;
  deliveryDate?: string | null;
  deletedAt?: string | null;
} 