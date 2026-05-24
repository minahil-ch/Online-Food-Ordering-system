import { body, param } from 'express-validator';

export const restaurantIdParam = [
  param('id').isMongoId().withMessage('Invalid restaurant ID'),
];

/** Validators tolerant of multipart/form-data string values */
const multipartOptionalBool = body('isOpen')
  .optional()
  .custom((v) => v === undefined || v === true || v === false || v === 'true' || v === 'false');

const multipartOptionalInt = (field: string, min = 0) =>
  body(field)
    .optional()
    .custom((v) => v === undefined || !Number.isNaN(Number(v)));

export const createRestaurantValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('cuisine').optional(),
  body('cuisine[]').optional(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  multipartOptionalBool,
  multipartOptionalInt('deliveryTime', 1),
  multipartOptionalInt('minimumOrder', 0),
  multipartOptionalInt('deliveryFee', 0),
  body('imageUrl').optional().isURL().withMessage('Image URL must be valid'),
  body('openingHours.open').optional().isString(),
  body('openingHours.close').optional().isString(),
  body('openingHours.days').optional().isString(),
];

export const updateRestaurantValidator = [
  ...restaurantIdParam,
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('cuisine').optional(),
  body('cuisine[]').optional(),
  body('rating').optional().isFloat({ min: 0, max: 5 }),
  multipartOptionalBool,
  multipartOptionalInt('deliveryTime', 1),
  multipartOptionalInt('minimumOrder', 0),
  multipartOptionalInt('deliveryFee', 0),
  body('imageUrl').optional().isURL(),
  body('openingHours.open').optional().isString(),
  body('openingHours.close').optional().isString(),
  body('openingHours.days').optional().isString(),
];
