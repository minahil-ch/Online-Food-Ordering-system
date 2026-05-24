import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { verifyAccessToken } from '../utils/tokens';
import { sendError } from '../utils/apiResponse';
import { formatUser } from '../utils/serialize';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    req.user = {
      id: String(user._id),
      role: user.role,
      email: user.email,
    };
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, 'Forbidden: insufficient permissions', 403);
      return;
    }
    next();
  };
}

export async function attachUserIfPresent(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    next();
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role, email: '' };
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}

export { formatUser };
