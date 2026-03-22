import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { User } from '@/types/user';

import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';

export async function registerRequest(
  payload: RegisterFormValues,
): Promise<User> {
  const response = await apiClient.post<User>(apiEndpoints.auth.register, payload);

  return response.data;
}