'use client';

import { useQuery } from '@tanstack/react-query';

import { getNotificationsRequest } from '@/features/notifications/api/get-notifications';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: getNotificationsRequest,
  });
}