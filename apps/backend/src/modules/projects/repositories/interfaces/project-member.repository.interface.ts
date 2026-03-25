import type { NewProjectMemberRow } from '../../../../core/database/schema';
import { ProjectMember } from '../../entities/project-member.entity';
import { Project } from '../../entities/project.entity';

export const PROJECT_MEMBER_REPOSITORY = Symbol('PROJECT_MEMBER_REPOSITORY');

export interface IProjectMemberRepository {
  create(projectMember: NewProjectMemberRow): Promise<ProjectMember>;
  findByProjectId(projectId: string): Promise<ProjectMember[]>;
  findActiveMembership(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null>;
  findAnyMembership(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null>;
  restore(projectId: string, userId: string): Promise<ProjectMember | null>;
  findProjectsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Project[]>;
  findActiveProjectIdsByUserId(userId: string): Promise<string[]>;
  softDelete(projectId: string, userId: string): Promise<ProjectMember | null>;
}
