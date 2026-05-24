import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore, selectTotalItems } from '../../store/cartStore';
import { useThemeStore } from '../../store/themeStore';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore(selectTotalItems);
  const { isDark, toggle } = useThemeStore();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg min-h-touch inline-flex items-center ${
      isActive ? 'text-brand-600 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-600'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <span aria-hidden="true">🍕</span>
          FoodDash
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/restaurants" className={navLinkClass}>
            Restaurants
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                My Orders
              </NavLink>
              {user?.role === 'admin' && (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            className="min-h-touch min-w-touch rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <Link
            to="/cart"
            className="relative min-h-touch min-w-touch rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={`Cart, ${totalItems} items`}
          >
            🛒
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-bold text-white"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/profile" className="btn-secondary text-sm">
                {user?.name?.split(' ')[0]}
              </Link>
              <button type="button" onClick={logout} className="btn-secondary text-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden gap-2 sm:flex">
              <Link to="/login" className="btn-secondary text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            className="min-h-touch min-w-touch rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-800"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={navLinkClass} onClick={() => setMobileOpen(false)} end>
              Home
            </NavLink>
            <NavLink to="/restaurants" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Restaurants
            </NavLink>
            <NavLink to="/cart" className={navLinkClass} onClick={() => setMobileOpen(false)}>
              Cart ({totalItems})
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  My Orders
                </NavLink>
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Profile
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Admin
                  </NavLink>
                )}
                <button type="button" onClick={logout} className="btn-secondary mt-2 w-full">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary mt-2 text-center" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary mt-2 text-center" onClick={() => setMobileOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
