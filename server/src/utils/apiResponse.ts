import { Response } from 'express';
import type { ApiResponse } from '@food-ordering/shared';

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response {
  const body: ApiResponse<T> = { success: true, data, message, meta };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: { field: string; message: string }[]
): Response {
  const body: ApiResponse = { success: false, message, errors };
  return res.status(statusCode).json(body);
}
