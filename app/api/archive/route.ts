import { env } from "cloudflare:workers";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import {
  archiveArtifacts,
  archiveBundles,
  archiveSections,
  feedbackNotes,
} from "../../../db/schema";
import { ownerIdForRequest } from "../../../lib/server/auth";
import { apiError } from "../../../lib/server/http";
import type {
  ArchiveRole,
  FeedbackCategory,
  FeedbackTone,
} from "../../../lib/types";

const MAX_FILE_SIZE = 35 * 1024 * 1024;
const MAX_TOTAL_SIZE = 55 * 1024 * 1024;
const MAX_TEXT_SIZE = 12_000_000;
const MAX_ARTIFACTS = 24;
const MAX_SECTIONS = 500;
const MAX_FEEDBACK = 500;

const ROLES: ArchiveRole[] = [
  "question",
  "plan",
  "draft",
  "submission",
  "revision",
  "feedback",
  "source",
  "other",
];
const CATEGORIES: FeedbackCategory[] = [
  "task_focus",
  "analysis",
  "evidence",
  "structure",
  "writing",
  "referencing",
  "reflection",
  "other",
];
const TONES: FeedbackTone[] = ["strength", "improve", "neutral"];

type IncomingSection = { pageNumber: number | null; textContent: string };
type IncomingFeedback = {
  anchorText: string;
  commentText: string;
  category: FeedbackCategory;
  tone: FeedbackTone;
  locationLabel: string;
};
type IncomingArtifact = {
  fileField: string;
  filename: string;
  contentType: string;
  role: ArchiveRole;
  sections: IncomingSection[];
  feedback: IncomingFeedback[];
};

export async function GET(request: Request) {
  try {
    const ownerId = ownerIdForRequest(request);
    const url = new URL(request.url);
    const artifactId = url.searchParams.get("artifactId") ?? "";
    const mode = url.searchParams.get("mode");
    const db = getDb();
    const [artifact] = await db
      .select()
      .from(archiveArtifacts)
      .where(
        and(eq(archiveArtifacts.id, artifactId), eq(archiveArtifacts.ownerId, ownerId)),
      )
      .limit(1);
    if (!artifact) return Response.json({ error: "Archive item not found." }, { status: 404 });

    if (mode === "file") {
      const object = await env.BUCKET.get(artifact.storageKey);
      if (!object) return Response.json({ error: "Original file not found." }, { status: 404 });
      return new Response(object.body, {
        headers: {
          "content-type": artifact.contentType,
          "content-length": String(artifact.byteSize),
          "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(artifact.filename)}`,
          "cache-control": "private, max-age=300",
        },
      });
    }

    const sections = await db
      .select({
        artifactId: archiveSections.artifactId,
        sectionNumber: archiveSections.sectionNumber,
        pageNumber: archiveSections.pageNumber,
        textContent: archiveSections.textContent,
      })
      .from(archiveSections)
      .where(
        and(
          eq(archiveSections.artifactId, artifactId),
          eq(archiveSections.ownerId, ownerId),
        ),
      )
      .orderBy(asc(archiveSections.sectionNumber));

    return Response.json({
      artifact: {
        id: artifact.id,
        bundleId: artifact.bundleId,
        role: artifact.role,
        filename: artifact.filename,
        contentType: artifact.contentType,
        byteSize: artifact.byteSize,
        pageCount: artifact.pageCount,
        commentCount: artifact.commentCount,
        createdAt: artifact.createdAt,
      },
      sections,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  let bundleId = "";
  const storedKeys: string[] = [];
  try {
    const ownerId = ownerIdForRequest(request);
    const data = await request.formData();
    const bundle = recordValue(parseJson(stringValue(data.get("bundle"))));
    const manifest = parseManifest(stringValue(data.get("manifest")));
    if (!manifest.length || manifest.length > MAX_ARTIFACTS) {
      return Response.json(
        { error: `An archive import must contain 1 to ${MAX_ARTIFACTS} supported files.` },
        { status: 400 },
      );
    }

    const files = manifest.map((item) => data.get(item.fileField));
    if (files.some((file) => !(file instanceof File))) {
      return Response.json({ error: "One or more original files are missing." }, { status: 400 });
    }
    const typedFiles = files as File[];
    const totalBytes = typedFiles.reduce((total, file) => total + file.size, 0);
    if (
      typedFiles.some((file) => file.size <= 0 || file.size > MAX_FILE_SIZE) ||
      totalBytes > MAX_TOTAL_SIZE
    ) {
      return Response.json(
        { error: "Each file must be under 35 MB and each import under 55 MB." },
        { status: 400 },
      );
    }

    const totalText = manifest.reduce(
      (total, artifact) =>
        total + artifact.sections.reduce((sum, section) => sum + section.textContent.length, 0),
      0,
    );
    const totalFeedback = manifest.reduce(
      (total, artifact) => total + artifact.feedback.length,
      0,
    );
    if (totalText > MAX_TEXT_SIZE || totalFeedback > MAX_FEEDBACK) {
      return Response.json({ error: "This import contains too much extracted text." }, { status: 400 });
    }

    bundleId = crypto.randomUUID();
    const db = getDb();
    const score = nullableScore(bundle.score);
    await db.insert(archiveBundles).values({
      id: bundleId,
      ownerId,
      title: clippedString(bundle.title, 140) || "Imported study set",
      moduleCode: clippedString(bundle.moduleCode, 20).toUpperCase(),
      assessmentCode: clippedString(bundle.assessmentCode, 20),
      score,
    });

    for (let index = 0; index < manifest.length; index += 1) {
      const item = manifest[index];
      const file = typedFiles[index];
      const artifactId = crypto.randomUUID();
      const extension = safeExtension(file.name);
      const storageKey = `archive/${bundleId}/${artifactId}/original${extension}`;
      storedKeys.push(storageKey);
      const contentType = clippedString(item.contentType || file.type, 160) || "application/octet-stream";
      await env.BUCKET.put(storageKey, file.stream(), {
        httpMetadata: { contentType },
        customMetadata: { originalFilename: file.name.slice(0, 240) },
      });

      await db.insert(archiveArtifacts).values({
        id: artifactId,
        ownerId,
        bundleId,
        role: ROLES.includes(item.role) ? item.role : "other",
        filename: clippedString(item.filename || file.name, 240) || "Imported file",
        contentType,
        byteSize: file.size,
        pageCount: Math.max(1, item.sections.filter((section) => section.pageNumber).length),
        commentCount: item.feedback.length,
        storageKey,
      });

      for (let sectionIndex = 0; sectionIndex < item.sections.length; sectionIndex += 25) {
        const rows = item.sections.slice(sectionIndex, sectionIndex + 25).map((section, offset) => ({
          id: `${artifactId}:${sectionIndex + offset + 1}`,
          ownerId,
          artifactId,
          sectionNumber: sectionIndex + offset + 1,
          pageNumber: section.pageNumber,
          textContent: section.textContent,
        }));
        if (rows.length) await db.insert(archiveSections).values(rows);
      }

      for (let feedbackIndex = 0; feedbackIndex < item.feedback.length; feedbackIndex += 40) {
        const rows = item.feedback.slice(feedbackIndex, feedbackIndex + 40).map((note) => ({
          id: crypto.randomUUID(),
          ownerId,
          bundleId,
          artifactId,
          anchorText: note.anchorText.slice(0, 4000),
          commentText: note.commentText.slice(0, 6000),
          category: CATEGORIES.includes(note.category) ? note.category : "other",
          tone: TONES.includes(note.tone) ? note.tone : "neutral",
          locationLabel: note.locationLabel.slice(0, 240),
        }));
        if (rows.length) await db.insert(feedbackNotes).values(rows);
      }
    }

    return Response.json({ ok: true, bundleId }, { status: 201 });
  } catch (error) {
    if (bundleId) {
      try {
        await getDb().delete(archiveBundles).where(eq(archiveBundles.id, bundleId));
      } catch {
        // Cleanup is best effort; the original import error remains authoritative.
      }
    }
    for (const key of storedKeys) {
      try {
        await env.BUCKET.delete(key);
      } catch {
        // An orphaned private object is safer than hiding the original error.
      }
    }
    return apiError(error);
  }
}

function parseManifest(value: string): IncomingArtifact[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((value) => {
      const item = recordValue(value);
      const rawSections = Array.isArray(item.sections) ? item.sections : [];
      const sections = rawSections
        .slice(0, MAX_SECTIONS)
        .map((value) => {
          const section = recordValue(value);
          const pageNumber =
            typeof section.pageNumber === "number" && Number.isInteger(section.pageNumber)
              ? section.pageNumber
              : null;
          return {
            pageNumber: pageNumber && pageNumber > 0 ? pageNumber : null,
            textContent: stringValue(section.textContent),
          };
        })
        .filter((section) => section.textContent.length > 0);
      const rawFeedback = Array.isArray(item.feedback) ? item.feedback : [];
      const feedback = rawFeedback.map((value) => {
        const note = recordValue(value);
        const category = stringValue(note.category) as FeedbackCategory;
        const tone = stringValue(note.tone) as FeedbackTone;
        return {
          anchorText: stringValue(note.anchorText),
          commentText: stringValue(note.commentText),
          category: CATEGORIES.includes(category) ? category : "other",
          tone: TONES.includes(tone) ? tone : "neutral",
          locationLabel: stringValue(note.locationLabel),
        };
      }).filter((note) => note.commentText.trim());
      const role = stringValue(item.role) as ArchiveRole;
      return {
        fileField: stringValue(item.fileField),
        filename: stringValue(item.filename),
        contentType: stringValue(item.contentType),
        role: ROLES.includes(role) ? role : "other",
        sections,
        feedback,
      };
    })
    .filter((item) => item.fileField && item.sections.length);
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
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

function clippedString(value: unknown, length: number) {
  return stringValue(value).trim().slice(0, length);
}

function nullableScore(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100
    ? value
    : null;
}

function safeExtension(filename: string) {
  const match = filename.toLowerCase().match(/\.(pdf|docx|html|htm)$/);
  return match ? `.${match[1]}` : "";
}
