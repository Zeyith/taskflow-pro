import { Module, forwardRef } from '@nestjs/common';

import { TasksModule } from '../tasks/tasks.module';
import { ProjectsController } from './projects.controller';
import { ProjectMemberRepository } from './repositories/project-member.repository';
import { ProjectRepository } from './repositories/project.repository';
import { PROJECT_MEMBER_REPOSITORY } from './repositories/interfaces/project-member.repository.interface';
import { PROJECT_REPOSITORY } from './repositories/interfaces/project.repository.interface';
import { ProjectsService } from './projects.service';

@Module({
  imports: [forwardRef(() => TasksModule)],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectRepository,
    ProjectMemberRepository,
    {
      provide: PROJECT_REPOSITORY,
      useExisting: ProjectRepository,
    },
    {
      provide: PROJECT_MEMBER_REPOSITORY,
      useExisting: ProjectMemberRepository,
    },
  ],
  exports: [ProjectsService, PROJECT_REPOSITORY, PROJECT_MEMBER_REPOSITORY],
})
export class ProjectsModule {}