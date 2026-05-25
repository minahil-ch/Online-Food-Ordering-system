import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { OrderStatus } from '@food-ordering/shared';

import { SOCKET_URL } from '../config/api';

export function useOrderSocket(
  orderId: string | undefined,
  onStatusUpdate: (status: OrderStatus) => void
): void {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!orderId || !SOCKET_URL) return;

    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.emit('order:subscribe', orderId);

    socket.on('order:status_updated', (payload: { orderId: string; status: OrderStatus }) => {
      if (payload.orderId === orderId) {
        onStatusUpdate(payload.status);
      }
    });

    return () => {
      socket.emit('order:unsubscribe', orderId);
      socket.disconnect();
    };
  }, [orderId, onStatusUpdate]);
}
