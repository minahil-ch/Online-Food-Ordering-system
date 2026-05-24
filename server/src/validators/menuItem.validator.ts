import { body, param } from 'express-validator';

export const menuItemIdParam = [
  param('id').isMongoId().withMessage('Invalid menu item ID'),
];

export const createMenuItemValidator = [
  body('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('tags').optional().isArray(),
  body('isAvailable').optional().isBoolean(),
  body('isPopular').optional().isBoolean(),
];

export const updateMenuItemValidator = [
  ...menuItemIdParam,
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0.01 }),
  body('category').optional().trim().notEmpty(),
  body('tags').optional().isArray(),
  body('isAvailable').optional().isBoolean(),
  body('isPopular').optional().isBoolean(),
];
