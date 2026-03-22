'use client';

import { useMutation } from '@tanstack/react-query';

import { loginRequest, meRequest } from '@/features/auth/api/login';
import type { LoginSchemaValues } from '@/features/auth/schemas/login.schema';
import { useAuthStore } from '@/stores/auth.store';

export function useLogin() {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (values: LoginSchemaValues) => {
      const loginResponse = await loginRequest(values);

      setAccessToken(loginResponse.accessToken);

      const meResponse = await meRequest();

      setUser(meResponse);

      return {
        accessToken: loginResponse.accessToken,
        user: meResponse,
      };
    },
  });
}