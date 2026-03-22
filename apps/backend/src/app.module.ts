import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ConfigsModule } from './common/configs/configs.module';
import { validate } from './common/configs/validate';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { DatabaseModule } from './core/database/database.module';
import { RedisModule } from './core/redis/redis.module';
import { RealtimeModule } from './core/realtime/realtime.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { JobTitlesModule } from './modules/job-titles/job-titles.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PresenceModule } from './modules/presence/presence.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CacheModule } from './core/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      validate,
    }),
    EventEmitterModule.forRoot(),
    ConfigsModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    ProjectsModule,
    JobTitlesModule,
    TasksModule,
    RedisModule,
    RealtimeModule,
    NotificationsModule,
    PresenceModule,
    IncidentsModule,
    CacheModule,
  ],
  providers: [GlobalExceptionFilter],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
