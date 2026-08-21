import { env } from "cloudflare:workers";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { assignments, sourceDocuments, sourcePages } from "../../../db/schema";
import { ownerIdForRequest } from "../../../lib/server/auth";
import { apiError } from "../../../lib/server/http";

const MAX_FILE_SIZE = 35 * 1024 * 1024;
const MAX_PAGES = 500;
const MAX_TEXT_SIZE = 6_000_000;

type IncomingPage = { pageNumber: number; textContent: string };

export async function GET(request: Request) {
  try {
    const ownerId = ownerIdForRequest(request);
    const url = new URL(request.url);
    const documentId = url.searchParams.get("documentId") ?? "";
    const mode = url.searchParams.get("mode");
    const db = getDb();

    const [document] = await db
      .select()
      .from(sourceDocuments)
      .where(
        and(
          eq(sourceDocuments.id, documentId),
          eq(sourceDocuments.ownerId, ownerId),
        ),
      )
      .limit(1);
    if (!document) {
      return Response.json({ error: "Source not found." }, { status: 404 });
    }

    if (mode === "file") {
      const object = await env.BUCKET.get(document.storageKey);
      if (!object) return Response.json({ error: "Source file not found." }, { status: 404 });
      return new Response(object.body, {
        headers: {
          "content-type": document.contentType,
          "content-length": String(document.byteSize),
          "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(document.filename)}`,
          "cache-control": "private, max-age=300",
        },
      });
    }

    const pageNumber = Number(url.searchParams.get("page") ?? "1");
    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return Response.json({ error: "A valid page number is required." }, { status: 400 });
    }
    const [page] = await db
      .select({
        documentId: sourcePages.documentId,
        pageNumber: sourcePages.pageNumber,
        textContent: sourcePages.textContent,
      })
      .from(sourcePages)
      .where(
        and(
          eq(sourcePages.ownerId, ownerId),
          eq(sourcePages.documentId, documentId),
          eq(sourcePages.pageNumber, pageNumber),
        ),
      )
      .limit(1);
    if (!page) return Response.json({ error: "Page not found." }, { status: 404 });

    return Response.json({ page });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  let storedKey = "";
  let storedDocumentId = "";
  try {
    const ownerId = ownerIdForRequest(request);
    const data = await request.formData();
    const file = data.get("file");
    const assignmentId = stringValue(data.get("assignmentId"));
    const pages = parsePages(stringValue(data.get("pages")));

    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a PDF to upload." }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return Response.json({ error: "Only PDF sources are supported in this build." }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "PDFs must be smaller than 35 MB." }, { status: 400 });
    }
    if (!pages.length || pages.length > MAX_PAGES) {
      return Response.json({ error: "The extracted page list is invalid." }, { status: 400 });
    }
    if (pages.reduce((total, page) => total + page.textContent.length, 0) > MAX_TEXT_SIZE) {
      return Response.json({ error: "The PDF contains too much extracted text." }, { status: 400 });
    }

    const db = getDb();
    const [assignment] = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(and(eq(assignments.id, assignmentId), eq(assignments.ownerId, ownerId)))
      .limit(1);
    if (!assignment) {
      return Response.json({ error: "Assignment not found." }, { status: 404 });
    }

    const documentId = crypto.randomUUID();
    storedDocumentId = documentId;
    storedKey = `sources/${documentId}/original.pdf`;
    await env.BUCKET.put(storedKey, file.stream(), {
      httpMetadata: { contentType: "application/pdf" },
      customMetadata: { originalFilename: file.name.slice(0, 240) },
    });

    await db.insert(sourceDocuments).values({
      id: documentId,
      ownerId,
      assignmentId,
      filename: file.name.slice(0, 240),
      contentType: "application/pdf",
      byteSize: file.size,
      pageCount: pages.length,
      storageKey: storedKey,
    });

    for (let index = 0; index < pages.length; index += 20) {
      const batch = pages.slice(index, index + 20).map((page) => ({
        id: `${documentId}:${page.pageNumber}`,
        ownerId,
        documentId,
        pageNumber: page.pageNumber,
        textContent: page.textContent,
      }));
      await db.insert(sourcePages).values(batch);
    }

    return Response.json(
      {
        source: {
          id: documentId,
          assignmentId,
          filename: file.name.slice(0, 240),
          contentType: "application/pdf",
          byteSize: file.size,
          pageCount: pages.length,
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (storedDocumentId) {
      try {
        await getDb().delete(sourceDocuments).where(eq(sourceDocuments.id, storedDocumentId));
      } catch {
        // Cleanup is best effort; the original request error remains authoritative.
      }
    }
    if (storedKey) {
      try {
        await env.BUCKET.delete(storedKey);
      } catch {
        // Preserve the original error; an orphaned object is safer than hiding it.
      }
    }
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const ownerId = ownerIdForRequest(request);
    const documentId = new URL(request.url).searchParams.get("documentId") ?? "";
    const db = getDb();
    const [document] = await db
      .select({ storageKey: sourceDocuments.storageKey })
      .from(sourceDocuments)
      .where(
        and(
          eq(sourceDocuments.id, documentId),
          eq(sourceDocuments.ownerId, ownerId),
        ),
      )
      .limit(1);
    if (!document) return Response.json({ error: "Source not found." }, { status: 404 });

    await env.BUCKET.delete(document.storageKey);
    await db
      .delete(sourceDocuments)
      .where(
        and(
          eq(sourceDocuments.id, documentId),
          eq(sourceDocuments.ownerId, ownerId),
        ),
      );
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}

function parsePages(value: string): IncomingPage[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const pages = parsed.filter(
    (item): item is IncomingPage =>
      Boolean(item) &&
      typeof item === "object" &&
      Number.isInteger((item as IncomingPage).pageNumber) &&
      (item as IncomingPage).pageNumber > 0 &&
      typeof (item as IncomingPage).textContent === "string",
  );
  if (pages.some((page, index) => page.pageNumber !== index + 1)) return [];
  return pages;
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}
