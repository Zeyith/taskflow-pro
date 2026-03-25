'use client';

import { useMutation } from '@tanstack/react-query';

import {
  changePasswordRequest,
  type ChangePasswordRequest,
} from '@/features/auth/api/change-password';
import type { AuthUser } from '@/types/auth';

export function useChangePassword() {
  return useMutation<AuthUser, Error, ChangePasswordRequest>({
    mutationFn: (payload: ChangePasswordRequest) =>
      changePasswordRequest(payload),
  });
}