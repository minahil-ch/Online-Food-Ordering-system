import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { formatStatus } from '../utils/format';
import type { OrderStatus } from '@food-ordering/shared';
import toast from 'react-hot-toast';

import { SOCKET_URL } from '../config/api';

/** Listen for order status updates for the logged-in customer */
export function useGlobalNotifications(): void {
  const { isAuthenticated, user } = useAuthStore();
  const add = useNotificationStore((s) => s.add);

  useEffect(() => {
    if (!isAuthenticated || user?.role === 'admin') return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.emit('user:subscribe', user!.id);

    socket.on('order:status_updated', (payload: { orderId: string; status: OrderStatus }) => {
      const label = formatStatus(payload.status);
      add({
        title: 'Order update',
        message: `Order #${payload.orderId.slice(-6)} is now ${label}`,
        orderId: payload.orderId,
      });
      toast(`Order ${label}`, { icon: '📦' });
    });

    return () => {
      socket.emit('user:unsubscribe', user!.id);
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id, user?.role, add]);
}
