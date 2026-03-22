import { JobTitle } from '../../entities/job-title.entity';

export const JOB_TITLE_REPOSITORY = Symbol('JOB_TITLE_REPOSITORY');

export interface IJobTitleRepository {
  findAll(): Promise<JobTitle[]>;
  findById(id: string): Promise<JobTitle | null>;
}
