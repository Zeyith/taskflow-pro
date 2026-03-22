import { Inject, Injectable } from '@nestjs/common';

import {
  JOB_TITLE_REPOSITORY,
  type IJobTitleRepository,
} from './repositories/interfaces/job-title.repository.interface';

@Injectable()
export class JobTitlesService {
  constructor(
    @Inject(JOB_TITLE_REPOSITORY)
    private readonly jobTitleRepository: IJobTitleRepository,
  ) {}

  async findAll() {
    const jobTitles = await this.jobTitleRepository.findAll();

    return jobTitles.map((jobTitle) => ({
      id: jobTitle.id,
      code: jobTitle.code,
      label: jobTitle.label,
      createdAt: jobTitle.createdAt,
      updatedAt: jobTitle.updatedAt,
    }));
  }
}
