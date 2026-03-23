import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  projects,
  users,
  type NewProjectRow,
  type ProjectRow,
  type UserRow,
} from '../../../core/database/schema';
import { Project } from '../entities/project.entity';
import { type IProjectRepository } from './interfaces/project.repository.interface';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(project: NewProjectRow): Promise<Project> {
    const [createdRow] = await this.db
      .insert(projects)
      .values(project)
      .returning();

    if (!createdRow) {
      throw new Error('Project creation failed');
    }

    const [projectWithCreator] = await this.db
      .select({
        project: projects,
        creator: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .where(and(eq(projects.id, createdRow.id), isNull(projects.deletedAt)))
      .limit(1);

    if (!projectWithCreator) {
      return this.toDomain(createdRow);
    }

    return this.toDomainWithCreator(
      projectWithCreator.project,
      projectWithCreator.creator,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await this.db
      .select({
        project: projects,
        creator: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomainWithCreator(row.project, row.creator);
  }

  async findAll(limit: number, offset: number): Promise<Project[]> {
    const rows = await this.db
      .select({
        project: projects,
        creator: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .where(isNull(projects.deletedAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) =>
      this.toDomainWithCreator(row.project, row.creator),
    );
  }

  async archive(id: string): Promise<Project | null> {
    const [updatedRow] = await this.db
      .update(projects)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    const [projectWithCreator] = await this.db
      .select({
        project: projects,
        creator: users,
      })
      .from(projects)
      .leftJoin(users, eq(projects.createdBy, users.id))
      .where(and(eq(projects.id, updatedRow.id), isNull(projects.deletedAt)))
      .limit(1);

    if (!projectWithCreator) {
      return this.toDomain(updatedRow);
    }

    return this.toDomainWithCreator(
      projectWithCreator.project,
      projectWithCreator.creator,
    );
  }

  private toDomain(row: ProjectRow): Project {
    return new Project({
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      createdBy: row.createdBy,
      createdByUser: null,
      isArchived: row.isArchived,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    });
  }

  private toDomainWithCreator(
    projectRow: ProjectRow,
    creatorRow: UserRow | null,
  ): Project {
    return new Project({
      id: projectRow.id,
      name: projectRow.name,
      description: projectRow.description ?? null,
      createdBy: projectRow.createdBy,
      createdByUser: creatorRow
        ? {
            id: creatorRow.id,
            firstName: creatorRow.firstName,
            lastName: creatorRow.lastName,
            email: creatorRow.email,
            role: creatorRow.role,
          }
        : null,
      isArchived: projectRow.isArchived,
      createdAt: projectRow.createdAt,
      updatedAt: projectRow.updatedAt,
      deletedAt: projectRow.deletedAt ?? null,
    });
  }
}