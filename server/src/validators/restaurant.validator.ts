import { body, param } from 'express-validator';

export const restaurantIdParam = [
  param('id').isMongoId().withMessage('Invalid restaurant ID'),
];

export const createRestaurantValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('cuisine').optional().isArray(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('isOpen').optional().isBoolean(),
  body('deliveryTime').optional().isInt({ min: 1 }),
  body('minimumOrder').optional().isFloat({ min: 0 }),
  body('deliveryFee').optional().isFloat({ min: 0 }),
];

export const updateRestaurantValidator = [
  ...restaurantIdParam,
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('cuisine').optional().isArray(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  body('isOpen').optional().isBoolean(),
  body('deliveryTime').optional().isInt({ min: 1 }),
  body('minimumOrder').optional().isFloat({ min: 0 }),
  body('deliveryFee').optional().isFloat({ min: 0 }),
];
