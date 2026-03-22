import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../common/configs/app.config';
import { RedisService } from '../../core/redis/redis.service';

type HealthCheckResponse = Readonly<{
  status: 'ok' | 'degraded';
  service: string;
  environment: 'development' | 'test' | 'production';
  timestamp: string;
  dependencies: Readonly<{
    redis: Readonly<{
      status: 'up' | 'down';
      message: string;
    }>;
  }>;
}>;

type TeamLeadOnlyHealthResponse = Readonly<{
  status: 'ok';
  access: 'granted';
  roleRequired: 'TEAM_LEAD';
}>;

@Injectable()
export class HealthService {
  constructor(
    private readonly appConfig: AppConfig,
    private readonly redisService: RedisService,
  ) {}

  async getHealth(): Promise<HealthCheckResponse> {
    try {
      const redisPingResult = await this.redisService.ping();

      return {
        status: 'ok',
        service: this.appConfig.app.name,
        environment: this.appConfig.app.nodeEnv,
        timestamp: new Date().toISOString(),
        dependencies: {
          redis: {
            status: redisPingResult === 'PONG' ? 'up' : 'down',
            message: redisPingResult,
          },
        },
      };
    } catch {
      return {
        status: 'degraded',
        service: this.appConfig.app.name,
        environment: this.appConfig.app.nodeEnv,
        timestamp: new Date().toISOString(),
        dependencies: {
          redis: {
            status: 'down',
            message: 'Redis unreachable',
          },
        },
      };
    }
  }

  getTeamLeadOnlyHealth(): TeamLeadOnlyHealthResponse {
    return {
      status: 'ok',
      access: 'granted',
      roleRequired: 'TEAM_LEAD',
    };
  }
}
