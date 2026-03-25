import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { AuthUser } from '@/types/auth';

export type ChangePasswordRequest = {
  userId: string;
  currentPassword: string;
  newPassword: string;
};

export async function changePasswordRequest(
  payload: ChangePasswordRequest,
): Promise<AuthUser> {
  const response = await apiClient.patch<AuthUser>(
    apiEndpoints.users.changeOwnPassword(payload.userId),
    {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    },
  );

  return response.data;
}