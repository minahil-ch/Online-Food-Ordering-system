import mongoose, { Schema, Document } from 'mongoose';
import type { UserRole } from '@food-ordering/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  address?: {
    street: string;
    city: string;
    zipCode: string;
  };
  refreshToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    phone: { type: String, trim: true },
    address: addressSchema,
    refreshToken: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
