import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongodbUri: requireEnv('MONGODB_URI', 'mongodb://localhost:27017/food-ordering'),
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
  autoSeed: process.env.AUTO_SEED === 'true',
};

/** CORS: allow local dev + any Vercel preview/production URL */
export function getCorsOrigin():
  | string
  | string[]
  | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  const staticOrigins = [env.clientUrl, 'http://localhost:5173'];
  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (staticOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  };
}
