import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { projects } from './projects.schema';
import { users } from './users.schema';

export const incidentRooms = pgTable(
  'incident_rooms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    severity: varchar('severity', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    projectIdIdx: index('incident_rooms_project_id_idx').on(table.projectId),
    statusIdx: index('incident_rooms_status_idx').on(table.status),
    severityIdx: index('incident_rooms_severity_idx').on(table.severity),
    deletedAtIdx: index('incident_rooms_deleted_at_idx').on(table.deletedAt),
  }),
);

export type IncidentRoomRow = typeof incidentRooms.$inferSelect;
export type NewIncidentRoomRow = typeof incidentRooms.$inferInsert;
