import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { authApi } from '../../api';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { CartDropdown } from './CartDropdown';
import { ProfileMenu } from './ProfileMenu';
import { useCartStore, selectTotalItems } from '../../store/cartStore';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore(selectTotalItems);
  const { isDark, toggle } = useThemeStore();

  const handleThemeToggle = () => {
    const nowDark = toggle();
    if (isAuthenticated) {
      authApi.updateProfile({ themePreference: nowDark ? 'dark' : 'light' }).catch(() => {});
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg min-h-touch inline-flex items-center ${
      isActive ? 'text-brand-600 font-medium' : 'text-gray-600 dark:text-gray-300 hover:text-brand-600'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-bold text-brand-600">
          <span aria-hidden="true">🍕</span>
          <span className="hidden sm:inline">FoodDash</span>
        </Link>

        <GlobalSearch />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/restaurants" className={navLinkClass}>
            Restaurants
          </NavLink>
          {isAuthenticated && user?.role === 'customer' && (
            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={handleThemeToggle}
            className="min-h-touch min-w-touch rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <NotificationBell />
          <CartDropdown />
          <ProfileMenu />

          <button
            type="button"
            className="min-h-touch min-w-touch rounded-lg p-2 lg:hidden"
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
          className="border-t border-gray-200 px-4 py-3 lg:hidden dark:border-gray-800"
          aria-label="Mobile navigation"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const q = fd.get('q');
              window.location.href = `/restaurants?search=${encodeURIComponent(String(q ?? ''))}`;
            }}
            className="mb-3"
          >
            <input name="q" type="search" placeholder="Search..." className="input-field w-full text-sm" />
          </form>
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
                {user?.role === 'customer' && (
                  <NavLink to="/orders" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    My Orders
                  </NavLink>
                )}
                <NavLink to="/profile" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                  Profile ({user?.email})
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
