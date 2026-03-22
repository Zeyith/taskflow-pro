import { z } from 'zod';

export const incidentSeverityValues = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
] as const;

export const createIncidentSchema = z.object({
  projectId: z.uuid('Please select a valid project.'),
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title must be 120 characters or less.'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters.')
    .max(2000, 'Description must be 2000 characters or less.'),
  severity: z.enum(incidentSeverityValues, {
    error: 'Please select a severity level.',
  }),
});

export type CreateIncidentSchemaValues = z.infer<typeof createIncidentSchema>;