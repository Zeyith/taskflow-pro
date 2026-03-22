import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.schema';
import {
  taskAssignees,
  taskAssignmentStatusEnum,
} from './task-assignees.schema';
import { tasks } from './tasks.schema';

export const taskStatusHistory = pgTable('task_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),

  taskId: uuid('task_id')
    .notNull()
    .references(() => tasks.id),

  taskAssigneeId: uuid('task_assignee_id')
    .notNull()
    .references(() => taskAssignees.id),

  oldStatus: taskAssignmentStatusEnum('old_status').notNull(),
  newStatus: taskAssignmentStatusEnum('new_status').notNull(),

  changedBy: uuid('changed_by')
    .notNull()
    .references(() => users.id),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type TaskStatusHistoryRow = InferSelectModel<typeof taskStatusHistory>;
export type NewTaskStatusHistoryRow = InferInsertModel<
  typeof taskStatusHistory
>;
