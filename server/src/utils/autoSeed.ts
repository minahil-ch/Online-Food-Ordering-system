import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { restaurantsSeedData } from '../data/restaurantsSeed';
import { createSeedRestaurants } from './seedRestaurants';

const SALT_ROUNDS = 12;

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

  await createSeedRestaurants(admin._id);

  const menuCount = restaurantsSeedData.reduce((n, r) => n + r.menu.length, 0);
  console.log(
    `Auto-seed complete: ${restaurantsSeedData.length} restaurants, ${menuCount} menu items`
  );
  console.log('Logins: admin@food.com / Admin@1234  |  user@food.com / User@1234');
}
