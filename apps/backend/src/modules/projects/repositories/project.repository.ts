import { Inject, Injectable } from '@nestjs/common';
import { eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  projects,
  type NewProjectRow,
  type ProjectRow,
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

    return this.toDomain(createdRow);
  }

  async findById(id: string): Promise<Project | null> {
    const [row] = await this.db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!row || row.deletedAt !== null) {
      return null;
    }

    return this.toDomain(row);
  }

  async findAll(limit: number, offset: number): Promise<Project[]> {
    const rows = await this.db
      .select()
      .from(projects)
      .where(isNull(projects.deletedAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => this.toDomain(row));
  }

  async archive(id: string): Promise<Project | null> {
    const [updatedRow] = await this.db
      .update(projects)
      .set({
        isArchived: true,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning();

    if (!updatedRow || updatedRow.deletedAt !== null) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  private toDomain(row: ProjectRow): Project {
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
