export type UserRole = 'customer' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card';
export type PaymentStatus = 'pending' | 'paid';

export interface Address {
  street: string;
  city: string;
  zipCode: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface IRestaurant {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string[];
  rating: number;
  isOpen: boolean;
  deliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  tags: string[];
  isAvailable: boolean;
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  id: string;
  userId: string;
  restaurantId: string;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  restaurant?: Pick<IRestaurant, 'id' | 'name' | 'imageUrl' | 'deliveryTime'>;
  user?: Pick<IUser, 'id' | 'name' | 'email' | 'phone'>;
}

export interface CartMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem {
  menuItem: CartMenuItem;
  quantity: number;
  restaurantId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  user: IUser;
}

export interface ValidationError {
  field: string;
  message: string;
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
];

export const CUISINE_OPTIONS = [
  'Pizza',
  'Sushi',
  'Burgers',
  'Indian',
  'Chinese',
  'Mexican',
  'Thai',
  'Italian',
  'Mediterranean',
  'Desserts',
] as const;
