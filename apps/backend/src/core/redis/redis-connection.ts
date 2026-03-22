import type { RedisOptions } from 'ioredis';
import type { AppConfig } from '../../common/configs/app.config';

export function buildRedisOptions(appConfig: AppConfig): RedisOptions {
  const redis = appConfig.redis;

  return {
    host: redis.host,
    port: redis.port,
    password: redis.password,
    db: redis.db,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  };
}
