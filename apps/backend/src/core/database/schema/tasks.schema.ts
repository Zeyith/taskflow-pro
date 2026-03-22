import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { users } from './users.schema';

export const taskSummaryStatusEnum = pgEnum('task_summary_status', [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
]);

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),

  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id),
 
  title: text('title').notNull(),
  description: text('description'),

  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),

  summaryStatus: taskSummaryStatusEnum('summary_status')
    .notNull()
    .default('PENDING'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type TaskRow = InferSelectModel<typeof tasks>;
export type NewTaskRow = InferInsertModel<typeof tasks>;
