import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const assignments = sqliteTable(
  "assignments",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    title: text("title").notNull(),
    question: text("question").notNull().default(""),
    breakdownJson: text("breakdown_json").notNull().default("{}"),
    breakdownConfirmedAt: text("breakdown_confirmed_at"),
    activeRoom: text("active_room").notNull().default("question"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("assignments_owner_updated_idx").on(table.ownerId, table.updatedAt)],
);

export const drafts = sqliteTable(
  "drafts",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    contentJson: text("content_json").notNull(),
    plainText: text("plain_text").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("drafts_owner_assignment_idx").on(table.ownerId, table.assignmentId),
  ],
);

export const sourceDocuments = sqliteTable(
  "source_documents",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    pageCount: integer("page_count").notNull(),
    storageKey: text("storage_key").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("source_documents_owner_assignment_idx").on(
      table.ownerId,
      table.assignmentId,
    ),
  ],
);

export const sourcePages = sqliteTable(
  "source_pages",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    documentId: text("document_id")
      .notNull()
      .references(() => sourceDocuments.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    textContent: text("text_content").notNull().default(""),
  },
  (table) => [
    uniqueIndex("source_pages_document_page_idx").on(
      table.documentId,
      table.pageNumber,
    ),
  ],
);

export const evidenceSpans = sqliteTable(
  "evidence_spans",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    documentId: text("document_id")
      .notNull()
      .references(() => sourceDocuments.id, { onDelete: "cascade" }),
    pageNumber: integer("page_number").notNull(),
    startOffset: integer("start_offset").notNull(),
    endOffset: integer("end_offset").notNull(),
    quote: text("quote").notNull(),
    note: text("note").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("evidence_owner_assignment_idx").on(table.ownerId, table.assignmentId),
  ],
);

export const activityEvents = sqliteTable(
  "activity_events",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    assignmentId: text("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    payloadJson: text("payload_json").notNull().default("{}"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("activity_owner_assignment_idx").on(table.ownerId, table.assignmentId)],
);
