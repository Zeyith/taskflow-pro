'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { loginRequest, meRequest } from '@/features/auth/api/login';
import { registerRequest } from '@/features/auth/api/register';
import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';
import { useAuthStore } from '@/stores/auth.store';

type ShieldErrorResponse = {
  message?: string;
};

export function useRegister() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerRequest(values);

      const loginResponse = await loginRequest({
        email: values.email,
        password: values.password,
      });

      setAccessToken(loginResponse.accessToken);

      const meResponse = await meRequest();

      setUser(meResponse);

      return {
        accessToken: loginResponse.accessToken,
        user: meResponse,
      };
    },
    onSuccess: () => {
      toast.success('Account created successfully.');
      router.replace('/dashboard');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<ShieldErrorResponse>(error)
        ? error.response?.data?.message ??
          'Registration failed. Please try again.'
        : 'Registration failed. Please try again.';

      toast.error(message);
    },
  });
}