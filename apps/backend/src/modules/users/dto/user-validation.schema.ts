import { z } from 'zod';

export const userIdParamSchema = z.object({
  id: z.uuid(),
});

export const updateUserProfileBodySchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    email: z.email().trim().toLowerCase().optional(),
    jobTitleId: z.uuid().nullable().optional(),
  })
  .strip()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const changeOwnPasswordBodySchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6).max(128),
  })
  .strip()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const resetUserPasswordBodySchema = z
  .object({
    newPassword: z.string().min(6).max(128),
  })
  .strip();

export const updateUserRoleBodySchema = z
  .object({
    role: z.enum(['TEAM_LEAD', 'EMPLOYEE']),
  })
  .strip();

export const updateUserStatusBodySchema = z
  .object({
    isActive: z.boolean(),
  })
  .strip();

export type UserIdParamDto = z.infer<typeof userIdParamSchema>;
export type UpdateUserProfileBodyDto = z.infer<
  typeof updateUserProfileBodySchema
>;
export type ChangeOwnPasswordBodyDto = z.infer<
  typeof changeOwnPasswordBodySchema
>;
export type ResetUserPasswordBodyDto = z.infer<
  typeof resetUserPasswordBodySchema
>;
export type UpdateUserRoleBodyDto = z.infer<typeof updateUserRoleBodySchema>;
export type UpdateUserStatusBodyDto = z.infer<
  typeof updateUserStatusBodySchema
>;
