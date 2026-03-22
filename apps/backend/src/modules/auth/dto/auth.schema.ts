import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email().trim(),
    password: z.string().min(8).max(72),
    jobTitleId: z.string().uuid().nullable().optional(),
    role: z.enum(['TEAM_LEAD', 'EMPLOYEE']),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email().trim(),
    password: z.string().min(8).max(72),
  })
  .strict();

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;

const userRoleEnumValues = ['TEAM_LEAD', 'EMPLOYEE'];

const userIdentityProperties: NonNullable<SchemaObject['properties']> = {
  firstName: {
    type: 'string',
    example: 'Zeynep',
  },
  lastName: {
    type: 'string',
    example: 'Aydinli',
  },
  email: {
    type: 'string',
    format: 'email',
    example: 'zeynep@example.com',
  },
  jobTitleId: {
    type: 'string',
    format: 'uuid',
    nullable: true,
    example: '2b5e5b5d-1111-4444-9999-123456789abc',
  },
  role: {
    type: 'string',
    enum: userRoleEnumValues,
    example: 'EMPLOYEE',
  },
};

const userResponseProperties: NonNullable<SchemaObject['properties']> = {
  id: {
    type: 'string',
    example: 'c1a8d7b4-4c7c-4f5c-a8d2-1c9b9f3d1111',
  },
  ...userIdentityProperties,
  isActive: {
    type: 'boolean',
    example: true,
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

export const RegisterBodySwaggerSchema: SchemaObject = {
  type: 'object',
  required: ['firstName', 'lastName', 'email', 'password', 'role'],
  properties: {
    ...userIdentityProperties,
    password: {
      type: 'string',
      example: 'StrongPass123',
    },
  },
};

export const LoginBodySwaggerSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
      example: 'zeynep@example.com',
    },
    password: {
      type: 'string',
      example: 'StrongPass123',
    },
  },
};

export const RegisterSuccessSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: userResponseProperties,
};

export const LoginSuccessSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
};

export const MeSuccessSwaggerSchema: SchemaObject = {
  type: 'object',
  properties: userResponseProperties,
};
