import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string;
}

interface NotificationState {
  items: AppNotification[];
  add: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (n) =>
        set((state) => ({
          items: [
            {
              ...n,
              id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ].slice(0, 50),
        })),

      markRead: (id) =>
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, read: true } : i)),
        }),

      markAllRead: () =>
        set({
          items: get().items.map((i) => ({ ...i, read: true })),
        }),

      clear: () => set({ items: [] }),

      unreadCount: () => get().items.filter((i) => !i.read).length,
    }),
    { name: 'food-notifications' }
  )
);
