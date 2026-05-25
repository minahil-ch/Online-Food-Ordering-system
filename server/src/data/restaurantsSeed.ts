/** Shared restaurant + menu dummy data for seed.ts and autoSeed.ts */
export type SeedMenuItem = {
  name: string;
  description: string;
  price: number;
  category: string;
  isPopular?: boolean;
};

export type SeedRestaurant = {
  name: string;
  description: string;
  imageUrl: string;
  cuisine: string[];
  rating: number;
  deliveryTime: number;
  minimumOrder: number;
  deliveryFee: number;
  menu: SeedMenuItem[];
};

export const restaurantsSeedData: SeedRestaurant[] = [
  {
    name: 'Bella Italia Pizzeria',
    description:
      'Authentic wood-fired pizzas and classic Italian pasta dishes made with imported ingredients.',
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

export const DEFAULT_MENU_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
