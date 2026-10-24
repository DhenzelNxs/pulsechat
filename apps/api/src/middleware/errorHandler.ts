import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../errors/AppError';
import { logger } from '../config/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const log = req.log ?? logger;

  if (err instanceof AppError) {
    log.warn({ err, code: err.code }, 'Handled request error');
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    log.warn({ err }, 'Invalid identifier in request');
    res.status(400).json({ error: { code: 'INVALID_ID', message: `Invalid ${err.path}` } });
    return;
  }

  log.error({ err }, 'Unhandled request error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
