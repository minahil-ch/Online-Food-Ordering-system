import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Restaurant, IRestaurantDocument } from '../models/Restaurant';
import { MenuItem } from '../models/MenuItem';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { toJSON } from '../utils/serialize';
import { uploadImage } from '../services/cloudinary';
import { parseFormBody } from '../utils/parseBody';

export async function listRestaurants(req: AuthRequest, res: Response): Promise<void> {
  const { search, cuisine, sort, open, page = '1', limit = '12' } = req.query;
  const filter: FilterQuery<IRestaurantDocument> = {};

  if (search && typeof search === 'string') {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { cuisine: { $regex: search, $options: 'i' } },
    ];
  }

  if (cuisine && typeof cuisine === 'string') {
    filter.cuisine = { $in: cuisine.split(',') };
  }

  if (open === 'true') {
    filter.isOpen = true;
  }

  let sortOption: Record<string, 1 | -1> = { rating: -1 };
  if (sort === 'deliveryTime') sortOption = { deliveryTime: 1 };
  if (sort === 'deliveryFee') sortOption = { deliveryFee: 1 };
  if (sort === 'name') sortOption = { name: 1 };

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10)));
  const skip = (pageNum - 1) * limitNum;

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter).sort(sortOption).skip(skip).limit(limitNum),
    Restaurant.countDocuments(filter),
  ]);

  sendSuccess(
    res,
    restaurants.map((r) => toJSON(r)),
    undefined,
    200,
    { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
  );
}

export async function getRestaurant(req: AuthRequest, res: Response): Promise<void> {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    sendError(res, 'Restaurant not found', 404);
    return;
  }

  const menuItems = await MenuItem.find({
    restaurantId: restaurant._id,
    isAvailable: true,
  }).sort({ category: 1, name: 1 });

  const grouped: Record<string, ReturnType<typeof toJSON>[]> = {};
  for (const item of menuItems) {
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(toJSON(item));
  }

  sendSuccess(res, {
    restaurant: toJSON(restaurant),
    menu: grouped,
    menuItems: menuItems.map((m) => toJSON(m)),
  });
}

export async function getRestaurantMenu(req: AuthRequest, res: Response): Promise<void> {
  const items = await MenuItem.find({ restaurantId: req.params.id }).sort({
    category: 1,
    name: 1,
  });

  const grouped: Record<string, ReturnType<typeof toJSON>[]> = {};
  for (const item of items) {
    const cat = item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(toJSON(item));
  }

  sendSuccess(res, grouped);
}

const DEFAULT_RESTAURANT_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

export async function createRestaurant(req: AuthRequest, res: Response): Promise<void> {
  const body = parseFormBody(req.body as Record<string, unknown>);
  let imageUrl = (body.imageUrl as string) || DEFAULT_RESTAURANT_IMAGE;
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, 'restaurants');
  }

  const restaurant = await Restaurant.create({
    name: body.name,
    description: body.description,
    cuisine: (body.cuisine as string[]) ?? [],
    rating: (body.rating as number) ?? 4.5,
    isOpen: body.isOpen !== undefined ? Boolean(body.isOpen) : true,
    deliveryTime: (body.deliveryTime as number) ?? 30,
    minimumOrder: (body.minimumOrder as number) ?? 10,
    deliveryFee: (body.deliveryFee as number) ?? 2.99,
    openingHours: body.openingHours ?? { open: '10:00', close: '22:00', days: 'Mon–Sun' },
    imageUrl,
    ownerId: req.user!.id,
  });

  sendSuccess(res, toJSON(restaurant), 'Restaurant created', 201);
}

export async function updateRestaurant(req: AuthRequest, res: Response): Promise<void> {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) {
    sendError(res, 'Restaurant not found', 404);
    return;
  }

  if (String(restaurant.ownerId) !== req.user!.id && req.user!.role !== 'admin') {
    sendError(res, 'Forbidden', 403);
    return;
  }

  let imageUrl = restaurant.imageUrl;
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, 'restaurants');
  }

  const body = parseFormBody(req.body as Record<string, unknown>);
  if (body.name) restaurant.name = body.name as string;
  if (body.description) restaurant.description = body.description as string;
  if (body.cuisine) restaurant.cuisine = body.cuisine as string[];
  if (body.rating !== undefined) restaurant.rating = body.rating as number;
  if (body.isOpen !== undefined) restaurant.isOpen = Boolean(body.isOpen);
  if (body.deliveryTime !== undefined) restaurant.deliveryTime = body.deliveryTime as number;
  if (body.minimumOrder !== undefined) restaurant.minimumOrder = body.minimumOrder as number;
  if (body.deliveryFee !== undefined) restaurant.deliveryFee = body.deliveryFee as number;
  if (body.openingHours) restaurant.openingHours = body.openingHours as typeof restaurant.openingHours;
  restaurant.imageUrl = imageUrl;
  await restaurant.save();

  sendSuccess(res, toJSON(restaurant), 'Restaurant updated');
}

export async function deleteRestaurant(req: AuthRequest, res: Response): Promise<void> {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
  if (!restaurant) {
    sendError(res, 'Restaurant not found', 404);
    return;
  }
  await MenuItem.deleteMany({ restaurantId: restaurant._id });
  sendSuccess(res, undefined, 'Restaurant deleted');
}
