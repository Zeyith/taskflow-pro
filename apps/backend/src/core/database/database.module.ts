import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { AppConfig } from '../../common/configs/app.config';
import * as schema from './schema';

export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    AppConfig,
    {
      provide: DATABASE_CONNECTION,
      inject: [AppConfig],
      useFactory: (appConfig: AppConfig) => {
        const pool = new Pool({
          connectionString: appConfig.database.url,
        });

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
