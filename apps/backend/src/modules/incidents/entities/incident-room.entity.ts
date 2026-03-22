import type { IncidentSeverity } from '../types/incident-severity.type';
import type { IncidentStatus } from '../types/incident-status.type';

export type IncidentRoomProps = Readonly<{
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdBy: string;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}>;

export class IncidentRoom {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string | null;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly createdBy: string;
  readonly closedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: IncidentRoomProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.severity = props.severity;
    this.status = props.status;
    this.createdBy = props.createdBy;
    this.closedAt = props.closedAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
