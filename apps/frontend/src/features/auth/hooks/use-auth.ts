'use client';

import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearSession = useAuthStore((state) => state.clearSession);

  return {
    accessToken,
    user,
    isAuthenticated,
    hasHydrated,
    clearSession,
  };
}