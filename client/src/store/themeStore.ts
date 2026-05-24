import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => boolean;
  setDark: (dark: boolean) => void;
  applyUserPreference: (preference?: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,

      toggle: () => {
        const next = !get().isDark;
        document.documentElement.classList.toggle('dark', next);
        set({ isDark: next });
        return next;
      },

      setDark: (dark) => {
        document.documentElement.classList.toggle('dark', dark);
        set({ isDark: dark });
      },

      applyUserPreference: (preference) => {
        if (preference === 'dark') get().setDark(true);
        else if (preference === 'light') get().setDark(false);
      },
    }),
    {
      name: 'food-theme',
      onRehydrateStorage: () => (state) => {
        if (state?.isDark) document.documentElement.classList.add('dark');
      },
    }
  )
);
