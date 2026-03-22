import type { IncidentSeverity, IncidentStatus } from '@/types/incident';

export function getIncidentSeverityLabel(
  severity: IncidentSeverity | string,
): string {
  switch (severity) {
    case 'LOW':
      return 'Low';
    case 'MEDIUM':
      return 'Medium';
    case 'HIGH':
      return 'High';
    case 'CRITICAL':
      return 'Critical';
    default:
      return severity;
  }
}

export function getIncidentSeverityClassName(
  severity: IncidentSeverity | string,
): string {
  switch (severity) {
    case 'LOW':
      return 'border-white/10 bg-white/[0.04] text-zinc-300';
    case 'MEDIUM':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
    case 'HIGH':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-300';
    case 'CRITICAL':
      return 'border-red-500/20 bg-red-500/10 text-red-300';
    default:
      return 'border-white/10 bg-white/[0.04] text-zinc-300';
  }
}

export function getIncidentStatusLabel(status: IncidentStatus | string): string {
  switch (status) {
    case 'OPEN':
      return 'Open';
    case 'RESOLVED':
      return 'Resolved';
    case 'CLOSED':
      return 'Closed';
    default:
      return status;
  }
}

export function getIncidentStatusClassName(
  status: IncidentStatus | string,
): string {
  switch (status) {
    case 'OPEN':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
    case 'RESOLVED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
    case 'CLOSED':
      return 'border-white/10 bg-white/[0.04] text-zinc-300';
    default:
      return 'border-white/10 bg-white/[0.04] text-zinc-300';
  }
}