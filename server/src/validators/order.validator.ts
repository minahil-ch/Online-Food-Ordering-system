import { body, param, query } from 'express-validator';

export const createOrderValidator = [
  body('restaurantId').isMongoId().withMessage('Valid restaurant ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain items'),
  body('items.*.menuItemId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('deliveryAddress.zipCode')
    .matches(/^\d{5}$/)
    .withMessage('ZIP code must be 5 digits'),
  body('paymentMethod').isIn(['cash', 'card']).withMessage('Invalid payment method'),
];

export const orderIdParam = [
  param('id').isMongoId().withMessage('Invalid order ID'),
];

export const updateOrderStatusValidator = [
  ...orderIdParam,
  body('status')
    .isIn(['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
];

export const listOrdersQueryValidator = [
  query('status').optional().isString(),
  query('restaurantId').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
];
