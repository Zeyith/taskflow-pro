import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { z } from 'zod';

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    description: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

export const projectListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const addProjectMemberSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const projectIdParamSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();

export const projectMemberParamsSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
  })
  .strict();

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type ProjectListQueryDto = z.infer<typeof projectListQuerySchema>;
export type AddProjectMemberDto = z.infer<typeof addProjectMemberSchema>;
export type ProjectIdParamDto = z.infer<typeof projectIdParamSchema>;
export type ProjectMemberParamsDto = z.infer<typeof projectMemberParamsSchema>;

const projectResponseProperties: NonNullable<SchemaObject['properties']> = {
  id: {
    type: 'string',
    example: '4b7de8c0-9f83-4b55-a9b4-0a31c0d22111',
  },
  name: {
    type: 'string',
    example: 'Mobile App Revision',
  },
  description: {
    type: 'string',
    nullable: true,
    example: 'Revision project for login and onboarding flows',
  },
  createdBy: {
    type: 'string',
    example: '9d7f0a8a-5b24-4bd4-aeb3-d4c2e9911111',
  },
  isArchived: {
    type: 'boolean',
    example: false,
  },
  createdAt: {
    type: 'string',
    format: 'date-time',
    example: '2026-03-12T10:00:00.000Z',
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    example: '2026-03-12T10:00:00.000Z',
  },
};

const projectMemberResponseProperties: NonNullable<SchemaObject['properties']> =
  {
    id: {
      type: 'string',
      example: '3f4de8c0-9f83-4b55-a9b4-0a31c0d22999',
    },
    projectId: {
      type: 'string',
      example: '4b7de8c0-9f83-4b55-a9b4-0a31c0d22111',
    },
    userId: {
      type: 'string',
      example: '9d7f0a8a-5b24-4bd4-aeb3-d4c2e9911111',
    },
    addedBy: {
      type: 'string',
      example: '840c05df-efbc-452a-b7eb-b0771b4c5042',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-03-12T10:00:00.000Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      example: '2026-03-12T10:00:00.000Z',
    },
    deletedAt: {
      type: 'string',
      format: 'date-time',
      nullable: true,
      example: null,
    },
  };

export const CreateProjectBodySwaggerSchema: SchemaObject = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      example: 'Mobile App Revision',
    },
    description: {
      type: 'string',
      nullable: true,
      example: 'Revision project for login and onboarding flows',
    },
  },
};

export const AddProjectMemberBodySwaggerSchema: SchemaObject = {
  type: 'object',
  required: ['userId'],
  properties: {
    userId: {
      type: 'string',
      format: 'uuid',
      example: '9d7f0a8a-5b24-4bd4-aeb3-d4c2e9911111',
    },
  },
};

export const ProjectResponseSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: projectResponseProperties,
};

export const ProjectListResponseSwaggerSchema: SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    properties: projectResponseProperties,
  },
};

export const ProjectMemberResponseSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: projectMemberResponseProperties,
};

export const ProjectMemberListResponseSwaggerSchema: SchemaObject = {
  type: 'array',
  items: {
    type: 'object',
    properties: projectMemberResponseProperties,
  },
};
