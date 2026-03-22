import { clientEnvSchema, type ClientEnv } from './env.schema';

const parsedEnv = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  NEXT_PUBLIC_SOCKET_NAMESPACE: process.env.NEXT_PUBLIC_SOCKET_NAMESPACE,
});

if (!parsedEnv.success) {
  throw new Error(
    `Invalid client environment variables: ${parsedEnv.error.message}`,
  );
}

export const clientEnv: ClientEnv = parsedEnv.data;