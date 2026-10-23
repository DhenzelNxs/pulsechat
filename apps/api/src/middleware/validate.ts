import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/AppError';

export function validateBody(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(new AppError(400, 'VALIDATION_ERROR', message));
      return;
    }

    req.body = result.data;
    next();
  };
}
