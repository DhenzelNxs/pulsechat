import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { healthRouter } from './routes/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
