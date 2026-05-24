import { create } from 'zustand';
import type { IUser } from '@food-ordering/shared';
import { api } from '../api/axios';
import { authApi } from '../api';
import { useThemeStore } from './themeStore';

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: IUser | null) => void;
  login: (accessToken: string, user: IUser) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  isAuthenticated: false,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: (accessToken, user) => {
    useThemeStore.getState().applyUserPreference(user.themePreference);
    set({ accessToken, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    authApi.logout().catch(() => {});
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      let token = get().accessToken;
      if (!token) {
        try {
          const { data: refreshData } = await api.post('/auth/refresh');
          token = refreshData.data?.accessToken ?? null;
          if (token) set({ accessToken: token });
        } catch {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }
      }

      const { data } = await authApi.me();
      if (data.success && data.data) {
        useThemeStore.getState().applyUserPreference(data.data.themePreference);
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
