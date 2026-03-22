import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { jobTitles } from './job-titles.schema';

export const userRoleEnum = pgEnum('user_role', ['TEAM_LEAD', 'EMPLOYEE']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),

  jobTitleId: uuid('job_title_id').references(() => jobTitles.id),

  role: userRoleEnum('role').notNull(),
  isActive: boolean('is_active').notNull().default(true),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export type UserRow = InferSelectModel<typeof users>;
export type NewUserRow = InferInsertModel<typeof users>;
