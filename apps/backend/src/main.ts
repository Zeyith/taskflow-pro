import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfig } from './common/configs/app.config';
import { setupSwagger } from './common/configs/swagger.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const appConfig = app.get(AppConfig);
  const globalExceptionFilter = app.get(GlobalExceptionFilter);

  app.useGlobalFilters(globalExceptionFilter);
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  setupSwagger(app);

  await app.listen(appConfig.app.port);
}

void bootstrap();