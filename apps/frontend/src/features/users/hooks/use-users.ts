'use client';

import { useQuery } from '@tanstack/react-query';

import { getUsers } from '@/features/users/api/get-users';

type UseUsersOptions = {
  enabled?: boolean;
};

export function useUsers(options?: UseUsersOptions) {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: options?.enabled ?? true,
  });
}