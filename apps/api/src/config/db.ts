import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  if (!connectionPromise) {
    mongoose.connection.on('error', (error) => {
      logger.error({ err: error }, 'MongoDB connection error');
    });

    connectionPromise = mongoose.connect(env.MONGODB_URI).then((connection) => {
      logger.info('Connected to MongoDB');
      return connection;
    });
  }

  return connectionPromise;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  connectionPromise = null;
}
