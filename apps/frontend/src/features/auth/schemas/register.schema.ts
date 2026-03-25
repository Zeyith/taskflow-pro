import { z } from 'zod';

const taskflowEmailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address.')
  .refine((value) => value.toLowerCase().endsWith('@taskflow.com'), {
    message: 'Email must end with @taskflow.com',
  });

const strongPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Z]/, 'Password must include at least 1 uppercase letter')
  .regex(/[0-9]/, 'Password must include at least 1 number')
  .regex(
    /[^A-Za-z0-9]/,
    'Password must include at least 1 special character',
  );

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: taskflowEmailSchema,
    password: strongPasswordSchema,
    role: z.enum(['TEAM_LEAD', 'EMPLOYEE']),
  })
  .strict();

export type RegisterFormValues = z.infer<typeof registerSchema>;