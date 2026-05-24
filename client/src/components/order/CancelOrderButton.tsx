import { useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api';
import { getApiError } from '../../api/axios';
import type { IOrder } from '@food-ordering/shared';

interface CancelOrderButtonProps {
  order: IOrder;
  onCancelled: (order: IOrder) => void;
  className?: string;
}

export function CancelOrderButton({ order, onCancelled, className = '' }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);

  if (order.status !== 'pending') return null;

  const handleCancel = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setLoading(true);
    try {
      const { data } = await orderApi.cancel(order.id);
      if (data.success && data.data) {
        toast.success('Order cancelled');
        onCancelled(data.data as IOrder);
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className={`btn-secondary border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 ${className}`}
    >
      {loading ? 'Cancelling...' : 'Cancel order'}
    </button>
  );
}
