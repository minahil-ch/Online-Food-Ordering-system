import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import type { OrderStatus } from '@food-ordering/shared';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (origin === env.clientUrl || /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
          return cb(null, true);
        }
        cb(null, false);
      },
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

    socket.on('user:subscribe', (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on('user:unsubscribe', (userId: string) => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
}

export function emitOrderStatusUpdate(
  orderId: string,
  status: OrderStatus,
  userId?: string
): void {
  const payload = { orderId, status };
  io?.to(`order:${orderId}`).emit('order:status_updated', payload);
  if (userId) {
    io?.to(`user:${userId}`).emit('order:status_updated', payload);
  }
}

export function getIO(): Server | null {
  return io;
}
