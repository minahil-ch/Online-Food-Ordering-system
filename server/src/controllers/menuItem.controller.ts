import { Response } from 'express';
import { MenuItem } from '../models/MenuItem';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { toJSON } from '../utils/serialize';
import { uploadImage } from '../services/cloudinary';
import { parseFormBody } from '../utils/parseBody';

export async function createMenuItem(req: AuthRequest, res: Response): Promise<void> {
  const body = parseFormBody(req.body as Record<string, unknown>);
  let imageUrl = (body.imageUrl as string) ?? '';
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, 'menu-items');
  } else if (!imageUrl) {
    imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
  }

  const item = await MenuItem.create({
    ...body,
    tags: (body.tags as string[]) ?? [],
    imageUrl,
  });

  sendSuccess(res, toJSON(item), 'Menu item created', 201);
}

export async function updateMenuItem(req: AuthRequest, res: Response): Promise<void> {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    sendError(res, 'Menu item not found', 404);
    return;
  }

  let imageUrl = item.imageUrl;
  if (req.file) {
    imageUrl = await uploadImage(req.file.buffer, 'menu-items');
  }

  const body = parseFormBody(req.body as Record<string, unknown>);
  if (!req.file && body.imageUrl && typeof body.imageUrl === 'string') {
    imageUrl = body.imageUrl;
  }
  Object.assign(item, body, { imageUrl });
  await item.save();

  sendSuccess(res, toJSON(item), 'Menu item updated');
}

export async function deleteMenuItem(req: AuthRequest, res: Response): Promise<void> {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) {
    sendError(res, 'Menu item not found', 404);
    return;
  }
  sendSuccess(res, undefined, 'Menu item deleted');
}

export async function togglePopular(req: AuthRequest, res: Response): Promise<void> {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    sendError(res, 'Menu item not found', 404);
    return;
  }

  item.isPopular = !item.isPopular;
  await item.save();

  sendSuccess(res, toJSON(item), 'Popular flag toggled');
}

export async function toggleAvailability(req: AuthRequest, res: Response): Promise<void> {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    sendError(res, 'Menu item not found', 404);
    return;
  }

  item.isAvailable = !item.isAvailable;
  await item.save();

  sendSuccess(res, toJSON(item), 'Availability toggled');
}

export async function listAllMenuItems(req: AuthRequest, res: Response): Promise<void> {
  const items = await MenuItem.find()
    .populate('restaurantId', 'name')
    .sort({ createdAt: -1 });

  sendSuccess(
    res,
    items.map((item) => {
      const json = toJSON(item) as Record<string, unknown>;
      const pop = item.restaurantId as unknown as { _id?: { toString: () => string }; name?: string };
      if (pop && typeof pop === 'object' && 'name' in pop) {
        json.restaurantName = pop.name;
        json.restaurantId = pop._id ? String(pop._id) : json.restaurantId;
      }
      return json;
    })
  );
}
