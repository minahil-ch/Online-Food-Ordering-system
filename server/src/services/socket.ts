import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import type { OrderStatus } from '@food-ordering/shared';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('order:subscribe', (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    socket.on('order:unsubscribe', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });
  });

  return io;
}

export function emitOrderStatusUpdate(orderId: string, status: OrderStatus): void {
  io?.to(`order:${orderId}`).emit('order:status_updated', { orderId, status });
}

export function getIO(): Server | null {
  return io;
}
