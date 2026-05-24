import mongoose, { Schema, Document, Types } from 'mongoose';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@food-ordering/shared';

export interface IOrderItemEmbedded {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrderDocument extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  items: IOrderItemEmbedded[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: { type: [orderItemSchema], required: true, validate: [(v: unknown[]) => v.length > 0, 'Order must have items'] },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveryAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1 });

export const Order = mongoose.model<IOrderDocument>('Order', orderSchema);
