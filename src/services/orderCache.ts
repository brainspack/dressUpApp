type OrderSnapshot = {
  clothes?: Array<any>;
  notes?: string;
  uploadedImages?: string[];
  createdAt?: number;
};

const cache: Record<string, OrderSnapshot> = {};

export const orderCache = {
  setSnapshot(orderId: string, snapshot: OrderSnapshot) {
    cache[orderId] = { ...snapshot, createdAt: Date.now() };
  },
  getSnapshot(orderId: string): OrderSnapshot | undefined {
    return cache[orderId];
  },
  clearSnapshot(orderId: string) {
    delete cache[orderId];
  },
};

export default orderCache;
