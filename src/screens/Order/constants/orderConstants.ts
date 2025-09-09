import { OrderStatus } from '../../../types/order';

export const statusOptions = (t: (key: string) => string) => [
  { label: t('order.pending'), value: 'pending' as OrderStatus },
  { label: t('order.inProgress'), value: 'in_progress' as OrderStatus },
  { label: t('order.delivered'), value: 'delivered' as OrderStatus },
  { label: t('order.cancelled'), value: 'cancelled' as OrderStatus },
];

export const statusMap: Record<string, string> = {
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  ready: 'READY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

export const orderTypes = {
  STITCHING: 'stitching',
  ALTERATION: 'alteration',
} as const;
