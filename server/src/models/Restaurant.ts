import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRestaurantDocument extends Document {
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string[];
  rating: number;
  isOpen: boolean;
  deliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  ownerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurantDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    cuisine: { type: [String], default: [] },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    isOpen: { type: Boolean, default: true },
    deliveryTime: { type: Number, default: 30, min: 1 },
    minimumOrder: { type: Number, default: 10, min: 0 },
    deliveryFee: { type: Number, default: 2.99, min: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 'text', cuisine: 'text' });
restaurantSchema.index({ ownerId: 1 });

export const Restaurant = mongoose.model<IRestaurantDocument>(
  'Restaurant',
  restaurantSchema
);
