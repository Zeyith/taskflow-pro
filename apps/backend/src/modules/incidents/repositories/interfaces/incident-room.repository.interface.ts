import type { NewIncidentRoomRow } from '../../../../core/database/schema';
import { IncidentRoom } from '../../entities/incident-room.entity';

export const INCIDENT_ROOM_REPOSITORY = Symbol('INCIDENT_ROOM_REPOSITORY');

export type FindIncidentRoomsFilters = {
  projectIds?: string[];
  severity?: IncidentRoom['severity'];
  status?: IncidentRoom['status'];
  limit: number;
  offset: number;
};

export type FindIncidentRoomsResult = {
  items: IncidentRoom[];
  total: number;
};

export interface IIncidentRoomRepository {
  create(incidentRoom: NewIncidentRoomRow): Promise<IncidentRoom>;
  findById(id: string): Promise<IncidentRoom | null>;
  findByProjectId(projectId: string): Promise<IncidentRoom[]>;
  findMany(filters: FindIncidentRoomsFilters): Promise<FindIncidentRoomsResult>;
  close(id: string, closedAt: Date): Promise<IncidentRoom | null>;
}