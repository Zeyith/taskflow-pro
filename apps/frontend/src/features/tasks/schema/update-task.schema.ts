import { z } from 'zod';

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required.')
      .max(200, 'Title must be 200 characters or less.'),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must be 2000 characters or less.')
      .nullable()
      .optional(),
  })
  .strict();

export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;