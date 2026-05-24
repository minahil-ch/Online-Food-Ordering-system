import { Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { formatUser } from '../utils/serialize';
import { env } from '../config/env';

const SALT_ROUNDS = 12;

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, refreshCookieOptions);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('refreshToken', { path: '/api/auth' });
}

export async function register(req: AuthRequest, res: Response): Promise<void> {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    sendError(res, 'Email already registered', 409, [
      { field: 'email', message: 'Email already in use' },
    ]);
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role: role === 'admin' ? 'customer' : 'customer',
  });

  const payload = { userId: String(user._id), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  setRefreshCookie(res, refreshToken);
  sendSuccess(res, { accessToken, user: formatUser(user) }, 'Registration successful', 201);
}

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
  if (!user) {
    sendError(res, 'Invalid credentials', 401);
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    sendError(res, 'Invalid credentials', 401);
    return;
  }

  if (user.isSuspended) {
    sendError(res, 'Your account has been suspended. Contact support.', 403);
    return;
  }

  const payload = { userId: String(user._id), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = refreshToken;
  await user.save();

  const userDoc = await User.findById(user._id);
  setRefreshCookie(res, refreshToken);
  sendSuccess(res, {
    accessToken,
    user: formatUser(userDoc!),
  });
}

export async function refresh(req: AuthRequest, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) {
    sendError(res, 'Refresh token required', 401);
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      sendError(res, 'Invalid refresh token', 401);
      return;
    }

    const newPayload = { userId: String(user._id), role: user.role };
    const accessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    setRefreshCookie(res, newRefreshToken);
    sendSuccess(res, { accessToken });
  } catch {
    sendError(res, 'Invalid refresh token', 401);
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken as string | undefined;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.userId, { refreshToken: null });
    } catch {
      // ignore
    }
  }
  clearRefreshCookie(res);
  sendSuccess(res, undefined, 'Logged out successfully');
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id);
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, formatUser(user));
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  const { name, phone, address, themePreference } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(address && { address }),
      ...(themePreference && { themePreference }),
    },
    { new: true, runValidators: true }
  );
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }
  sendSuccess(res, formatUser(user), 'Profile updated');
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!.id).select('+passwordHash');
  if (!user) {
    sendError(res, 'User not found', 404);
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    sendError(res, 'Current password is incorrect', 400);
    return;
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  sendSuccess(res, undefined, 'Password changed successfully');
}
