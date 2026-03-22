import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import { jobTitles, type JobTitleRow } from '../../../core/database/schema';
import { JobTitle } from '../entities/job-title.entity';
import type { IJobTitleRepository } from './interfaces/job-title.repository.interface';

@Injectable()
export class JobTitleRepository implements IJobTitleRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async findAll(): Promise<JobTitle[]> {
    const rows = await this.db.select().from(jobTitles);

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<JobTitle | null> {
    const [row] = await this.db
      .select()
      .from(jobTitles)
      .where(eq(jobTitles.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  private toDomain(row: JobTitleRow): JobTitle {
    return new JobTitle({
      id: row.id,
      code: row.code,
      label: row.label,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
