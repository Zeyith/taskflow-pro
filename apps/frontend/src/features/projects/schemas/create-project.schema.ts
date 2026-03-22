import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Project name is required.')
      .max(150, 'Project name must be at most 150 characters long.'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be at most 2000 characters long.')
      .nullable()
      .optional(),
  })
  .strict();

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;