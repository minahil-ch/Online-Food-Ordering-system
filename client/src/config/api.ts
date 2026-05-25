/** API base: use /api on Vercel (proxied to Render) or explicit env */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

/** Socket must hit the real backend host (not Vercel static) */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  (import.meta.env.PROD
    ? 'https://online-food-ordering-api.onrender.com'
    : 'http://localhost:5000');
