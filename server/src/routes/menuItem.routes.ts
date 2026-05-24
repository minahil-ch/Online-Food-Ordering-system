import { Router } from 'express';
import * as menuItemController from '../controllers/menuItem.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  menuItemIdParam,
  createMenuItemValidator,
  updateMenuItemValidator,
} from '../validators/menuItem.validator';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authenticate, requireRole('admin'), menuItemController.listAllMenuItems);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.single('image'),
  validate(createMenuItemValidator),
  menuItemController.createMenuItem
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  upload.single('image'),
  validate(updateMenuItemValidator),
  menuItemController.updateMenuItem
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(menuItemIdParam),
  menuItemController.deleteMenuItem
);

router.patch(
  '/:id/toggle',
  authenticate,
  requireRole('admin'),
  validate(menuItemIdParam),
  menuItemController.toggleAvailability
);

export default router;
