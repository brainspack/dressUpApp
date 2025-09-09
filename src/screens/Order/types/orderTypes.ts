export interface Cloth {
  id: string;
  type: string;
  color?: string | null;
  fabric?: string | null;
  materialCost: number;
  designNotes?: string;
  imageUrls: string[];
  videoUrls: string[];
}

export interface OrderFormItem {
  id: string;
  name: string;
  quantity: string;
  price: string;
  notes: string;
  color?: string;
  fabric?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes: string;
  color?: string;
  fabric?: string;
  imageUrls?: string[];
  videoUrls?: string[];
}

export interface Measurement {
  id: string;
  height?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  shoulder?: number;
  sleeveLength?: number;
  inseam?: number;
  neck?: number;
  armhole?: number;
  bicep?: number;
  wrist?: number;
  outseam?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  ankle?: number;
}

export interface OrderFormData {
  items: OrderItem[];
  clothes: Cloth[];
  status: string;
  notes: string;
  tailorName: string;
  tailorNumber: string;
  deliveryDate: string;
  trialDate: string;
  orderType: string;
  alterationPrice: string;
  measurements: Record<string, Measurement>;
}
