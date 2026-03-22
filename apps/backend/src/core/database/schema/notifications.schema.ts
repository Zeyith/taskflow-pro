import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { tasks } from './tasks.schema';
import { users } from './users.schema';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),

  recipientUserId: uuid('recipient_user_id')
    .notNull()
    .references(() => users.id),

  projectId: uuid('project_id').references(() => projects.id),

  taskId: uuid('task_id').references(() => tasks.id),

  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),

  isRead: boolean('is_read').notNull().default(false),

  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),

  readAt: timestamp('read_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type NotificationRow = InferSelectModel<typeof notifications>;
export type NewNotificationRow = InferInsertModel<typeof notifications>;
