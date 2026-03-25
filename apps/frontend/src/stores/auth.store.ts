import { create, type StateCreator } from 'zustand';
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

type PersistedAuthState = Pick<
  AuthState,
  'accessToken' | 'user' | 'isAuthenticated'
>;

const authStoreCreator: StateCreator<AuthState> = (set) => ({
  accessToken: null,
  user: null,
  hasHydrated: false,
  isAuthenticated: false,
  setAccessToken: (accessToken: string) => {
    set({
      accessToken,
      isAuthenticated: true,
    });
  },
  setUser: (user: AuthUser) => {
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
  setHasHydrated: (value: boolean) => {
    set({ hasHydrated: value });
  },
});

export const useAuthStore = create<AuthState>()(
  persist(authStoreCreator, {
    name: 'taskflow-pro-auth',
    storage: createJSONStorage(() => localStorage),
    partialize: (state: AuthState): PersistedAuthState => ({
      accessToken: state.accessToken,
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
    onRehydrateStorage: () => (state?: AuthState) => {
      state?.setHasHydrated(true);
    },
  }),
);