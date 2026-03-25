'use client';

import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { registerRequest } from '@/features/auth/api/register';
import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';

type ShieldErrorResponse = {
  message?: string;
};

export function useRegister() {
  return useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const registeredUser = await registerRequest(values);

      return registeredUser;
    },
    onSuccess: () => {
      toast.success('Account created successfully.');
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