'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { addProjectMemberRequest } from '@/features/projects/api/add-project-member';

type AddProjectMemberInput = {
  projectId: string;
  userId: string;
};

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddProjectMemberInput) =>
      addProjectMemberRequest(input.projectId, input.userId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId, 'members'],
      });

      toast.success('Project member added successfully.');
    },
    onError: () => {
      toast.error('Failed to add project member.');
    },
  });
}