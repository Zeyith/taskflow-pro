import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),
  description: text('description'),

  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),

  isArchived: boolean('is_archived').notNull().default(false),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type ProjectRow = InferSelectModel<typeof projects>;
export type NewProjectRow = InferInsertModel<typeof projects>;
