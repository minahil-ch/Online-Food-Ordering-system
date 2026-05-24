import { Types } from 'mongoose';
import type { OrderStatus } from '@food-ordering/shared';
import { IOrderDocument } from '../models/Order';

export function appendStatusHistory(
  order: IOrderDocument,
  status: OrderStatus,
  userId?: string,
  note?: string
): void {
  order.status = status;
  order.statusHistory.push({
    status,
    changedAt: new Date(),
    ...(userId ? { changedBy: new Types.ObjectId(userId) } : {}),
    ...(note ? { note } : {}),
  });
}
