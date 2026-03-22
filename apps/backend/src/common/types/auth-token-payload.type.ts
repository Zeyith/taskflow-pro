import { z } from 'zod';

export const authTokenPayloadSchema = z.looseObject({
  sub: z.uuid(),
  email: z.email(),
  role: z.enum(['TEAM_LEAD', 'EMPLOYEE']),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;