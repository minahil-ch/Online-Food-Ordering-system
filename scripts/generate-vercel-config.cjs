/**
 * Writes vercel.json with API proxy to the backend (fixes 405 on login).
 * Set BACKEND_URL in Vercel env before build, e.g. https://your-api.onrender.com
 */
const fs = require('fs');
const path = require('path');

const backend = (
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  'https://online-food-ordering-api.onrender.com'
).replace(/\/$/, '');

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  installCommand: 'npm install',
  buildCommand:
    'node scripts/generate-vercel-config.cjs && npm run build -w @food-ordering/shared && npm run build -w @food-ordering/client',
  outputDirectory: 'client/dist',
  framework: null,
  rewrites: [
    {
      source: '/api/:path*',
      destination: `${backend}/api/:path*`,
    },
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
};

fs.writeFileSync(path.join(__dirname, '..', 'vercel.json'), JSON.stringify(config, null, 2) + '\n');
console.log(`vercel.json written with API proxy → ${backend}`);
