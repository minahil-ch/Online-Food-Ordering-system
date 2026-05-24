import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { IOrder, OrderStatus } from '@food-ordering/shared';
import { orderApi } from '../api';
import { useOrderSocket } from '../hooks/useOrderSocket';
import { OrderStatusTracker } from '../components/order/OrderStatusTracker';
import { OrderStatusHistory } from '../components/order/OrderStatusHistory';
import { CancelOrderButton } from '../components/order/CancelOrderButton';
import { PageLoader } from '../components/ui/Spinner';
import { formatCurrency, formatStatus } from '../utils/format';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function ConfirmationContent() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const handleStatusUpdate = useCallback((status: OrderStatus) => {
    setOrder((prev) => (prev ? { ...prev, status } : prev));
    toast.success(`Order ${formatStatus(status).toLowerCase()}`, { icon: '📦' });
  }, []);

  useOrderSocket(id, handleStatusUpdate);

  useEffect(() => {
    if (!id) return;
    orderApi
      .get(id)
      .then(({ data }) => {
        if (data.success && data.data) setOrder(data.data as IOrder);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) {
    return (
      <div className="p-8 text-center">
        <p>Order not found</p>
        <Link to="/" className="btn-primary mt-4 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const deliveryTime = order.restaurant?.deliveryTime ?? 30;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl dark:bg-green-900"
      >
        ✓
      </motion.div>
      <h1 className="text-center text-3xl font-bold">Order placed!</h1>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
        Order #{order.id.slice(-8).toUpperCase()} • Est. {deliveryTime} min
      </p>

      <div className="card mt-8 p-6">
        <h2 className="mb-4 font-semibold">Live order tracker</h2>
        <OrderStatusTracker status={order.status} />
        <OrderStatusHistory history={order.statusHistory} />
        <CancelOrderButton
          order={order}
          onCancelled={setOrder}
          className="mt-4 w-full"
        />
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-semibold">Summary</h2>
        <ul className="mt-4 space-y-2">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/orders" className="btn-secondary text-center">
          Track Another Order
        </Link>
        <Link to="/" className="btn-primary text-center">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export function OrderConfirmationPage() {
  return (
    <ProtectedRoute roles={['customer']}>
      <ConfirmationContent />
    </ProtectedRoute>
  );
}
