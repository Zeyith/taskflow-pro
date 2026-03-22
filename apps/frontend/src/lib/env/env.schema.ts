import { z } from 'zod';

export const clientEnvSchema = z
  .object({
    NEXT_PUBLIC_APP_NAME: z.string().min(1),
    NEXT_PUBLIC_API_BASE_URL: z.url(),
    NEXT_PUBLIC_SOCKET_URL: z.url(),
    NEXT_PUBLIC_SOCKET_NAMESPACE: z.string().min(1),
  })
  .strict();

export type ClientEnv = z.infer<typeof clientEnvSchema>;