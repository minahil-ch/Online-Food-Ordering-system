/** API base: use /api on same Vercel deployment, or explicit env, else local. */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

/** Socket only when a real Node server is running (not Vercel serverless). */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:5000');
