import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { createProjectRequest } from '@/features/projects/api/create-project';
import type { CreateProjectFormValues } from '@/features/projects/schemas/create-project.schema';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProjectFormValues) =>
      createProjectRequest(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.all,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });

      toast.success('Project created successfully.');
    },
    onError: () => {
      toast.error('Failed to create project.');
    },
  });
}