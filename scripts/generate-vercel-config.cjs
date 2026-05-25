/**
 * Writes vercel.json with API proxy to BACKEND_URL (Cloudflare tunnel or Render).
 */
const fs = require('fs');
const path = require('path');

const backend = (
  process.env.BACKEND_URL ||
  process.env.VITE_BACKEND_URL ||
  process.env.TUNNEL_URL ||
  ''
).replace(/\/$/, '');

if (!backend) {
  console.error('Set BACKEND_URL or TUNNEL_URL to your public API (e.g. https://xxx.trycloudflare.com)');
  process.exit(1);
}

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  installCommand: 'npm install',
  buildCommand:
    'npm run build -w @food-ordering/shared && npm run build -w @food-ordering/client',
  outputDirectory: 'client/dist',
  framework: null,
  rewrites: [
    { source: '/api/:path*', destination: `${backend}/api/:path*` },
    { source: '/(.*)', destination: '/index.html' },
  ],
};

const rootDir = path.join(__dirname, '..');
const json = JSON.stringify(config, null, 2) + '\n';
fs.writeFileSync(path.join(rootDir, 'vercel.json'), json);

const clientConfig = {
  $schema: config.$schema,
  installCommand: 'cd .. && npm install',
  buildCommand:
    'cd .. && npm run build -w @food-ordering/shared && npm run build -w @food-ordering/client',
  outputDirectory: 'dist',
  framework: null,
  rewrites: config.rewrites,
};
fs.writeFileSync(path.join(rootDir, 'client', 'vercel.json'), JSON.stringify(clientConfig, null, 2) + '\n');

console.log(`vercel.json → API proxy ${backend}`);
