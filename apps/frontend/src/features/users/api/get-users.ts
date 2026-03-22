import { apiClient } from '@/lib/api/client';
import type { User } from '@/types/user';

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<User[]>('/users');

  return Array.isArray(response.data) ? response.data : [];
}