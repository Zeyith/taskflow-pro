import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  incidentRooms,
  type IncidentRoomRow,
  type NewIncidentRoomRow,
} from '../../../core/database/schema';
import { IncidentRoom } from '../entities/incident-room.entity';
import { type IIncidentRoomRepository } from './interfaces/incident-room.repository.interface';

@Injectable()
export class IncidentRoomRepository implements IIncidentRoomRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(incidentRoom: NewIncidentRoomRow): Promise<IncidentRoom> {
    const [createdRow] = await this.db
      .insert(incidentRooms)
      .values(incidentRoom)
      .returning();

    if (!createdRow) {
      throw new Error('Incident room creation failed');
    }

    return this.toDomain(createdRow);
  }

  async findById(id: string): Promise<IncidentRoom | null> {
    const [row] = await this.db
      .select()
      .from(incidentRooms)
      .where(and(eq(incidentRooms.id, id), isNull(incidentRooms.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByProjectId(projectId: string): Promise<IncidentRoom[]> {
    const rows = await this.db
      .select()
      .from(incidentRooms)
      .where(
        and(
          eq(incidentRooms.projectId, projectId),
          isNull(incidentRooms.deletedAt),
        ),
      )
      .orderBy(desc(incidentRooms.createdAt));

    return rows.map((row) => this.toDomain(row));
  }

  async close(id: string, closedAt: Date): Promise<IncidentRoom | null> {
    const [updatedRow] = await this.db
      .update(incidentRooms)
      .set({
        status: 'RESOLVED',
        closedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(incidentRooms.id, id), isNull(incidentRooms.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  private toDomain(row: IncidentRoomRow): IncidentRoom {
    return new IncidentRoom({
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      description: row.description ?? null,
      severity: row.severity as IncidentRoom['severity'],
      status: row.status as IncidentRoom['status'],
      createdBy: row.createdBy,
      closedAt: row.closedAt ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    });
  }
}
