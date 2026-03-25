import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, sql, type SQL } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  incidentRooms,
  type IncidentRoomRow,
  type NewIncidentRoomRow,
} from '../../../core/database/schema';
import { IncidentRoom } from '../entities/incident-room.entity';
import {
  type FindIncidentRoomsFilters,
  type FindIncidentRoomsResult,
  type IIncidentRoomRepository,
  type UpdateIncidentRoomPayload,
} from './interfaces/incident-room.repository.interface';

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

  async findMany(
    filters: FindIncidentRoomsFilters,
  ): Promise<FindIncidentRoomsResult> {
    const conditions: SQL<unknown>[] = [isNull(incidentRooms.deletedAt)];

    if (filters.projectIds && filters.projectIds.length > 0) {
      conditions.push(inArray(incidentRooms.projectId, filters.projectIds));
    }

    if (filters.severity) {
      conditions.push(eq(incidentRooms.severity, filters.severity));
    }

    if (filters.status) {
      conditions.push(eq(incidentRooms.status, filters.status));
    }

    const whereClause = and(...conditions);

    const rows = await this.db
      .select()
      .from(incidentRooms)
      .where(whereClause)
      .orderBy(desc(incidentRooms.createdAt))
      .limit(filters.limit)
      .offset(filters.offset);

    const totalRows = await this.db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(incidentRooms)
      .where(whereClause);

    return {
      items: rows.map((row) => this.toDomain(row)),
      total: totalRows[0]?.count ?? 0,
    };
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

  async update(
    id: string,
    payload: UpdateIncidentRoomPayload,
  ): Promise<IncidentRoom | null> {
    const [updatedRow] = await this.db
      .update(incidentRooms)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(incidentRooms.id, id), isNull(incidentRooms.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  async softDelete(id: string): Promise<boolean> {
    const [deletedRow] = await this.db
      .update(incidentRooms)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(incidentRooms.id, id), isNull(incidentRooms.deletedAt)))
      .returning({ id: incidentRooms.id });

    return deletedRow !== undefined;
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
