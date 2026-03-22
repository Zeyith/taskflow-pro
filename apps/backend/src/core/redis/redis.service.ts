import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfig } from '../../common/configs/app.config';
import { buildRedisOptions } from './redis-connection';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly appConfig: AppConfig) {
    this.client = new Redis(buildRedisOptions(this.appConfig));

    this.client.on('connect', () => {
      this.logger.log(
        JSON.stringify({
          message: 'Redis client connected',
          context: RedisService.name,
          timestamp: new Date().toISOString(),
        }),
      );
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(
        JSON.stringify({
          message: 'Redis client error',
          error: error.message,
          context: RedisService.name,
          timestamp: new Date().toISOString(),
        }),
      );
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds !== undefined) {
      await this.client.set(key, value, 'EX', ttlSeconds);
      return;
    }

    await this.client.set(key, value);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  eval<T>(
    script: string,
    keys: string[],
    args: Array<string | number>,
  ): Promise<T> {
    const result = this.client.eval(
      script,
      keys.length,
      ...keys,
      ...args,
    ) as unknown;

    return result as Promise<T>;
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client.quit();
  }
}
