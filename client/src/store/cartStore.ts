import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartMenuItem, IRestaurant } from '@food-ordering/shared';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  pendingItem: { menuItem: CartMenuItem; restaurant: Pick<IRestaurant, 'id' | 'name' | 'deliveryFee'> } | null;
  addItem: (
    menuItem: CartMenuItem,
    restaurant: Pick<IRestaurant, 'id' | 'name' | 'deliveryFee'>
  ) => 'added' | 'confirm_switch';
  confirmSwitch: () => void;
  cancelSwitch: () => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (menuItemId: string) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      deliveryFee: 0,
      pendingItem: null,

      addItem: (menuItem, restaurant) => {
        const state = get();
        if (state.restaurantId && state.restaurantId !== restaurant.id) {
          set({ pendingItem: { menuItem, restaurant } });
          return 'confirm_switch';
        }

        const existing = state.items.find((i) => i.menuItem.id === menuItem.id);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.menuItem.id === menuItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...state.items,
              { menuItem, quantity: 1, restaurantId: restaurant.id },
            ],
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            deliveryFee: restaurant.deliveryFee,
          });
        }
        return 'added';
      },

      confirmSwitch: () => {
        const { pendingItem } = get();
        if (!pendingItem) return;
        const { menuItem, restaurant } = pendingItem;
        set({
          items: [{ menuItem, quantity: 1, restaurantId: restaurant.id }],
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          deliveryFee: restaurant.deliveryFee,
          pendingItem: null,
        });
      },

      cancelSwitch: () => set({ pendingItem: null }),

      removeItem: (menuItemId) => {
        const items = get().items.filter((i) => i.menuItem.id !== menuItemId);
        set({
          items,
          ...(items.length === 0
            ? { restaurantId: null, restaurantName: null, deliveryFee: 0 }
            : {}),
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () =>
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
          deliveryFee: 0,
          pendingItem: null,
        }),

      getItemQuantity: (menuItemId) =>
        get().items.find((i) => i.menuItem.id === menuItemId)?.quantity ?? 0,
    }),
    { name: 'food-cart' }
  )
);

export const selectTotalItems = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);

export const selectIsEmpty = (state: CartState) => state.items.length === 0;
