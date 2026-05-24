# FoodDash — Role Permissions Guide

This document explains what each role can **see**, **do**, and **control** in the application.

---

## Customer

The customer's world is **self-contained**: they only see their own data (cart, orders, profile) and **public** data (restaurants, menus). They cannot see other users or admin tools.

### Can view

| Area | Details |
|------|---------|
| Restaurants | All restaurants with **rating**, **opening hours**, **open/closed status**, **cuisine**, delivery time & fees |
| Menus | Full menu per restaurant: **images**, **descriptions**, **prices**, categories, popular badges |
| Cart | **Always visible** via header cart dropdown — contents, quantities, subtotal |
| Orders | **Own** order history and full order details |
| Live tracking | Order status progression: Pending → Confirmed → Preparing → Out for delivery → Delivered |

### Tasks to do

- **Register** and **log in** to place orders
- **Search** (header + home) and **filter** restaurants by name or cuisine
- **Add to cart**, adjust quantities, **clear cart**
- Enter **delivery address** at checkout
- Choose **payment method** (cash / card demo) and **place order**
- **Cancel order** while status is still **Pending**

### Has control over

- **Profile:** name, phone, saved address
- **Password** change
- **Cart:** remove items, clear cart, switch restaurant (with confirmation)
- **Theme:** dark / light mode (saved to profile when logged in)

---

## Admin

The admin's world is **system-wide**: they see all customers, restaurants, menus, and orders. Admins **do not** have a customer ordering flow (blocked server-side).

### Can view

| Area | Details |
|------|---------|
| Dashboard | Orders today, revenue today, pending orders, total users |
| Orders | **All orders** from all customers with items, address, payment info |
| Users | **All registered users** — email, phone, role, join date, suspension status |
| Menu | **Full inventory** across all restaurants |
| Status logs | **Order status history** timeline per order |

### Tasks to do

- **Create / edit / delete** restaurants (with images)
- **Add / edit / delete** menu items (image, price, category, restaurant)
- **Update order status** as orders progress (customer notified in real time)
- **Toggle** item availability and **popular** flag instantly
- **Suspend / reactivate** customer accounts

### Has control over

- Any menu item (edit, delete, availability, featured/popular)
- Any restaurant listing
- Any order's status (except completed/cancelled transitions rules apply)
- Customer account suspension (not other admins)

---

## Always visible (both roles)

These UI elements are fixed for everyone browsing the app:

| Feature | Behavior |
|---------|----------|
| **Navigation** | Logo, global search, cart, notifications (when logged in), profile menu |
| **Notifications** | Bell icon — order status updates (customers); persisted locally |
| **Profile menu** | Name, email, role badge, profile link, logout |
| **Dark mode** | Toggle in header; preference saved per user account |
| **Order tracker** | Live step indicator on order confirmation & order detail |
| **Responsive layout** | Mobile hamburger menu, touch-friendly controls (44px min) |

---

## Quick access

| Goal | Steps |
|------|-------|
| **Customer ordering** | Login `user@food.com` / `User@1234` → Restaurants → Add to cart → Checkout |
| **Admin panel** | Login `admin@food.com` / `Admin@1234` → Click **Admin** or visit `/admin` |
| **Reload demo data** | Run `npm run seed` |
