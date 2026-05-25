/** Production API on Render (update if your Render service URL differs). */
export const PRODUCTION_API_HOST = 'https://online-food-ordering-api.onrender.com';

/** API base: explicit env, else direct Render URL in prod (CORS-safe), else local. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? `${PRODUCTION_API_HOST}/api` : 'http://localhost:5000/api');

/** Socket must hit the real backend host (not Vercel static). */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  (import.meta.env.PROD ? PRODUCTION_API_HOST : 'http://localhost:5000');
