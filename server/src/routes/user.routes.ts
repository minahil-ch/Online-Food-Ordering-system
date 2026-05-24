import { Router } from 'express';
import { body, param } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/', authenticate, requireRole('admin'), userController.listUsers);
router.get(
  '/:id',
  authenticate,
  requireRole('admin'),
  validate([param('id').isMongoId()]),
  userController.getUser
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  validate([
    param('id').isMongoId(),
    body('isSuspended').isBoolean().withMessage('isSuspended is required'),
  ]),
  userController.updateUserStatus
);

export default router;
