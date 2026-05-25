import http from 'http';
import { connectDatabase } from './db/connect';
import { autoSeedIfEmpty } from './utils/autoSeed';
import { initSocket } from './services/socket';
import { env } from './config/env';
import { createApp } from './app';

const app = createApp();
const server = http.createServer(app);

initSocket(server);

async function start(): Promise<void> {
  try {
    await connectDatabase();
    await autoSeedIfEmpty();

    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app, server };
