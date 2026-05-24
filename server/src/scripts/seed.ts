import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { Order } from '../models/Order';

dotenv.config();

const SALT_ROUNDS = 12;

const restaurantsData = [
  {
    name: 'Bella Italia Pizzeria',
    description: 'Authentic wood-fired pizzas and classic Italian pasta dishes made with imported ingredients.',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
    cuisine: ['Pizza', 'Italian'],
    rating: 4.8,
    deliveryTime: 25,
    minimumOrder: 15,
    deliveryFee: 2.99,
    menu: [
      { name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, tomato sauce', price: 12.99, category: 'Pizza', isPopular: true },
      { name: 'Pepperoni Feast', description: 'Double pepperoni with extra cheese', price: 15.99, category: 'Pizza', isPopular: true },
      { name: 'Quattro Formaggi', description: 'Four cheese blend on thin crust', price: 14.99, category: 'Pizza' },
      { name: 'Spaghetti Carbonara', description: 'Creamy egg sauce with pancetta', price: 13.99, category: 'Pasta', isPopular: true },
      { name: 'Fettuccine Alfredo', description: 'Rich parmesan cream sauce', price: 12.99, category: 'Pasta' },
      { name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 6.99, category: 'Desserts' },
      { name: 'Garlic Bread', description: 'Toasted with herb butter', price: 4.99, category: 'Sides' },
    ],
  },
  {
    name: 'Tokyo Sushi Bar',
    description: 'Fresh sushi, sashimi, and Japanese specialties prepared daily by expert chefs.',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-35317f6e7a88?w=800',
    cuisine: ['Sushi', 'Japanese'],
    rating: 4.9,
    deliveryTime: 35,
    minimumOrder: 20,
    deliveryFee: 3.49,
    menu: [
      { name: 'Salmon Nigiri (2pc)', description: 'Fresh Atlantic salmon over rice', price: 5.99, category: 'Nigiri', isPopular: true },
      { name: 'California Roll', description: 'Crab, avocado, cucumber', price: 8.99, category: 'Rolls', isPopular: true },
      { name: 'Dragon Roll', description: 'Eel, avocado, cucumber, eel sauce', price: 14.99, category: 'Rolls', isPopular: true },
      { name: 'Spicy Tuna Roll', description: 'Spicy tuna with cucumber', price: 10.99, category: 'Rolls' },
      { name: 'Miso Soup', description: 'Traditional soybean soup', price: 3.99, category: 'Appetizers' },
      { name: 'Edamame', description: 'Steamed soybeans with sea salt', price: 4.99, category: 'Appetizers' },
      { name: 'Mochi Ice Cream', description: 'Assorted flavors (3pc)', price: 5.99, category: 'Desserts' },
      { name: 'Chicken Teriyaki Bowl', description: 'Grilled chicken with teriyaki glaze', price: 13.99, category: 'Bowls' },
    ],
  },
  {
    name: 'Burger Haven',
    description: 'Gourmet burgers, crispy fries, and hand-spun milkshakes for the ultimate comfort food fix.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    cuisine: ['Burgers', 'American'],
    rating: 4.6,
    deliveryTime: 20,
    minimumOrder: 12,
    deliveryFee: 1.99,
    menu: [
      { name: 'Classic Cheeseburger', description: 'Angus beef, cheddar, pickles', price: 11.99, category: 'Burgers', isPopular: true },
      { name: 'BBQ Bacon Burger', description: 'Smoky BBQ sauce, crispy bacon', price: 13.99, category: 'Burgers', isPopular: true },
      { name: 'Mushroom Swiss Burger', description: 'Sautéed mushrooms, Swiss cheese', price: 12.99, category: 'Burgers' },
      { name: 'Crispy Chicken Sandwich', description: 'Buttermilk fried chicken', price: 10.99, category: 'Sandwiches', isPopular: true },
      { name: 'Loaded Fries', description: 'Cheese, bacon, ranch drizzle', price: 6.99, category: 'Sides' },
      { name: 'Onion Rings', description: 'Beer-battered golden rings', price: 5.49, category: 'Sides' },
      { name: 'Chocolate Milkshake', description: 'Thick and creamy', price: 5.99, category: 'Drinks' },
    ],
  },
  {
    name: 'Spice Route Indian Kitchen',
    description: 'Aromatic curries, tandoori specials, and fresh naan from traditional family recipes.',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008592f82?w=800',
    cuisine: ['Indian'],
    rating: 4.7,
    deliveryTime: 30,
    minimumOrder: 18,
    deliveryFee: 2.49,
    menu: [
      { name: 'Butter Chicken', description: 'Creamy tomato curry with tender chicken', price: 14.99, category: 'Curries', isPopular: true },
      { name: 'Chicken Tikka Masala', description: 'Grilled chicken in spiced gravy', price: 15.49, category: 'Curries', isPopular: true },
      { name: 'Palak Paneer', description: 'Spinach and cottage cheese curry', price: 12.99, category: 'Curries' },
      { name: 'Garlic Naan', description: 'Fresh baked flatbread', price: 3.99, category: 'Breads', isPopular: true },
      { name: 'Vegetable Biryani', description: 'Fragrant basmati rice with spices', price: 11.99, category: 'Rice' },
      { name: 'Samosas (4pc)', description: 'Crispy pastry with spiced potato filling', price: 5.99, category: 'Appetizers' },
      { name: 'Mango Lassi', description: 'Sweet yogurt mango drink', price: 4.49, category: 'Drinks' },
    ],
  },
  {
    name: 'Dragon Wok Chinese',
    description: 'Classic Chinese favorites including stir-fries, noodles, and dim sum.',
    imageUrl: 'https://images.unsplash.com/photo-1525755662778-989dbe090841?w=800',
    cuisine: ['Chinese'],
    rating: 4.5,
    deliveryTime: 28,
    minimumOrder: 15,
    deliveryFee: 2.29,
    menu: [
      { name: 'Kung Pao Chicken', description: 'Spicy peanuts and vegetables', price: 13.49, category: 'Mains', isPopular: true },
      { name: 'Sweet & Sour Pork', description: 'Crispy pork with tangy sauce', price: 12.99, category: 'Mains', isPopular: true },
      { name: 'Beef Chow Mein', description: 'Stir-fried noodles with beef', price: 11.99, category: 'Noodles' },
      { name: 'Vegetable Fried Rice', description: 'Wok-tossed rice with mixed veggies', price: 9.99, category: 'Rice' },
      { name: 'Spring Rolls (6pc)', description: 'Crispy vegetable rolls', price: 5.49, category: 'Appetizers' },
      { name: 'Hot & Sour Soup', description: 'Traditional spicy soup', price: 4.99, category: 'Soups' },
      { name: 'Fortune Cookies', description: 'Classic crispy cookies', price: 2.99, category: 'Desserts' },
    ],
  },
];

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

  const restaurantIds: mongoose.Types.ObjectId[] = [];
  const menuByRestaurant: Map<string, typeof MenuItem.prototype[]> = new Map();

  for (const data of restaurantsData) {
    const { menu, ...restaurantFields } = data;
    const restaurant = await Restaurant.create({
      ...restaurantFields,
      ownerId: admin._id,
      isOpen: true,
    });
    restaurantIds.push(restaurant._id);

    const items = [];
    for (const item of menu) {
      const created = await MenuItem.create({
        ...item,
        restaurantId: restaurant._id,
        imageUrl: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`,
        tags: data.cuisine,
        isAvailable: true,
      });
      items.push(created);
    }
    menuByRestaurant.set(String(restaurant._id), items);
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
  console.log(`• ${restaurantsData.length} restaurants`);
  console.log(`• ${restaurantsData.reduce((n, r) => n + r.menu.length, 0)} menu items`);
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
