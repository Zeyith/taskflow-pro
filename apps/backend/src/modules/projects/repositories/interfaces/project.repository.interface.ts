import type { NewProjectRow } from '../../../../core/database/schema';
import { Project } from '../../entities/project.entity';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export type UpdateProjectRepositoryPayload = Readonly<{
  name?: string;
  description?: string | null;
}>;

export interface IProjectRepository {
  create(project: NewProjectRow): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findAll(limit: number, offset: number): Promise<Project[]>;
  archive(id: string): Promise<Project | null>;
  update(
    id: string,
    payload: UpdateProjectRepositoryPayload,
  ): Promise<Project | null>;
  softDelete(id: string): Promise<Project | null>;
}
