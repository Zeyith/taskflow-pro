import { z } from 'zod';

export const notificationListQuerySchema = z
  .object({
    limit: z.coerce.number().int().positive().max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const notificationIdParamSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export type NotificationListQueryDto = z.infer<
  typeof notificationListQuerySchema
>;

export type NotificationIdParamDto = z.infer<typeof notificationIdParamSchema>;
