import type { CreateProjectFormValues } from '@/features/projects/schemas/create-project.schema';
import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Project } from '@/types/project';

type CreateProjectRequestBody = {
  name: string;
  description?: string | null;
};

export const createProjectRequest = async (
  values: CreateProjectFormValues,
): Promise<Project> => {
  const normalizedDescription =
    values.description == null || values.description.trim() === ''
      ? null
      : values.description.trim();

  const payload: CreateProjectRequestBody = {
    name: values.name.trim(),
    description: normalizedDescription,
  };

  const response = await apiClient.post<Project>(
    apiEndpoints.projects.create,
    payload,
  );

  return response.data;
};