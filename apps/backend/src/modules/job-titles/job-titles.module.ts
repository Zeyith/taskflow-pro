import { Module } from '@nestjs/common';

import { JobTitlesController } from './job-titles.controller';
import { JobTitlesService } from './job-titles.service';
import { JobTitleRepository } from './repositories/job-title.repository';
import { JOB_TITLE_REPOSITORY } from './repositories/interfaces/job-title.repository.interface';

@Module({
  controllers: [JobTitlesController],
  providers: [
    JobTitlesService,
    JobTitleRepository,
    {
      provide: JOB_TITLE_REPOSITORY,
      useExisting: JobTitleRepository,
    },
  ],
  exports: [JobTitlesService, JOB_TITLE_REPOSITORY],
})
export class JobTitlesModule {}
