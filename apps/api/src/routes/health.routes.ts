import { Router } from 'express';
import mongoose from 'mongoose';

const CONNECTION_STATES: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const mongoState = CONNECTION_STATES[mongoose.connection.readyState] ?? 'unknown';

  res.status(200).json({
    status: 'ok',
    mongo: mongoState,
    uptimeSeconds: Math.round(process.uptime()),
  });
});
