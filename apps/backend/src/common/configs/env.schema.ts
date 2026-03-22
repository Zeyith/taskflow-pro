import { z } from 'zod';

export const envSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),

    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    APP_NAME: z.string().min(1).default('TaskFlow Pro API'),

    DATABASE_URL: z.string().min(1),

    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.coerce.number().int().positive(),

    REDIS_HOST: z.string().min(1).default('localhost'),
    REDIS_PORT: z.coerce.number().int().positive().default(6379),
    REDIS_PASSWORD: z.string().min(1).optional(),
    REDIS_DB: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export type Env = z.infer<typeof envSchema>;
