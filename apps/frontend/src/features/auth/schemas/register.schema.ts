import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.email().trim(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
    role: z.enum(['TEAM_LEAD', 'EMPLOYEE']),
  })
  .strict();

export type RegisterFormValues = z.infer<typeof registerSchema>;