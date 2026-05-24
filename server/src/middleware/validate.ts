import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/apiResponse';

/** Run validation chains and return structured errors */
export function validate(chains: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(chains.map((chain) => chain.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formatted = errors.array().map((e) => ({
        field: 'path' in e ? String(e.path) : 'field',
        message: e.msg as string,
      }));
      sendError(res, 'Validation failed', 422, formatted);
      return;
    }
    next();
  };
}
