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

export const archiveBundles = sqliteTable(
  "archive_bundles",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    title: text("title").notNull(),
    moduleCode: text("module_code").notNull().default(""),
    assessmentCode: text("assessment_code").notNull().default(""),
    score: integer("score"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("archive_bundles_owner_updated_idx").on(table.ownerId, table.updatedAt)],
);

export const archiveArtifacts = sqliteTable(
  "archive_artifacts",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    bundleId: text("bundle_id")
      .notNull()
      .references(() => archiveBundles.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    pageCount: integer("page_count").notNull().default(1),
    commentCount: integer("comment_count").notNull().default(0),
    storageKey: text("storage_key").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("archive_artifacts_owner_bundle_idx").on(table.ownerId, table.bundleId),
  ],
);

export const archiveSections = sqliteTable(
  "archive_sections",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    artifactId: text("artifact_id")
      .notNull()
      .references(() => archiveArtifacts.id, { onDelete: "cascade" }),
    sectionNumber: integer("section_number").notNull(),
    pageNumber: integer("page_number"),
    textContent: text("text_content").notNull().default(""),
  },
  (table) => [
    uniqueIndex("archive_sections_artifact_section_idx").on(
      table.artifactId,
      table.sectionNumber,
    ),
  ],
);

export const feedbackNotes = sqliteTable(
  "feedback_notes",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    bundleId: text("bundle_id")
      .notNull()
      .references(() => archiveBundles.id, { onDelete: "cascade" }),
    artifactId: text("artifact_id")
      .notNull()
      .references(() => archiveArtifacts.id, { onDelete: "cascade" }),
    anchorText: text("anchor_text").notNull().default(""),
    commentText: text("comment_text").notNull(),
    category: text("category").notNull().default("other"),
    tone: text("tone").notNull().default("neutral"),
    locationLabel: text("location_label").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("feedback_notes_owner_bundle_idx").on(table.ownerId, table.bundleId),
    index("feedback_notes_owner_category_idx").on(table.ownerId, table.category),
  ],
);
