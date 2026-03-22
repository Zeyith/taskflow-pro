import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { tasks } from './tasks.schema';
import { users } from './users.schema';

export const taskAssignmentStatusEnum = pgEnum('task_assignment_status', [
  'PENDING',
  'IN_PROGRESS',
  'AWAITING_APPROVAL',
  'WAITING_FOR_CHANGES',
  'COMPLETED',
]);

export const taskAssignees = pgTable(
  'task_assignees',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),

    addedBy: uuid('added_by')
      .notNull()
      .references(() => users.id),

    status: taskAssignmentStatusEnum('status').notNull().default('PENDING'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    taskUserUniqueIdx: uniqueIndex('task_assignees_task_user_unique_idx').on(
      table.taskId,
      table.userId,
    ),
  }),
);

export type TaskAssigneeRow = InferSelectModel<typeof taskAssignees>;
export type NewTaskAssigneeRow = InferInsertModel<typeof taskAssignees>;
