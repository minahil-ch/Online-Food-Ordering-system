# Production deployment (Vercel + Render + MongoDB Atlas)

Your live site needs **two** services: frontend (Vercel) and API (Render).  

**Current production issue (May 2026):** `https://online-food-ordering-api.onrender.com` returns **404 / no-server** — the API was never deployed on Render. Until Render is live, Vercel will show no restaurants and login will fail (405 or network error).

Run `powershell -File scripts/check-deployment.ps1` after each deploy to verify both services.

The **405 login error** also happens when Vercel only serves the SPA (no `/api` proxy to Render). This repo fixes that via `client/vercel.json` rewrites and direct `VITE_API_BASE_URL` to Render.

## Step 1 — MongoDB Atlas (free)

1. Create a cluster at https://www.mongodb.com/cloud/atlas  
2. Database Access → user + password  
3. Network Access → **Allow access from anywhere** (0.0.0.0/0) for Render  
4. Copy connection string → `MONGODB_URI`

## Step 2 — Deploy API on Render

1. Go to https://dashboard.render.com → **New** → **Blueprint**  
2. Connect repo `minahil-ch/Online-Food-Ordering-system`  
3. Render reads `render.yaml` and creates **online-food-ordering-api**  
4. Set **MONGODB_URI** when prompted (required)  
5. Update **CLIENT_URL** to your Vercel URL, e.g.  
   `https://online-food-ordering-system-client.vercel.app`  
6. Wait for deploy → note URL: `https://online-food-ordering-api.onrender.com`  
7. Test: open `https://online-food-ordering-api.onrender.com/api/health`

First boot runs **auto-seed** (5 restaurants, admin + customer users).

### Demo logins (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@food.com | Admin@1234 |
| Customer | user@food.com | User@1234 |

## Step 3 — Configure Vercel

Project → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|--------|
| `BACKEND_URL` | `https://online-food-ordering-api.onrender.com` |
| `VITE_API_BASE_URL` | `/api` |
| `VITE_SOCKET_URL` | `https://online-food-ordering-api.onrender.com` |

**Root Directory:** `.` (repo root, not `client`)

Redeploy Vercel after saving env vars.

Build runs `generate-vercel-config.cjs` which proxies `/api/*` → your Render API (fixes 405).

## Step 4 — Verify

1. Home page shows **Featured restaurants**  
2. Login `admin@food.com` / `Admin@1234` → **Admin** in nav  
3. Login `user@food.com` / `User@1234` → browse & order  

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 405 on login | Set `BACKEND_URL` + redeploy Vercel; ensure Render API is live |
| No restaurants | Check Render logs; confirm `MONGODB_URI`; hit `/api/restaurants` |
| CORS error | Set `CLIENT_URL` on Render to exact Vercel URL |
| Render sleeps (free) | First request after idle takes ~30s — wait and refresh |
