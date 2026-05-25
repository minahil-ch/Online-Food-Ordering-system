import type { Types } from 'mongoose';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { restaurantsSeedData, DEFAULT_MENU_IMAGE } from '../data/restaurantsSeed';

export async function createSeedRestaurants(ownerId: Types.ObjectId): Promise<void> {
  for (const data of restaurantsSeedData) {
    const { menu, ...fields } = data;
    const restaurant = await Restaurant.create({
      ...fields,
      ownerId,
      isOpen: true,
      openingHours: { open: '10:00', close: '22:00', days: 'Mon–Sun' },
    });
    for (const item of menu) {
      await MenuItem.create({
        ...item,
        restaurantId: restaurant._id,
        imageUrl: DEFAULT_MENU_IMAGE,
        tags: fields.cuisine,
        isAvailable: true,
      });
    }
  }
}
