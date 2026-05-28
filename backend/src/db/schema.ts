import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  nimNip: varchar('nim_nip', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'Mahasiswa', 'Dosen', 'Admin IT', 'Teknisi'
  specialty: varchar('specialty', { length: 50 }), // e.g. 'Jaringan', 'Perangkat', 'Software'
  phone: varchar('phone', { length: 20 }),
  telegramChatId: varchar('telegram_chat_id', { length: 50 }),
  telegramRegCode: varchar('telegram_reg_code', { length: 20 }).unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ticketsRequested: many(tickets, { relationName: 'requester' }),
  ticketsAssigned: many(tickets, { relationName: 'assignee' }),
  comments: many(comments),
  auditLogs: many(auditLogs),
}));

// Tickets Table
export const tickets = pgTable('tickets', {
  id: varchar('id', { length: 20 }).primaryKey(), // e.g., '#1001'
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  priority: varchar('priority', { length: 20 }).notNull(), // 'High', 'Medium', 'Low'
  status: varchar('status', { length: 20 }).notNull(), // 'Open', 'In Progress', 'Pending', 'Resolved', 'Closed'
  location: varchar('location', { length: 100 }).notNull(),
  requesterId: uuid('requester_id').references(() => users.id).notNull(),
  assignedToId: uuid('assigned_to_id').references(() => users.id),
  slaDeadline: timestamp('sla_deadline').notNull(),
  isIncident: boolean('is_incident').default(false).notNull(),
  incidentNotes: text('incident_notes'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  requester: one(users, {
    fields: [tickets.requesterId],
    references: [users.id],
    relationName: 'requester'
  }),
  assignee: one(users, {
    fields: [tickets.assignedToId],
    references: [users.id],
    relationName: 'assignee'
  }),
  comments: many(comments),
  auditLogs: many(auditLogs),
}));

// Comments Table
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: varchar('ticket_id', { length: 20 }).references(() => tickets.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, {
    fields: [comments.ticketId],
    references: [tickets.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: varchar('ticket_id', { length: 20 }).references(() => tickets.id).notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  ticket: one(tickets, {
    fields: [auditLogs.ticketId],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
