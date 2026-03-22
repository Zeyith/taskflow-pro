import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { LoginRequest, LoginResponseData, MeResponseData } from '@/types/auth';

export async function loginRequest(payload: LoginRequest): Promise<LoginResponseData> {
  const response = await apiClient.post<LoginResponseData>(
    apiEndpoints.auth.login,
    payload,
  );

  return response.data;
}

export async function meRequest(): Promise<MeResponseData> {
  const response = await apiClient.get<MeResponseData>(apiEndpoints.auth.me);

  return response.data;
}