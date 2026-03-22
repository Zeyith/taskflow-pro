import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  projectMembers,
  projects,
  users,
  type NewProjectMemberRow,
  type ProjectMemberRow,
  type ProjectRow,
  type UserRow,
} from '../../../core/database/schema';
import { ProjectMember } from '../entities/project-member.entity';
import { Project } from '../entities/project.entity';
import { type IProjectMemberRepository } from './interfaces/project-member.repository.interface';

@Injectable()
export class ProjectMemberRepository implements IProjectMemberRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(projectMember: NewProjectMemberRow): Promise<ProjectMember> {
    const [createdRow] = await this.db
      .insert(projectMembers)
      .values(projectMember)
      .returning();

    if (!createdRow) {
      throw new Error('Project member creation failed');
    }

    return this.toDomain(createdRow);
  }

  async findByProjectId(projectId: string): Promise<ProjectMember[]> {
    const rows = await this.db
      .select({
        membership: projectMembers,
        user: users,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          isNull(projectMembers.deletedAt),
          isNull(users.deletedAt),
        ),
      );

    return rows.map((row) =>
      this.toDomainWithUser(row.membership, row.user),
    );
  }

  async findActiveMembership(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null> {
    const [row] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
          isNull(projectMembers.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findAnyMembership(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null> {
    const [row] = await this.db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async restore(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null> {
    const [updatedRow] = await this.db
      .update(projectMembers)
      .set({
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  async findProjectsByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Project[]> {
    const rows = await this.db
      .select({
        project: projects,
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(
        and(
          eq(projectMembers.userId, userId),
          isNull(projectMembers.deletedAt),
          isNull(projects.deletedAt),
        ),
      )
      .limit(limit)
      .offset(offset);

    return rows.map((row) => this.toProjectDomain(row.project));
  }

  async softDelete(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null> {
    const [updatedRow] = await this.db
      .update(projectMembers)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
          isNull(projectMembers.deletedAt),
        ),
      )
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  private toDomain(row: ProjectMemberRow): ProjectMember {
    return new ProjectMember({
      id: row.id,
      projectId: row.projectId,
      userId: row.userId,
      addedBy: row.addedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
      user: null,
    });
  }

  private toDomainWithUser(
    membershipRow: ProjectMemberRow,
    userRow: UserRow,
  ): ProjectMember {
    return new ProjectMember({
      id: membershipRow.id,
      projectId: membershipRow.projectId,
      userId: membershipRow.userId,
      addedBy: membershipRow.addedBy,
      createdAt: membershipRow.createdAt,
      updatedAt: membershipRow.updatedAt,
      deletedAt: membershipRow.deletedAt ?? null,
      user: {
        id: userRow.id,
        firstName: userRow.firstName,
        lastName: userRow.lastName,
        email: userRow.email,
        role: userRow.role,
      },
    });
  }

  private toProjectDomain(row: ProjectRow): Project {
    return new Project({
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      createdBy: row.createdBy,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    });
  }
}