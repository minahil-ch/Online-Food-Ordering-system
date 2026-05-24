import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Order, IOrderDocument } from '../models/Order';
import { MenuItem } from '../models/MenuItem';
import { Restaurant } from '../models/Restaurant';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { toJSON } from '../utils/serialize';
import { emitOrderStatusUpdate } from '../services/socket';
import { appendStatusHistory } from '../utils/orderStatus';
import type { OrderStatus } from '@food-ordering/shared';

async function enrichOrder(order: IOrderDocument) {
  const json = toJSON(order) as Record<string, unknown>;
  const restaurant = await Restaurant.findById(order.restaurantId).select(
    'name imageUrl deliveryTime'
  );
  if (restaurant) {
    json.restaurant = {
      id: String(restaurant._id),
      name: restaurant.name,
      imageUrl: restaurant.imageUrl,
      deliveryTime: restaurant.deliveryTime,
    };
  }
  return json;
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  if (req.user!.role === 'admin') {
    sendError(res, 'Admins cannot place orders. Use a customer account.', 403);
    return;
  }

  const { restaurantId, items, deliveryAddress, paymentMethod } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    sendError(res, 'Restaurant not found', 404);
    return;
  }

  if (!restaurant.isOpen) {
    sendError(res, 'Restaurant is currently closed', 400);
    return;
  }

  const orderItems: { menuItemId: string; name: string; price: number; quantity: number }[] = [];
  let subtotal = 0;

  for (const line of items) {
    const menuItem = await MenuItem.findById(line.menuItemId);
    if (!menuItem || String(menuItem.restaurantId) !== restaurantId) {
      sendError(res, `Invalid menu item: ${line.menuItemId}`, 400);
      return;
    }
    if (!menuItem.isAvailable) {
      sendError(res, `${menuItem.name} is unavailable`, 400);
      return;
    }
    const lineTotal = menuItem.price * line.quantity;
    subtotal += lineTotal;
    orderItems.push({
      menuItemId: String(menuItem._id),
      name: menuItem.name,
      price: menuItem.price,
      quantity: line.quantity,
    });
  }

  if (subtotal < restaurant.minimumOrder) {
    sendError(
      res,
      `Minimum order is $${restaurant.minimumOrder.toFixed(2)}`,
      400,
      [{ field: 'subtotal', message: `Minimum order is $${restaurant.minimumOrder}` }]
    );
    return;
  }

  const deliveryFee = restaurant.deliveryFee;
  const total = subtotal + deliveryFee;

  const order = await Order.create({
    userId: req.user!.id,
    restaurantId,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'card' ? 'paid' : 'pending',
    status: 'pending',
  });

  const enriched = await enrichOrder(order);
  sendSuccess(res, enriched, 'Order placed successfully', 201);
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
  const limit = Math.min(50, parseInt(String(req.query.limit ?? '10'), 10));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('restaurantId', 'name imageUrl deliveryTime'),
    Order.countDocuments({ userId: req.user!.id }),
  ]);

  const data = orders.map((o) => {
    const json = toJSON(o) as Record<string, unknown>;
    const r = o.restaurantId as unknown as { _id?: { toString: () => string }; name?: string; imageUrl?: string; deliveryTime?: number };
    if (r && typeof r === 'object' && r.name) {
      json.restaurant = {
        id: r._id ? String(r._id) : json.restaurantId,
        name: r.name,
        imageUrl: r.imageUrl,
        deliveryTime: r.deliveryTime,
      };
      json.restaurantId = json.restaurant && typeof json.restaurant === 'object' && 'id' in (json.restaurant as object)
        ? (json.restaurant as { id: string }).id
        : json.restaurantId;
    }
    return json;
  });

  sendSuccess(res, data, undefined, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export async function getOrder(req: AuthRequest, res: Response): Promise<void> {
  const order = await Order.findById(req.params.id).populate('restaurantId', 'name imageUrl deliveryTime');
  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }

  if (req.user!.role !== 'admin' && String(order.userId) !== req.user!.id) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  const json = toJSON(order) as Record<string, unknown>;
  const r = order.restaurantId as unknown as { _id?: { toString: () => string }; name?: string; imageUrl?: string; deliveryTime?: number };
  if (r && typeof r === 'object' && r.name) {
    json.restaurant = {
      id: r._id ? String(r._id) : json.restaurantId,
      name: r.name,
      imageUrl: r.imageUrl,
      deliveryTime: r.deliveryTime,
    };
  }

  sendSuccess(res, json);
}

export async function updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  const { status } = req.body as { status: OrderStatus };
  const order = await Order.findById(req.params.id);

  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }

  if (order.status === 'delivered' || order.status === 'cancelled') {
    sendError(res, 'Cannot update a completed or cancelled order', 400);
    return;
  }

  appendStatusHistory(order, status, req.user!.id, `Status updated by admin`);
  await order.save();

  emitOrderStatusUpdate(String(order._id), status, String(order.userId));

  const json = await enrichOrder(order);
  sendSuccess(res, json, 'Order status updated');
}

export async function cancelOrder(req: AuthRequest, res: Response): Promise<void> {
  const order = await Order.findById(req.params.id);

  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }

  const isOwner = String(order.userId) === req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAdmin) {
    sendError(res, 'Forbidden', 403);
    return;
  }

  if (order.status !== 'pending') {
    sendError(res, 'Only pending orders can be cancelled', 400, [
      { field: 'status', message: 'Order has already been confirmed or processed' },
    ]);
    return;
  }

  appendStatusHistory(
    order,
    'cancelled',
    req.user!.id,
    isAdmin ? 'Cancelled by admin' : 'Cancelled by customer'
  );
  await order.save();

  emitOrderStatusUpdate(String(order._id), 'cancelled', String(order.userId));

  const json = await enrichOrder(order);
  sendSuccess(res, json, 'Order cancelled successfully');
}

export async function listAllOrders(req: AuthRequest, res: Response): Promise<void> {
  const { status, restaurantId, from, to, page = '1', limit = '20' } = req.query;
  const filter: FilterQuery<IOrderDocument> = {};

  if (status && typeof status === 'string') filter.status = status as OrderStatus;
  if (restaurantId && typeof restaurantId === 'string') filter.restaurantId = restaurantId;
  if (from || to) {
    filter.createdAt = {};
    if (from) (filter.createdAt as Record<string, Date>).$gte = new Date(String(from));
    if (to) (filter.createdAt as Record<string, Date>).$lte = new Date(String(to));
  }

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.min(100, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('restaurantId', 'name')
      .populate('userId', 'name email phone'),
    Order.countDocuments(filter),
  ]);

  const data = orders.map((o) => {
    const json = toJSON(o) as Record<string, unknown>;
    const r = o.restaurantId as unknown as { name?: string };
    const u = o.userId as unknown as { name?: string; email?: string };
    if (r && typeof r === 'object' && r.name) json.restaurantName = r.name;
    if (u && typeof u === 'object' && u.name) {
      json.user = { name: u.name, email: (u as { email?: string }).email };
    }
    return json;
  });

  sendSuccess(res, data, undefined, 200, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum),
  });
}

export async function getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [todayOrders, todayRevenue, pendingOrders, totalUsers] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing'] } }),
    (await import('../models/User')).User.countDocuments(),
  ]);

  sendSuccess(res, {
    ordersToday: todayOrders,
    revenueToday: todayRevenue[0]?.total ?? 0,
    pendingOrders,
    totalUsers,
  });
}
