import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { IOrder } from '@food-ordering/shared';
import { orderApi } from '../../api';
import { formatCurrency, formatStatus } from '../../utils/format';
import { PageLoader } from '../../components/ui/Spinner';

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    pendingOrders: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      orderApi.dashboardStats(),
      orderApi.listAll({ limit: 10 }),
    ]).then(([statsRes, ordersRes]) => {
      if (statsRes.data.success && statsRes.data.data) setStats(statsRes.data.data);
      if (ordersRes.data.success && ordersRes.data.data)
        setRecentOrders(ordersRes.data.data as IOrder[]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Orders today', value: stats.ordersToday, icon: '📦' },
    { label: 'Revenue today', value: formatCurrency(stats.revenueToday), icon: '💰' },
    { label: 'Pending orders', value: stats.pendingOrders, icon: '⏳' },
    { label: 'Total users', value: stats.totalUsers, icon: '👥' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-4">
            <span className="text-2xl">{card.icon}</span>
            <p className="mt-2 text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/admin/orders" className="btn-primary">
          Manage orders
        </Link>
        <Link to="/admin/menu" className="btn-secondary">
          Manage menu
        </Link>
        <Link to="/admin/restaurants" className="btn-secondary">
          Manage restaurants
        </Link>
      </div>

      <div className="card mt-8 overflow-x-auto">
        <h2 className="border-b border-gray-200 p-4 font-semibold dark:border-gray-700">
          Recent orders
        </h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="p-4">#{order.id.slice(-6)}</td>
                <td className="p-4">
                  {(order.user as { name?: string })?.name ?? '—'}
                </td>
                <td className="p-4">{formatCurrency(order.total)}</td>
                <td className="p-4">
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                    {formatStatus(order.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
