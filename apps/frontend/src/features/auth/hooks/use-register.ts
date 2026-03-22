import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { registerRequest } from '@/features/auth/api/register';

type ShieldErrorResponse = {
  message?: string;
};

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
    onSuccess: () => {
      toast.success('Account created successfully. You can now sign in.');
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ShieldErrorResponse>;
      const message =
        axiosError.response?.data?.message ??
        'Registration failed. Please try again.';

      toast.error(message);
    },
  });
}