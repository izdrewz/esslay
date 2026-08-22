import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import {
  activityEvents,
  archiveArtifacts,
  archiveBundles,
  assignments,
  drafts,
  evidenceSpans,
  feedbackNotes,
  sourceDocuments,
  sourcePages,
} from "../../../db/schema";
import { ownerIdForRequest } from "../../../lib/server/auth";
import { apiError } from "../../../lib/server/http";
import type {
  ArchiveRole,
  FeedbackCategory,
  FeedbackTone,
  QuestionBreakdown,
  RoomId,
  WorkspacePayload,
} from "../../../lib/types";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };
const ROOMS: RoomId[] = ["archive", "question", "sources", "draft", "review"];
const ARCHIVE_ROLES: ArchiveRole[] = [
  "question",
  "plan",
  "draft",
  "submission",
  "revision",
  "feedback",
  "source",
  "other",
];
const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  "task_focus",
  "analysis",
  "evidence",
  "structure",
  "writing",
  "referencing",
  "reflection",
  "other",
];
const FEEDBACK_TONES: FeedbackTone[] = ["strength", "improve", "neutral"];

export async function GET(request: Request) {
  try {
    const ownerId = ownerIdForRequest(request);
    return Response.json({ workspace: await loadWorkspace(ownerId) });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ownerId = ownerIdForRequest(request);
    const payload = (await request.json()) as Record<string, unknown>;
    const action = stringValue(payload.action);
    const db = getDb();

    switch (action) {
      case "createAssignment": {
        const id = crypto.randomUUID();
        const question = stringValue(payload.question).trim();
        const title =
          stringValue(payload.title).trim() ||
          (question ? question.slice(0, 72) : "Untitled exam run");
        const breakdown = questionBreakdown(payload.breakdown);
        const draftId = crypto.randomUUID();

        await db.insert(assignments).values({
          id,
          ownerId,
          title,
          question,
          breakdownJson: JSON.stringify(breakdown),
        });
        await db.insert(drafts).values({
          id: draftId,
          ownerId,
          assignmentId: id,
          contentJson: JSON.stringify(EMPTY_DOC),
        });
        break;
      }

      case "updateAssignment": {
        const assignmentId = stringValue(payload.assignmentId);
        await requireAssignment(ownerId, assignmentId);
        const updates: {
          title?: string;
          question?: string;
          breakdownJson?: string;
          breakdownConfirmedAt?: string | null;
          activeRoom?: string;
          updatedAt: string;
        } = { updatedAt: new Date().toISOString() };

        if (typeof payload.title === "string") updates.title = payload.title.trim();
        if (typeof payload.question === "string") updates.question = payload.question;
        if (payload.breakdown !== undefined) {
          updates.breakdownJson = JSON.stringify(questionBreakdown(payload.breakdown));
        }
        if (typeof payload.breakdownConfirmed === "boolean") {
          updates.breakdownConfirmedAt = payload.breakdownConfirmed
            ? new Date().toISOString()
            : null;
          if (payload.breakdownConfirmed) {
            await logEvent(ownerId, assignmentId, "question_map_confirmed", {});
          }
        }
        if (typeof payload.activeRoom === "string" && ROOMS.includes(payload.activeRoom as RoomId)) {
          updates.activeRoom = payload.activeRoom;
        }

        await db
          .update(assignments)
          .set(updates)
          .where(and(eq(assignments.id, assignmentId), eq(assignments.ownerId, ownerId)));
        break;
      }

      case "saveDraft": {
        const assignmentId = stringValue(payload.assignmentId);
        await requireAssignment(ownerId, assignmentId);
        const contentJson = recordValue(payload.contentJson);
        const plainText = stringValue(payload.plainText);
        const [existing] = await db
          .select({ id: drafts.id })
          .from(drafts)
          .where(and(eq(drafts.assignmentId, assignmentId), eq(drafts.ownerId, ownerId)))
          .limit(1);

        if (existing) {
          await db
            .update(drafts)
            .set({
              contentJson: JSON.stringify(contentJson),
              plainText,
              updatedAt: sql`CURRENT_TIMESTAMP`,
            })
            .where(eq(drafts.id, existing.id));
        } else {
          await db.insert(drafts).values({
            id: crypto.randomUUID(),
            ownerId,
            assignmentId,
            contentJson: JSON.stringify(contentJson),
            plainText,
          });
        }
        break;
      }

      case "createEvidence": {
        const assignmentId = stringValue(payload.assignmentId);
        const documentId = stringValue(payload.documentId);
        const pageNumber = integerValue(payload.pageNumber);
        const startOffset = integerValue(payload.startOffset);
        const endOffset = integerValue(payload.endOffset);
        const quote = stringValue(payload.quote);
        const note = stringValue(payload.note).trim();
        await requireAssignment(ownerId, assignmentId);

        const [source] = await db
          .select({ assignmentId: sourceDocuments.assignmentId })
          .from(sourceDocuments)
          .where(
            and(
              eq(sourceDocuments.id, documentId),
              eq(sourceDocuments.ownerId, ownerId),
            ),
          )
          .limit(1);
        if (!source || source.assignmentId !== assignmentId) {
          return Response.json({ error: "Source not found for this assignment." }, { status: 404 });
        }

        const [page] = await db
          .select({ textContent: sourcePages.textContent })
          .from(sourcePages)
          .where(
            and(
              eq(sourcePages.ownerId, ownerId),
              eq(sourcePages.documentId, documentId),
              eq(sourcePages.pageNumber, pageNumber),
            ),
          )
          .limit(1);
        if (!page) {
          return Response.json({ error: "Source page not found." }, { status: 404 });
        }
        if (
          startOffset < 0 ||
          endOffset <= startOffset ||
          endOffset > page.textContent.length ||
          page.textContent.slice(startOffset, endOffset) !== quote
        ) {
          return Response.json(
            { error: "That passage no longer matches the stored source page. Select it again." },
            { status: 400 },
          );
        }

        const evidenceId = crypto.randomUUID();
        await db.insert(evidenceSpans).values({
          id: evidenceId,
          ownerId,
          assignmentId,
          documentId,
          pageNumber,
          startOffset,
          endOffset,
          quote,
          note,
        });
        await logEvent(ownerId, assignmentId, "evidence_saved", {
          evidenceId,
          documentId,
          pageNumber,
        });
        break;
      }

      case "deleteEvidence": {
        const evidenceId = stringValue(payload.evidenceId);
        await db
          .delete(evidenceSpans)
          .where(and(eq(evidenceSpans.id, evidenceId), eq(evidenceSpans.ownerId, ownerId)));
        break;
      }

      case "logDraftLink": {
        const assignmentId = stringValue(payload.assignmentId);
        await requireAssignment(ownerId, assignmentId);
        await logEvent(ownerId, assignmentId, "draft_evidence_linked", {
          evidenceId: stringValue(payload.evidenceId),
        });
        break;
      }

      default:
        return Response.json({ error: "Unknown workspace action." }, { status: 400 });
    }

    return Response.json({ workspace: await loadWorkspace(ownerId) });
  } catch (error) {
    return apiError(error);
  }
}

async function loadWorkspace(ownerId: string): Promise<WorkspacePayload> {
  const db = getDb();
  const [
    assignmentRows,
    sourceRows,
    evidenceRows,
    draftRows,
    archiveBundleRows,
    archiveArtifactRows,
    feedbackRows,
  ] = await Promise.all([
    db
      .select()
      .from(assignments)
      .where(eq(assignments.ownerId, ownerId))
      .orderBy(desc(assignments.updatedAt)),
    db
      .select()
      .from(sourceDocuments)
      .where(eq(sourceDocuments.ownerId, ownerId))
      .orderBy(desc(sourceDocuments.createdAt)),
    db
      .select()
      .from(evidenceSpans)
      .where(eq(evidenceSpans.ownerId, ownerId))
      .orderBy(desc(evidenceSpans.createdAt)),
    db
      .select()
      .from(drafts)
      .where(eq(drafts.ownerId, ownerId))
      .orderBy(desc(drafts.updatedAt)),
    db
      .select()
      .from(archiveBundles)
      .where(eq(archiveBundles.ownerId, ownerId))
      .orderBy(desc(archiveBundles.updatedAt)),
    db
      .select()
      .from(archiveArtifacts)
      .where(eq(archiveArtifacts.ownerId, ownerId))
      .orderBy(desc(archiveArtifacts.createdAt)),
    db
      .select()
      .from(feedbackNotes)
      .where(eq(feedbackNotes.ownerId, ownerId))
      .orderBy(desc(feedbackNotes.createdAt)),
  ]);

  return {
    assignments: assignmentRows.map((row) => ({
      id: row.id,
      title: row.title,
      question: row.question,
      breakdown: parseBreakdown(row.breakdownJson),
      breakdownConfirmedAt: row.breakdownConfirmedAt,
      activeRoom: ROOMS.includes(row.activeRoom as RoomId)
        ? (row.activeRoom as RoomId)
        : "question",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    sources: sourceRows.map((row) => ({
      id: row.id,
      assignmentId: row.assignmentId,
      filename: row.filename,
      contentType: row.contentType,
      byteSize: row.byteSize,
      pageCount: row.pageCount,
      createdAt: row.createdAt,
    })),
    evidence: evidenceRows.map((row) => ({
      id: row.id,
      assignmentId: row.assignmentId,
      documentId: row.documentId,
      pageNumber: row.pageNumber,
      startOffset: row.startOffset,
      endOffset: row.endOffset,
      quote: row.quote,
      note: row.note,
      createdAt: row.createdAt,
    })),
    drafts: draftRows.map((row) => ({
      id: row.id,
      assignmentId: row.assignmentId,
      contentJson: parseObject(row.contentJson, EMPTY_DOC),
      plainText: row.plainText,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    archiveBundles: archiveBundleRows.map((row) => ({
      id: row.id,
      title: row.title,
      moduleCode: row.moduleCode,
      assessmentCode: row.assessmentCode,
      score: row.score,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
    archiveArtifacts: archiveArtifactRows.map((row) => ({
      id: row.id,
      bundleId: row.bundleId,
      role: ARCHIVE_ROLES.includes(row.role as ArchiveRole)
        ? (row.role as ArchiveRole)
        : "other",
      filename: row.filename,
      contentType: row.contentType,
      byteSize: row.byteSize,
      pageCount: row.pageCount,
      commentCount: row.commentCount,
      createdAt: row.createdAt,
    })),
    feedbackNotes: feedbackRows.map((row) => ({
      id: row.id,
      bundleId: row.bundleId,
      artifactId: row.artifactId,
      anchorText: row.anchorText,
      commentText: row.commentText,
      category: FEEDBACK_CATEGORIES.includes(row.category as FeedbackCategory)
        ? (row.category as FeedbackCategory)
        : "other",
      tone: FEEDBACK_TONES.includes(row.tone as FeedbackTone)
        ? (row.tone as FeedbackTone)
        : "neutral",
      locationLabel: row.locationLabel,
      createdAt: row.createdAt,
    })),
  };
}

async function requireAssignment(ownerId: string, assignmentId: string) {
  const db = getDb();
  const [assignment] = await db
    .select({ id: assignments.id })
    .from(assignments)
    .where(and(eq(assignments.id, assignmentId), eq(assignments.ownerId, ownerId)))
    .limit(1);
  if (!assignment) throw new Error("Assignment not found.");
  return assignment;
}

async function logEvent(
  ownerId: string,
  assignmentId: string,
  eventType: string,
  payload: Record<string, unknown>,
) {
  await getDb().insert(activityEvents).values({
    id: crypto.randomUUID(),
    ownerId,
    assignmentId,
    eventType,
    payloadJson: JSON.stringify(payload),
  });
}

function parseBreakdown(value: string): QuestionBreakdown {
  return questionBreakdown(parseObject(value, {}));
}

function questionBreakdown(value: unknown): QuestionBreakdown {
  const item = recordValue(value);
  return {
    command: stringValue(item.command),
    subject: stringValue(item.subject),
    focus: stringValue(item.focus),
    output: stringValue(item.output),
    constraints: stringArray(item.constraints),
    evidenceNeeds: stringArray(item.evidenceNeeds),
  };
}

function parseObject(value: string, fallback: Record<string, unknown>) {
  try {
    return recordValue(JSON.parse(value));
  } catch {
    return fallback;
  }
}

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function integerValue(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : -1;
}
