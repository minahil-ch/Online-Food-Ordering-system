import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { IOrder, OrderStatus } from '@food-ordering/shared';
import { ORDER_STATUS_FLOW } from '@food-ordering/shared';
import { orderApi } from '../../api';
import { getApiError } from '../../api/axios';
import { formatCurrency, formatDate, formatStatus } from '../../utils/format';
import { PageLoader } from '../../components/ui/Spinner';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<IOrder | null>(null);

  const loadOrders = () => {
    setLoading(true);
    const params: Record<string, string | number> = { limit: 50 };
    if (statusFilter) params.status = statusFilter;
    orderApi
      .listAll(params)
      .then(({ data }) => {
        if (data.success && data.data) setOrders(data.data as IOrder[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      const { data } = await orderApi.updateStatus(id, status);
      if (data.success && data.data) {
        setOrders((prev) => prev.map((o) => (o.id === id ? (data.data as IOrder) : o)));
        if (selected?.id === id) setSelected(data.data as IOrder);
        toast.success('Status updated');
      }
    } catch (err) {
      toast.error(getApiError(err));
    }
  };

  if (loading && orders.length === 0) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-4 flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All statuses</option>
          {[...ORDER_STATUS_FLOW, 'cancelled' as OrderStatus].map((s) => (
            <option key={s} value={s}>
              {formatStatus(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4">ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="cursor-pointer border-b border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                onClick={() => setSelected(order)}
              >
                <td className="p-4">#{order.id.slice(-6)}</td>
                <td className="p-4">{formatDate(order.createdAt)}</td>
                <td className="p-4">{formatCurrency(order.total)}</td>
                <td className="p-4">{formatStatus(order.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <aside className="card relative z-10 h-full w-full max-w-md overflow-y-auto p-6">
            <button type="button" onClick={() => setSelected(null)} className="mb-4 text-sm">
              ← Close
            </button>
            <h2 className="text-xl font-bold">Order #{selected.id.slice(-6)}</h2>
            <ul className="mt-4 space-y-2">
              {selected.items.map((item) => (
                <li key={item.menuItemId} className="text-sm">
                  {item.quantity}x {item.name} — {formatCurrency(item.price * item.quantity)}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold">Total: {formatCurrency(selected.total)}</p>
            <label className="mt-4 block text-sm font-medium">Update status</label>
            <select
              value={selected.status}
              onChange={(e) => updateStatus(selected.id, e.target.value as OrderStatus)}
              className="input-field mt-1"
            >
              {[...ORDER_STATUS_FLOW, 'cancelled'].map((s) => (
                <option key={s} value={s}>
                  {formatStatus(s)}
                </option>
              ))}
            </select>
          </aside>
        </div>
      )}
    </div>
  );
}
