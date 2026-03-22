'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { removeProjectMemberRequest } from '@/features/projects/api/remove-project-member';

type RemoveProjectMemberParams = {
  projectId: string;
  userId: string;
};

type ShieldErrorResponse = {
  message?: string;
};

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProjectMemberRequest,
    onSuccess: async (_data, variables) => {
      toast.success('Project member removed successfully.');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['project', variables.projectId, 'members'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['project', variables.projectId, 'tasks'],
        }),
      ]);
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<ShieldErrorResponse>(error)
        ? error.response?.data?.message ??
          'Failed to remove project member.'
        : 'Failed to remove project member.';

      toast.error(message);
    },
  });
}