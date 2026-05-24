import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  restaurantIdParam,
  createRestaurantValidator,
  updateRestaurantValidator,
} from '../validators/restaurant.validator';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', restaurantController.listRestaurants);
router.get('/:id/menu', validate(restaurantIdParam), restaurantController.getRestaurantMenu);
router.get('/:id', validate(restaurantIdParam), restaurantController.getRestaurant);

router.post(
  '/',
  authenticate,
  requireRole('admin'),
  upload.single('image'),
  validate(createRestaurantValidator),
  restaurantController.createRestaurant
);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  upload.single('image'),
  validate(updateRestaurantValidator),
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate(restaurantIdParam),
  restaurantController.deleteRestaurant
);

export default router;
