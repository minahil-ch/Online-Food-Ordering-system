import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { IOrder, OrderStatus } from '@food-ordering/shared';
import { orderApi } from '../api';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/Spinner';
import { OrderStatusTracker } from '../components/order/OrderStatusTracker';
import { OrderStatusHistory } from '../components/order/OrderStatusHistory';
import { CancelOrderButton } from '../components/order/CancelOrderButton';
import { formatCurrency, formatDate, formatStatus } from '../utils/format';

function OrdersContent() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);

  useEffect(() => {
    orderApi
      .myOrders({ page: 1, limit: 20 })
      .then(({ data }) => {
        if (data.success && data.data) setOrders(data.data as IOrder[]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = useCallback(
    async (status: OrderStatus) => {
      if (!selectedId) return;
      const { data } = await orderApi.get(selectedId);
      if (data.success && data.data) {
        const updated = data.data as IOrder;
        setSelectedOrder(updated);
        setOrders((prev) => prev.map((o) => (o.id === selectedId ? updated : o)));
      }
      if (status !== 'cancelled') {
        toast.success(`Order updated: ${formatStatus(status)}`);
      }
    },
    [selectedId]
  );

  const handleOrderCancelled = (updated: IOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  };

  useOrderSocket(selectedId ?? undefined, handleStatusUpdate);

  const openDetail = async (id: string) => {
    setSelectedId(id);
    const { data } = await orderApi.get(id);
    if (data.success && data.data) setSelectedOrder(data.data as IOrder);
  };

  if (loading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your order history will appear here after you place your first order."
        actionLabel="Order now"
        actionTo="/restaurants"
        icon="📋"
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map((order) => (
          <button
            key={order.id}
            type="button"
            onClick={() => openDetail(order.id)}
            className="card w-full p-4 text-left transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {(order.restaurant as { name?: string })?.name ?? 'Restaurant'}
                </p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800 dark:bg-brand-900 dark:text-brand-200">
                  {formatStatus(order.status)}
                </span>
                <p className="mt-1 font-semibold">{formatCurrency(order.total)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setSelectedId(null);
              setSelectedOrder(null);
            }}
            aria-hidden="true"
          />
          <aside className="card relative z-10 h-full w-full max-w-md overflow-y-auto p-6">
            <button
              type="button"
              className="mb-4 text-sm text-gray-500"
              onClick={() => {
                setSelectedId(null);
                setSelectedOrder(null);
              }}
            >
              ← Close
            </button>
            <h2 className="text-xl font-bold">Order details</h2>
            <p className="text-sm text-gray-500">#{selectedOrder.id.slice(-8)}</p>
            <div className="mt-4">
              <OrderStatusTracker status={selectedOrder.status} />
            </div>
            <ul className="mt-4 space-y-2">
              {selectedOrder.items.map((item) => (
                <li key={item.menuItemId} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 font-semibold">Total: {formatCurrency(selectedOrder.total)}</p>
            <OrderStatusHistory history={selectedOrder.statusHistory} />
            <div className="mt-4 flex flex-col gap-2">
              <CancelOrderButton
                order={selectedOrder}
                onCancelled={handleOrderCancelled}
                className="w-full"
              />
              <Link
                to={`/order-confirmation/${selectedOrder.id}`}
                className="btn-primary block text-center"
              >
                Full tracking page
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  return (
    <ProtectedRoute roles={['customer']}>
      <OrdersContent />
    </ProtectedRoute>
  );
}
