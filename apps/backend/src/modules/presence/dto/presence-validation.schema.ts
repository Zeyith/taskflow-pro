import { z } from 'zod';

const trimmedRequiredString = z.string().trim().min(1);

export const presenceHeartbeatSchema = z
  .object({
    projectId: trimmedRequiredString,
  })
  .strict();

export const presenceFocusedTaskSetSchema = z
  .object({
    projectId: trimmedRequiredString,
    taskId: z.string().trim().min(1).nullable(),
  })
  .strict();

export const projectPresenceQuerySchema = z
  .object({
    projectId: trimmedRequiredString,
  })
  .strict();

export type PresenceHeartbeatDto = z.infer<typeof presenceHeartbeatSchema>;
export type PresenceFocusedTaskSetDto = z.infer<
  typeof presenceFocusedTaskSetSchema
>;
export type ProjectPresenceQueryDto = z.infer<
  typeof projectPresenceQuerySchema
>;
