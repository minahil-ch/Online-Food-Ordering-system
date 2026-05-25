import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
const SALT_ROUNDS = 12;

const restaurantsData = [
  {
    name: 'Bella Italia Pizzeria',
    description: 'Authentic wood-fired pizzas and classic Italian pasta dishes.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    cuisine: ['Pizza', 'Italian'],
    rating: 4.8,
    deliveryTime: 25,
    minimumOrder: 15,
    deliveryFee: 2.99,
    menu: [
      { name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, tomato sauce', price: 12.99, category: 'Pizza', isPopular: true },
      { name: 'Pepperoni Feast', description: 'Double pepperoni with extra cheese', price: 15.99, category: 'Pizza', isPopular: true },
      { name: 'Spaghetti Carbonara', description: 'Creamy egg sauce with pancetta', price: 13.99, category: 'Pasta', isPopular: true },
      { name: 'Garlic Bread', description: 'Toasted with herb butter', price: 4.99, category: 'Sides' },
    ],
  },
  {
    name: 'Tokyo Sushi Bar',
    description: 'Fresh sushi and Japanese specialties made daily.',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-35317f6e7a88?w=800',
    cuisine: ['Sushi', 'Japanese'],
    rating: 4.9,
    deliveryTime: 35,
    minimumOrder: 20,
    deliveryFee: 3.49,
    menu: [
      { name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, category: 'Rolls', isPopular: true },
      { name: 'Dragon Roll', description: 'Eel, avocado, eel sauce', price: 14.99, category: 'Rolls', isPopular: true },
      { name: 'Miso Soup', description: 'Traditional soybean soup', price: 3.99, category: 'Appetizers' },
    ],
  },
  {
    name: 'Burger Haven',
    description: 'Gourmet burgers, crispy fries, and milkshakes.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    cuisine: ['Burgers', 'American'],
    rating: 4.6,
    deliveryTime: 20,
    minimumOrder: 12,
    deliveryFee: 1.99,
    menu: [
      { name: 'Classic Cheeseburger', description: 'Angus beef, cheddar, pickles', price: 11.99, category: 'Burgers', isPopular: true },
      { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon', price: 13.99, category: 'Burgers', isPopular: true },
      { name: 'Loaded Fries', description: 'Cheese, bacon, ranch', price: 6.99, category: 'Sides' },
    ],
  },
];

export async function autoSeedIfEmpty(): Promise<void> {
  if (process.env.AUTO_SEED !== 'true') return;

  const count = await Restaurant.countDocuments();
  if (count > 0) {
    console.log('Database already has data, skipping auto-seed');
    return;
  }

  console.log('Empty database — running auto-seed...');

  const adminHash = await bcrypt.hash('Admin@1234', SALT_ROUNDS);
  const userHash = await bcrypt.hash('User@1234', SALT_ROUNDS);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@food.com',
    passwordHash: adminHash,
    role: 'admin',
    phone: '5551234567',
    address: { street: '100 Admin St', city: 'Food City', zipCode: '12345' },
  });

  await User.create({
    name: 'John Customer',
    email: 'user@food.com',
    passwordHash: userHash,
    role: 'customer',
    phone: '5559876543',
    address: { street: '42 Oak Avenue', city: 'Food City', zipCode: '12345' },
  });

  for (const data of restaurantsData) {
    const { menu, ...fields } = data;
    const restaurant = await Restaurant.create({
      ...fields,
      ownerId: admin._id,
      isOpen: true,
      openingHours: { open: '10:00', close: '22:00', days: 'Mon–Sun' },
    });
    for (const item of menu) {
      await MenuItem.create({
        ...item,
        restaurantId: restaurant._id,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        tags: fields.cuisine,
        isAvailable: true,
      });
    }
  }

  console.log('Auto-seed complete (admin@food.com / Admin@1234)');
}
