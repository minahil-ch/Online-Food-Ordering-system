import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';
import { restaurantsSeedData } from '../data/restaurantsSeed';
import { createSeedRestaurants } from '../utils/seedRestaurants';

dotenv.config();

const SALT_ROUNDS = 12;

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/food-ordering';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB for seeding');

  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuItem.deleteMany({}),
    Order.deleteMany({}),
  ]);

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

  const customer = await User.create({
    name: 'John Customer',
    email: 'user@food.com',
    passwordHash: userHash,
    role: 'customer',
    phone: '5559876543',
    address: { street: '42 Oak Avenue', city: 'Food City', zipCode: '12345' },
  });

  await User.create({
    name: 'Sarah Miller',
    email: 'sarah@food.com',
    passwordHash: await bcrypt.hash('User@1234', SALT_ROUNDS),
    role: 'customer',
    phone: '5552223333',
    address: { street: '15 Maple Street', city: 'Food City', zipCode: '12346' },
  });

  await createSeedRestaurants(admin._id);

  const restaurantIds = (await Restaurant.find().sort({ createdAt: 1 })).map((r) => r._id);
  const menuByRestaurant = new Map<string, (typeof MenuItem.prototype)[]>();
  for (const id of restaurantIds) {
    const items = await MenuItem.find({ restaurantId: id });
    menuByRestaurant.set(String(id), items);
  }

  // Sample orders for admin dashboard demo
  const bellaId = String(restaurantIds[0]);
  const bellaMenu = menuByRestaurant.get(bellaId)!;
  const sushiId = String(restaurantIds[1]);
  const sushiMenu = menuByRestaurant.get(sushiId)!;

  const sampleOrders = [
    {
      userId: customer._id,
      restaurantId: restaurantIds[0],
      items: [
        { menuItemId: bellaMenu[0]._id, name: bellaMenu[0].name, price: bellaMenu[0].price, quantity: 2 },
        { menuItemId: bellaMenu[6]._id, name: bellaMenu[6].name, price: bellaMenu[6].price, quantity: 1 },
      ],
      subtotal: bellaMenu[0].price * 2 + bellaMenu[6].price,
      deliveryFee: 2.99,
      status: 'preparing' as const,
      paymentMethod: 'card' as const,
      paymentStatus: 'paid' as const,
    },
    {
      userId: customer._id,
      restaurantId: restaurantIds[1],
      items: [
        { menuItemId: sushiMenu[1]._id, name: sushiMenu[1].name, price: sushiMenu[1].price, quantity: 1 },
        { menuItemId: sushiMenu[2]._id, name: sushiMenu[2].name, price: sushiMenu[2].price, quantity: 1 },
      ],
      subtotal: sushiMenu[1].price + sushiMenu[2].price,
      deliveryFee: 3.49,
      status: 'out_for_delivery' as const,
      paymentMethod: 'cash' as const,
      paymentStatus: 'pending' as const,
    },
    {
      userId: customer._id,
      restaurantId: restaurantIds[2],
      items: [
        { menuItemId: menuByRestaurant.get(String(restaurantIds[2]))![0]._id, name: 'Classic Cheeseburger', price: 11.99, quantity: 2 },
      ],
      subtotal: 23.98,
      deliveryFee: 1.99,
      status: 'delivered' as const,
      paymentMethod: 'card' as const,
      paymentStatus: 'paid' as const,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: customer._id,
      restaurantId: restaurantIds[0],
      items: [
        { menuItemId: bellaMenu[3]._id, name: bellaMenu[3].name, price: bellaMenu[3].price, quantity: 1 },
      ],
      subtotal: bellaMenu[3].price,
      deliveryFee: 2.99,
      status: 'pending' as const,
      paymentMethod: 'cash' as const,
      paymentStatus: 'pending' as const,
    },
  ];

  for (const orderData of sampleOrders) {
    const total = orderData.subtotal + orderData.deliveryFee;
    await Order.create({
      ...orderData,
      total,
      deliveryAddress: customer.address,
      createdAt: (orderData as { createdAt?: Date }).createdAt ?? new Date(),
    });
  }

  console.log('\n✅ Seed completed successfully!\n');
  console.log('── Login credentials ──');
  console.log('Admin:    admin@food.com  /  Admin@1234');
  console.log('Customer: user@food.com   /  User@1234');
  console.log('Customer: sarah@food.com  /  User@1234');
  console.log('\n── Data loaded ──');
  console.log(`• ${restaurantsSeedData.length} restaurants`);
  console.log(`• ${restaurantsSeedData.reduce((n, r) => n + r.menu.length, 0)} menu items`);
  console.log(`• ${sampleOrders.length} sample orders`);
  console.log('\n── Admin panel ──');
  console.log('1. Open http://localhost:5173/login');
  console.log('2. Log in as admin@food.com');
  console.log('3. Click "Admin" in the header or go to http://localhost:5173/admin\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
