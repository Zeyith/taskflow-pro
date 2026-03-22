import axios from 'axios';

import { clientEnv } from '@/lib/env/env.client';
import { useAuthStore } from '@/stores/auth.store';

export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});