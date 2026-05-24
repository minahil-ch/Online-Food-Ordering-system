import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMenuItemDocument extends Document {
  restaurantId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tags: string[];
  isAvailable: boolean;
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItemDocument>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '' },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

menuItemSchema.index({ restaurantId: 1, category: 1 });

export const MenuItem = mongoose.model<IMenuItemDocument>('MenuItem', menuItemSchema);
