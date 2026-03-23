'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { archiveProjectRequest } from '@/features/projects/api/archive-project';
import type { Project, ProjectsListResponse } from '@/types/project';

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => archiveProjectRequest(projectId),
    onSuccess: async (archivedProject, projectId) => {
      queryClient.setQueryData<Project>(
        queryKeys.projects.detail(projectId),
        archivedProject,
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
              project.id === archivedProject.id ? archivedProject : project,
            ),
          };
        },
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(projectId),
        }),
      ]);

      toast.success('Project archived successfully.');
    },
    onError: () => {
      toast.error('Failed to archive project.');
    },
  });
}