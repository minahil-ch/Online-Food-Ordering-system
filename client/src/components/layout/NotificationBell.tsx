import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();
  const items = useNotificationStore((s) => s.items);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unread = items.filter((i) => !i.read).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative min-h-touch min-w-touch rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <span className="font-semibold">Notifications</span>
            {unread > 0 && (
              <button type="button" className="text-xs text-brand-600" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">No notifications yet</li>
            ) : (
              items.slice(0, 15).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      !n.read ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''
                    }`}
                    onClick={() => {
                      markRead(n.id);
                      if (n.orderId) setOpen(false);
                    }}
                  >
                    {n.orderId ? (
                      <Link
                        to={`/order-confirmation/${n.orderId}`}
                        className="block"
                        onClick={() => setOpen(false)}
                      >
                        <p className="font-medium">{n.title}</p>
                        <p className="text-gray-600 dark:text-gray-400">{n.message}</p>
                      </Link>
                    ) : (
                      <>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-gray-600 dark:text-gray-400">{n.message}</p>
                      </>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
