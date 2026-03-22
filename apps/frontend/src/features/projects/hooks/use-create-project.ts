import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createProjectRequest } from '@/features/projects/api/create-project';
import type { CreateProjectFormValues } from '@/features/projects/schemas/create-project.schema';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProjectFormValues) =>
      createProjectRequest(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['projects'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['dashboard', 'summary'],
      });

      toast.success('Project created successfully.');
    },
    onError: () => {
      toast.error('Failed to create project.');
    },
  });
}