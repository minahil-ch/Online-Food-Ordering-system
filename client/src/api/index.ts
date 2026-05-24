import { api } from './axios';
import type {
  ApiResponse,
  IUser,
  IRestaurant,
  IMenuItem,
  IOrder,
  AuthTokens,
} from '@food-ordering/shared';

export const authApi = {
  register: (data: Record<string, string>) =>
    api.post<ApiResponse<AuthTokens>>('/auth/register', data, { skipErrorToast: true }),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login', data, { skipErrorToast: true }),
  logout: () => api.post<ApiResponse>('/auth/logout'),
  me: () => api.get<ApiResponse<IUser>>('/auth/me'),
  updateProfile: (data: Partial<IUser>) =>
    api.put<ApiResponse<IUser>>('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/auth/password', data),
};

export const restaurantApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<ApiResponse<IRestaurant[]>>('/restaurants', { params }),
  get: (id: string) =>
    api.get<
      ApiResponse<{
        restaurant: IRestaurant;
        menu: Record<string, IMenuItem[]>;
        menuItems: IMenuItem[];
      }>
    >(`/restaurants/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<IRestaurant>>('/restaurants', data),
  update: (id: string, data: FormData) =>
    api.put<ApiResponse<IRestaurant>>(`/restaurants/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/restaurants/${id}`),
};

export const menuApi = {
  listAll: () => api.get<ApiResponse<IMenuItem[]>>('/menu-items'),
  create: (data: FormData) => api.post<ApiResponse<IMenuItem>>('/menu-items', data),
  update: (id: string, data: FormData) =>
    api.put<ApiResponse<IMenuItem>>(`/menu-items/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse>(`/menu-items/${id}`),
  toggle: (id: string) => api.patch<ApiResponse<IMenuItem>>(`/menu-items/${id}/toggle`),
  togglePopular: (id: string) => api.patch<ApiResponse<IMenuItem>>(`/menu-items/${id}/popular`),
};

export const orderApi = {
  create: (data: unknown) => api.post<ApiResponse<IOrder>>('/orders', data),
  myOrders: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<IOrder[]>>('/orders/my-orders', { params }),
  get: (id: string) => api.get<ApiResponse<IOrder>>(`/orders/${id}`),
  listAll: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<IOrder[]>>('/orders', { params }),
  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<IOrder>>(`/orders/${id}/status`, { status }),
  cancel: (id: string) => api.patch<ApiResponse<IOrder>>(`/orders/${id}/cancel`),
  dashboardStats: () =>
    api.get<
      ApiResponse<{
        ordersToday: number;
        revenueToday: number;
        pendingOrders: number;
        totalUsers: number;
      }>
    >('/orders/dashboard/stats'),
};

export const userApi = {
  list: () => api.get<ApiResponse<IUser[]>>('/users'),
  get: (id: string) => api.get<ApiResponse<IUser>>(`/users/${id}`),
  updateStatus: (id: string, isSuspended: boolean) =>
    api.patch<ApiResponse<IUser>>(`/users/${id}/status`, { isSuspended }),
};
