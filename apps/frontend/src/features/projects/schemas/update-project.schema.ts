import { z } from 'zod';

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Project name must be at least 2 characters.')
      .max(120, 'Project name must be at most 120 characters.'),
    description: z
      .string()
      .trim()
      .max(500, 'Description must be at most 500 characters.')
      .optional(),
  })
  .strict();

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;