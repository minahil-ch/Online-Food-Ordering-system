import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';

const navItems = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/menu', label: 'Menu' },
  { to: '/admin/restaurants', label: 'Restaurants' },
  { to: '/admin/users', label: 'Users' },
];

function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-4 py-3 min-h-touch ${
      isActive
        ? 'bg-brand-600 text-white'
        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <button
        type="button"
        className="fixed bottom-4 right-4 z-40 rounded-full bg-brand-600 p-4 text-white shadow-lg lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle admin sidebar"
      >
        ☰
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform border-r border-gray-200 bg-white pt-16 transition dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="space-y-1 p-4" aria-label="Admin navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <Outlet />
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
