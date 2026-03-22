import { z } from 'zod';

export const taskIdParamSchema = z.object({
  id: z.uuid(),
});

export const projectIdParamSchema = z.object({
  projectId: z.uuid(),
});

export const taskAssigneeParamsSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
});

export const createTaskBodySchema = z
  .object({
    projectId: z.uuid(),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(2000).nullable().optional(),
    assigneeIds: z.array(z.uuid()).optional().default([]),
  })
  .strip();

export const addTaskAssigneeBodySchema = z
  .object({
    userId: z.uuid(),
  })
  .strip();

export const updateTaskAssignmentStatusBodySchema = z
  .object({
    status: z.enum([
      'PENDING',
      'IN_PROGRESS',
      'AWAITING_APPROVAL',
      'WAITING_FOR_CHANGES',
      'COMPLETED',
    ]),
  })
  .strip();

export type TaskIdParamDto = z.infer<typeof taskIdParamSchema>;
export type ProjectIdParamDto = z.infer<typeof projectIdParamSchema>;
export type TaskAssigneeParamsDto = z.infer<typeof taskAssigneeParamsSchema>;
export type CreateTaskBodyDto = z.infer<typeof createTaskBodySchema>;
export type AddTaskAssigneeBodyDto = z.infer<typeof addTaskAssigneeBodySchema>;
export type UpdateTaskAssignmentStatusBodyDto = z.infer<
  typeof updateTaskAssignmentStatusBodySchema
>;

export const CreateTaskBodySwaggerSchema = {
  type: 'object',
  properties: {
    projectId: {
      type: 'string',
      format: 'uuid',
      example: '1ff1ec46-1391-4faf-91b3-de4dcd1f3636',
    },
    title: {
      type: 'string',
      example: 'Login Screen Update',
    },
    description: {
      type: 'string',
      nullable: true,
      example: 'Update login screen flow and prepare review',
    },
    assigneeIds: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uuid',
      },
      example: ['d39b7c28-89e7-4673-ac31-13443cc48280'],
    },
  },
  required: ['projectId', 'title', 'assigneeIds'],
};

export const AddTaskAssigneeBodySwaggerSchema = {
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      format: 'uuid',
      example: 'd39b7c28-89e7-4673-ac31-13443cc48280',
    },
  },
  required: ['userId'],
};

export const UpdateTaskAssignmentStatusBodySwaggerSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: [
        'PENDING',
        'IN_PROGRESS',
        'AWAITING_APPROVAL',
        'WAITING_FOR_CHANGES',
        'COMPLETED',
      ],
      example: 'IN_PROGRESS',
    },
  },
  required: ['status'],
};
