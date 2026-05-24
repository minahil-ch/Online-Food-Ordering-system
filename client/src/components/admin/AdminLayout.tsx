import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { ProtectedRoute } from '../auth/ProtectedRoute';

const navItems = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/menu', label: 'Menu', icon: '🍽️' },
  { to: '/admin/restaurants', label: 'Restaurants', icon: '🏪' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 min-h-touch text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-md'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Admin top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="min-h-touch min-w-touch rounded-lg p-2 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <Link to="/admin" className="flex items-center gap-2 font-bold text-brand-600">
              <span>🍕</span>
              <span>FoodDash Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-secondary hidden text-sm sm:inline-flex">
              View storefront
            </Link>
            <button
              type="button"
              onClick={toggle}
              className="min-h-touch min-w-touch rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Toggle theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <span className="hidden text-sm text-gray-500 sm:inline">{user?.email}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white pt-14 transition dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="Admin navigation">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Management
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar footer — easy exit */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <p className="mb-3 px-2 text-xs text-gray-500">Signed in as {user?.name}</p>
            <Link
              to="/"
              className="mb-2 flex min-h-touch items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              🏠 Back to home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Logout & go home
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <ProtectedRoute roles={['admin']}>
      <AdminShell />
    </ProtectedRoute>
  );
}
