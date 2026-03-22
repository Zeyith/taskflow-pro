import { Module } from '@nestjs/common';

import { JobTitlesModule } from '../job-titles/job-titles.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from './repositories/user.repository';
import { USER_REPOSITORY } from './repositories/interfaces/user.repository.interface';

@Module({
  imports: [JobTitlesModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: UserRepository,
    },
  ],
  exports: [USER_REPOSITORY, UsersService],
})
export class UsersModule {}
