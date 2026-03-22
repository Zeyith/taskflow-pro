import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { users } from './users.schema';

export const projectMembers = pgTable(
  'project_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),

    addedBy: uuid('added_by')
      .notNull()
      .references(() => users.id),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    projectUserUniqueIdx: uniqueIndex(
      'project_members_project_user_unique_idx',
    ).on(table.projectId, table.userId),
  }),
);

export type ProjectMemberRow = InferSelectModel<typeof projectMembers>;
export type NewProjectMemberRow = InferInsertModel<typeof projectMembers>;
