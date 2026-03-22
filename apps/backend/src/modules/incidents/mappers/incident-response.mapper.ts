import { IncidentRoom } from '../entities/incident-room.entity';

export type IncidentResponse = Readonly<{
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: IncidentRoom['severity'];
  status: IncidentRoom['status'];
  createdBy: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export function toIncidentResponse(incident: IncidentRoom): IncidentResponse {
  return {
    id: incident.id,
    projectId: incident.projectId,
    title: incident.title,
    description: incident.description,
    severity: incident.severity,
    status: incident.status,
    createdBy: incident.createdBy,
    closedAt: incident.closedAt ? incident.closedAt.toISOString() : null,
    createdAt: incident.createdAt.toISOString(),
    updatedAt: incident.updatedAt.toISOString(),
  };
}
