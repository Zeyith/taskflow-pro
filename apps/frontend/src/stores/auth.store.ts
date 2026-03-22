import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUser } from '@/types/auth';

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  hasHydrated: boolean;
  isAuthenticated: boolean;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hasHydrated: false,
      isAuthenticated: false,
      setAccessToken: (accessToken) => {
        set({
          accessToken,
          isAuthenticated: true,
        });
      },
      setUser: (user) => {
        set({
          user,
          isAuthenticated: true,
        });
      },
      clearSession: () => {
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
      setHasHydrated: (value) => {
        set({ hasHydrated: value });
      },
    }),
    {
      name: 'taskflow-pro-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);