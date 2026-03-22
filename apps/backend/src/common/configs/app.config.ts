import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema';

type NodeEnv = 'development' | 'test' | 'production';

type AppSection = Readonly<{
  name: string;
  port: number;
  nodeEnv: NodeEnv;
}>;

type DatabaseSection = Readonly<{
  url: string;
}>;

type JwtSection = Readonly<{
  secret: string;
  expiresIn: number;
}>;

type RedisSection = Readonly<{
  host: string;
  port: number;
  password?: string;
  db: number;
}>;

@Injectable()
export class AppConfig {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  get app(): AppSection {
    return {
      name: this.configService.get('APP_NAME', { infer: true }),
      port: this.configService.get('PORT', { infer: true }),
      nodeEnv: this.configService.get('NODE_ENV', { infer: true }),
    };
  }

  get database(): DatabaseSection {
    return {
      url: this.configService.get('DATABASE_URL', { infer: true }),
    };
  }

  get jwt(): JwtSection {
    return {
      secret: this.configService.get('JWT_SECRET', { infer: true }),
      expiresIn: this.configService.get('JWT_EXPIRES_IN', { infer: true }),
    };
  }

  get redis(): RedisSection {
    return {
      host: this.configService.get('REDIS_HOST', { infer: true }),
      port: this.configService.get('REDIS_PORT', { infer: true }),
      password: this.configService.get('REDIS_PASSWORD', { infer: true }),
      db: this.configService.get('REDIS_DB', { infer: true }),
    };
  }

  get isProduction(): boolean {
    return this.configService.get('NODE_ENV', { infer: true }) === 'production';
  }
}
