// src/modules/order/order.schema.ts
import { Schema } from 'redis-om';

const ORDER_KEY_PREFIX = 'orders:orderId';
export const orderSchema = new Schema(ORDER_KEY_PREFIX, {
  id: { type: 'string' },
  orderStatus: { type: 'number' },
  userId: { type: 'string' },
  totalCheckOut: { type: 'number' },
  transactionData: { type: 'string' },
  quantity: { type: 'number' },
  eventId: { type: 'string' },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
});
