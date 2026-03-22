'use client';

import { useQuery } from '@tanstack/react-query';

import { getUnreadNotificationsCountRequest } from '@/features/notifications/api/get-unread-notifications-count';

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadNotificationsCountRequest,
  });
}