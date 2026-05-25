import mongoose from 'mongoose';
import { env } from '../config/env';

declare global {
  // eslint-disable-next-line no-var
  var __mongooseReady: Promise<void> | undefined;
}

async function connectOnce(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(env.mongodbUri);
  console.log('Connected to MongoDB');
}

export async function connectDatabase(): Promise<void> {
  if (!global.__mongooseReady) {
    global.__mongooseReady = connectOnce();
  }
  await global.__mongooseReady;
}
