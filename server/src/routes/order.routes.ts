import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createOrderValidator,
  orderIdParam,
  updateOrderStatusValidator,
  listOrdersQueryValidator,
} from '../validators/order.validator';

const router = Router();

router.get(
  '/dashboard/stats',
  authenticate,
  requireRole('admin'),
  orderController.getDashboardStats
);

router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validate(listOrdersQueryValidator),
  orderController.listAllOrders
);

router.get('/my-orders', authenticate, orderController.getMyOrders);

router.get('/:id', authenticate, validate(orderIdParam), orderController.getOrder);

router.post(
  '/',
  authenticate,
  validate(createOrderValidator),
  orderController.createOrder
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  validate(updateOrderStatusValidator),
  orderController.updateOrderStatus
);

export default router;
