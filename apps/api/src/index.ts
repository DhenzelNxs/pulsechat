import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

async function main(): Promise<void> {
  await connectDB();

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`API listening on port ${env.PORT}`);
  });
}

main().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to start the API');
  process.exit(1);
});
