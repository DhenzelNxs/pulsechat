import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/AppError';

export interface ValidatedQueryRequest<T> extends Request {
  validatedQuery?: T;
}

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

export function validateQuery(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ');
      next(new AppError(400, 'VALIDATION_ERROR', message));
      return;
    }

    (req as ValidatedQueryRequest<unknown>).validatedQuery = result.data;
    next();
  };
}
