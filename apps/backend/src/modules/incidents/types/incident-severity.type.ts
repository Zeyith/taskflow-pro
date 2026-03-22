export const INCIDENT_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type IncidentSeverity =
  (typeof INCIDENT_SEVERITY)[keyof typeof INCIDENT_SEVERITY];
