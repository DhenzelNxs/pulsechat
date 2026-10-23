import type { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const log = req.log ?? logger;

  if (err instanceof AppError) {
    log.warn({ err, code: err.code }, 'Handled request error');
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  log.error({ err }, 'Unhandled request error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
