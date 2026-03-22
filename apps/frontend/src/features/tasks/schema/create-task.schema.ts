import { z } from 'zod';

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Task title is required.')
      .max(200, 'Task title must be at most 200 characters long.'),
    description: z
      .string()
      .trim()
      .min(1, 'Description must not be empty when provided.')
      .max(2000, 'Description must be at most 2000 characters long.')
      .nullable()
      .optional(),
  })
  .strict();

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;