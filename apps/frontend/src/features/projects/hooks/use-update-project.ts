'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import {
  updateProjectRequest,
  type UpdateProjectRequestInput,
} from '@/features/projects/api/update-project';
import type { Project, ProjectsListResponse } from '@/types/project';

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProjectRequestInput) =>
      updateProjectRequest(input),
    onSuccess: async (updatedProject, variables) => {
      queryClient.setQueryData<Project>(
        queryKeys.projects.detail(variables.projectId),
        updatedProject,
      );

      queryClient.setQueryData<ProjectsListResponse | undefined>(
        queryKeys.projects.all,
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            data: current.data.map((project) =>
              project.id === updatedProject.id ? updatedProject : project,
            ),
          };
        },
      );

      await Promise.all([
        queryClient.refetchQueries({
          queryKey: queryKeys.projects.detail(variables.projectId),
        }),
        queryClient.refetchQueries({
          queryKey: queryKeys.projects.all,
        }),
      ]);

      toast.success('Project updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update project.');
    },
  });
}