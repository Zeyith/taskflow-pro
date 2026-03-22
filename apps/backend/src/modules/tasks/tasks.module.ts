import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskAssigneeRepository } from './repositories/task-assignee.repository';
import { TaskRepository } from './repositories/task.repository';
import { TaskStatusHistoryRepository } from './repositories/task-status-history.repository';
import { TASK_ASSIGNEE_REPOSITORY } from './repositories/interfaces/task-assignee.repository.interface';
import { TASK_REPOSITORY } from './repositories/interfaces/task.repository.interface';
import { TASK_STATUS_HISTORY_REPOSITORY } from './repositories/interfaces/task-status-history.repository.interface';

@Module({
  imports: [ProjectsModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    TaskRepository,
    TaskAssigneeRepository,
    TaskStatusHistoryRepository,
    {
      provide: TASK_REPOSITORY,
      useExisting: TaskRepository,
    },
    {
      provide: TASK_ASSIGNEE_REPOSITORY,
      useExisting: TaskAssigneeRepository,
    },
    {
      provide: TASK_STATUS_HISTORY_REPOSITORY,
      useExisting: TaskStatusHistoryRepository,
    },
  ],
  exports: [
    TasksService,
    TASK_REPOSITORY,
    TASK_ASSIGNEE_REPOSITORY,
    TASK_STATUS_HISTORY_REPOSITORY,
  ],
})
export class TasksModule {}
