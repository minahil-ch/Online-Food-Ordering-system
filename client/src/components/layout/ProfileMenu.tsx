import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link to="/login" className="btn-secondary text-sm">
          Login
        </Link>
        <Link to="/register" className="btn-primary text-sm">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative hidden sm:block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-touch items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[100px] truncate font-medium">{user.name.split(' ')[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
            <p className="mt-1 text-xs capitalize text-brand-600">{user.role}</p>
          </div>
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            Profile settings
          </Link>
          <Link
            to="/orders"
            className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => setOpen(false)}
          >
            My orders
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="block px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setOpen(false)}
            >
              Admin dashboard
            </Link>
          )}
          <button
            type="button"
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-800"
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
