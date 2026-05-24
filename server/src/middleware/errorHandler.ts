import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
}

export function errorHandler(
  err: Error & { statusCode?: number; errors?: { field: string; message: string }[] },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    env.isProduction && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  if (env.nodeEnv !== 'production') {
    console.error(err);
  }

  sendError(res, message, statusCode, err.errors);
}
