import { Router } from 'express';
import { param } from 'express-validator';
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

export default router;
