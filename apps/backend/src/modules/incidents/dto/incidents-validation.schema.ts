import { z } from 'zod';

import { INCIDENT_SEVERITY } from '../types/incident-severity.type';

const trimmedRequiredString = z.string().trim().min(1);

export const createIncidentSchema = z
  .object({
    projectId: trimmedRequiredString,
    title: z.string().trim().min(3).max(255),
    description: z.string().trim().max(5000).nullable().optional(),
    severity: z.enum([
      INCIDENT_SEVERITY.LOW,
      INCIDENT_SEVERITY.MEDIUM,
      INCIDENT_SEVERITY.HIGH,
      INCIDENT_SEVERITY.CRITICAL,
    ]),
  })
  .strict();

export const incidentIdParamSchema = z
  .object({
    id: trimmedRequiredString,
  })
  .strict();

export const projectIncidentListParamSchema = z
  .object({
    projectId: trimmedRequiredString,
  })
  .strict();

export type CreateIncidentDto = z.infer<typeof createIncidentSchema>;
export type IncidentIdParamDto = z.infer<typeof incidentIdParamSchema>;
export type ProjectIncidentListParamDto = z.infer<
  typeof projectIncidentListParamSchema
>;
