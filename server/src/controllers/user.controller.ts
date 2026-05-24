import { Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { formatUser } from '../utils/serialize';

export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  const users = await User.find().sort({ createdAt: -1 });
  sendSuccess(res, users.map((u) => formatUser(u)));
}

export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, formatUser(user));
}
