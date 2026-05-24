import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  restaurantId: z.string().min(1, 'Restaurant is required'),
  isAvailable: z.boolean().optional(),
  isPopular: z.boolean().optional(),
});

export type MenuItemForm = z.infer<typeof menuItemSchema>;
