# FoodDash — Online Food Ordering System

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node](https://img.shields.io/badge/Node-18+-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-real--time-purple)

## About the Project

**FoodDash** is a full-stack, production-quality online food ordering platform built as a monorepo. It simulates a real-world delivery app like Uber Eats or DoorDash: customers discover restaurants, build a cart, place orders with delivery details, and track status live from **Pending → Confirmed → Preparing → Out for Delivery → Delivered**. Restaurant operators use an **Admin Dashboard** to manage venues, menus, pricing, availability, and order workflow—with changes pushed instantly to customers via **Socket.io**.

The app includes JWT authentication (access + refresh tokens), role-based access (customer vs admin), form validation on both client (Zod) and server (express-validator), image upload support (Cloudinary), rate-limited auth endpoints, dark mode, responsive mobile-first UI, skeleton loaders, empty states, and error boundaries. Seed data loads **5 restaurants**, **35+ menu items**, **3 users**, and **4 sample orders** so you can demo the full flow immediately after setup.

> **LinkedIn post ready?** See [LINKEDIN.md](./LINKEDIN.md) for a copy-paste caption and hashtags.

---

## How to Access the Admin Panel

| Step | Action |
|------|--------|
| 1 | Start the app: `npm run dev` |
| 2 | Seed data (first time): `npm run seed` |
| 3 | Open **http://localhost:5173/login** |
| 4 | Log in with **admin@food.com** / **Admin@1234** |
| 5 | Click **Admin** in the top navigation, or go directly to **http://localhost:5173/admin** |

Only users with `role: "admin"` can access `/admin/*` routes. Customer accounts are redirected to the home page if they try to open the admin area.

---

## Demo Login Credentials

| Role | Email | Password | Use for |
|------|-------|----------|---------|
| **Admin** | `admin@food.com` | `Admin@1234` | Admin dashboard, menu & order management |
| **Customer** | `user@food.com` | `User@1234` | Browse, cart, place orders, track delivery |
| **Customer** | `sarah@food.com` | `User@1234` | Second demo customer account |

---

## System Functionalities

### Customer (Public & Authenticated)

| Feature | Description |
|---------|-------------|
| **Home** | Hero search, cuisine filter chips, featured restaurant grid |
| **Browse restaurants** | Search, filter by cuisine/rating/open now, sort, pagination |
| **Restaurant detail** | Menu by category, sticky nav, add to cart, quantity controls |
| **Cart** | Single-restaurant cart, localStorage persistence, switch-restaurant modal |
| **Checkout** | Delivery address form, cash/card payment (card is UI demo only) |
| **Order confirmation** | Animated success screen + **real-time status tracker** (Socket.io) |
| **My orders** | Order history, detail drawer, live status updates |
| **Profile** | Edit name, phone, address; change password |
| **Auth** | Register, login, auto token refresh, persistent session |

### Admin Dashboard (`/admin`)

| Section | URL | Capabilities |
|---------|-----|--------------|
| **Overview** | `/admin` | Today's orders, revenue, pending count, total users; recent orders table |
| **Orders** | `/admin/orders` | Filter by status, view details, **update order status** (emits Socket.io to customer) |
| **Menu** | `/admin/menu` | CRUD menu items, image upload, toggle availability & popular flag |
| **Restaurants** | `/admin/restaurants` | CRUD restaurants, cuisine, delivery settings, image upload |

### Backend API

- REST API with consistent JSON: `{ success, data, message, errors, meta }`
- JWT access token (memory) + refresh token (httpOnly cookie)
- Protected admin routes, bcrypt password hashing, Helmet, CORS, rate limiting
- Postman collection: `postman/FoodDash-API.postman_collection.json`

---

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, Zustand, React Hook Form, Zod, Axios, React Hot Toast, Framer Motion, Socket.io Client |
| **Backend** | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Bcrypt, Express Validator, Multer, Cloudinary, Socket.io, Helmet, CORS, Rate Limiting |
| **Shared** | TypeScript types package (`/shared`) |
| **Tooling** | ESLint, Prettier, Concurrently, npm workspaces |

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB** running locally (`mongodb://localhost:27017`) or MongoDB Atlas

### 1. Install dependencies

```bash
git clone https://github.com/minahil-ch/Online-Food-Ordering-system.git
cd Online-Food-Ordering-system
npm install
```

### 2. Configure environment

Copy examples and adjust if needed:

```bash
# server/.env — already created from .env.example pattern
# client/.env — VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Load dummy / seed data

```bash
npm run seed
```

This clears and repopulates the database with restaurants, menus, users, and sample orders.

### 4. Run the application

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:5000 |
| **Health check** | http://localhost:5000/api/health |

---

## End-to-End Demo Flow

1. **Customer flow:** Log in as `user@food.com` → Browse restaurants → Open **Bella Italia** → Add items to cart → Checkout → Place order → Watch live status on confirmation page.
2. **Admin flow:** Log in as `admin@food.com` → Go to **Admin → Orders** → Open a pending order → Change status to **Confirmed** → **Preparing** → Customer sees update in real time.
3. **Menu management:** Admin → **Menu** → Add/edit items, toggle availability.

---

## Project Structure

```
/client          → React frontend (pages, components, stores, API)
/server          → Express API (routes, controllers, models, services)
/shared          → Shared TypeScript types
/postman         → Postman API collection
LINKEDIN.md      → LinkedIn post caption & hashtags
```

---

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server (development) |
| `npm run build` | Production build (all packages) |
| `npm start` | Start production API server |
| `npm run seed` | Reset DB and load dummy data |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript strict check |

---

## Environment Variables

**Server** (`server/.env`):

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token secrets |
| `CLIENT_URL` | Frontend URL for CORS (http://localhost:5173) |
| `CLOUDINARY_*` | Optional — uses placeholders if empty |

**Client** (`client/.env`):

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | http://localhost:5000/api |
| `VITE_SOCKET_URL` | http://localhost:5000 |

---

## License

MIT — free to use for learning and portfolio purposes.
