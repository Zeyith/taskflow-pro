'use client';

import { useQuery } from '@tanstack/react-query';

import { getAccessibleIncidentsRequest } from '../api/get-accessible-incidents';
import type { AccessibleIncidentsFilters } from '@/types/incident-filters';

export function useAccessibleIncidents(filters: AccessibleIncidentsFilters) {
  return useQuery({
    queryKey: ['incidents', 'accessible', filters],
    queryFn: () => getAccessibleIncidentsRequest(filters),
  });
}