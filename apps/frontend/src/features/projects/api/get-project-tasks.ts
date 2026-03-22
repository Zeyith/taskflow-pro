import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Task } from '@/types/task';

type ProjectTasksApiResponse =
  | Task[]
  | {
      data: Task[];
      meta?: {
        isCached?: boolean;
      };
    };

function normalizeProjectTasksResponse(
  response: ProjectTasksApiResponse,
): Task[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.data;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const response = await apiClient.get<ProjectTasksApiResponse>(
    apiEndpoints.projects.tasks(projectId),
  );

  return normalizeProjectTasksResponse(response.data);
}