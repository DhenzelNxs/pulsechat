import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { errorHandler } from '../src/middleware/errorHandler';
import { AppError } from '../src/errors/AppError';

function createMockResponse() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
  };
  return res;
}

const noopNext = () => {};

describe('errorHandler middleware', () => {
  it('formats an AppError using its own status code and code', () => {
    const res = createMockResponse();

    errorHandler(
      new AppError(404, 'NOT_FOUND', 'Room not found'),
      {} as Request,
      res as unknown as Response,
      noopNext,
    );

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Room not found' } });
  });

  it('maps a mongoose CastError to a 400 INVALID_ID response', () => {
    const res = createMockResponse();
    const castError = new mongoose.Error.CastError('ObjectId', 'not-an-id', 'roomId');

    errorHandler(castError, {} as Request, res as unknown as Response, noopNext);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: { code: 'INVALID_ID', message: 'Invalid roomId' } });
  });

  it('falls back to a generic 500 for an unexpected error', () => {
    const res = createMockResponse();

    errorHandler(new Error('boom'), {} as Request, res as unknown as Response, noopNext);

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
    });
  });
});
