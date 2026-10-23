import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDB(): Promise<typeof mongoose> {
  mongoose.connection.on('error', (error) => {
    logger.error({ err: error }, 'MongoDB connection error');
  });

  const connection = await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB');
  return connection;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
