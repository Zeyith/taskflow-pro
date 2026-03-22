import { envSchema, type Env } from './env.schema';

type RawEnv = Record<string, unknown>;

export function validate(config: RawEnv): Env {
  const picked = {
    PORT: config.PORT,
    NODE_ENV: config.NODE_ENV,
    APP_NAME: config.APP_NAME,
    DATABASE_URL: config.DATABASE_URL,
    JWT_SECRET: config.JWT_SECRET,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN,
    REDIS_HOST: config.REDIS_HOST,
    REDIS_PORT: config.REDIS_PORT,
    REDIS_PASSWORD: config.REDIS_PASSWORD,
    REDIS_DB: config.REDIS_DB,
  };

  return envSchema.parse(picked);
}
