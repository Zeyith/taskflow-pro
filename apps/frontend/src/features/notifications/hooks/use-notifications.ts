'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getNotificationsRequest,
  type GetNotificationsRequestParams,
} from '@/features/notifications/api/get-notifications';

export function useNotifications(params: GetNotificationsRequestParams) {
  return useQuery({
    queryKey: ['notifications', 'list', params.limit, params.offset],
    queryFn: () => getNotificationsRequest(params),
  });
}