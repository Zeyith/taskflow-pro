import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const jobTitles = pgTable('job_titles', {
  id: uuid('id').defaultRandom().primaryKey(),

  code: text('code').notNull().unique(),
  label: text('label').notNull().unique(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type JobTitleRow = InferSelectModel<typeof jobTitles>;
export type NewJobTitleRow = InferInsertModel<typeof jobTitles>;
