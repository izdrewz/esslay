"use client";

import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { fetchSourcePage, workspaceAction } from "../../lib/client-api";
import type {
  EvidenceSpan,
  SourceDocument,
  SourcePage,
  WorkspacePayload,
} from "../../lib/types";

type Props = {
  assignmentId: string;
  sources: SourceDocument[];
  evidence: EvidenceSpan[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (evidenceId: string) => void;
  onWorkspaceChange: (workspace: WorkspacePayload) => void;
  onReload: () => Promise<void>;
};

type SelectionRange = { start: number; end: number; quote: string };

export function SourceRoom({
  assignmentId,
  sources,
  evidence,
  selectedEvidenceId,
  onSelectEvidence,
  onWorkspaceChange,
  onReload,
}: Props) {
  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId) ?? null;
  const [documentId, setDocumentId] = useState(
    selectedEvidence?.documentId ?? sources[0]?.id ?? "",
  );
  const [pageNumber, setPageNumber] = useState(selectedEvidence?.pageNumber ?? 1);
  const [page, setPage] = useState<SourcePage | null>(null);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transcriptRef = useRef<HTMLTextAreaElement | null>(null);

  const currentDocument = sources.find((item) => item.id === documentId) ?? null;

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;
    fetchSourcePage(documentId, pageNumber)
      .then((nextPage) => {
        if (!cancelled) setPage(nextPage);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(errorMessage(reason));
      });
    return () => {
      cancelled = true;
    };
  }, [documentId, pageNumber]);

  useEffect(() => {
    if (!page || !selection || !transcriptRef.current) return;
    if (selection.end > page.textContent.length) return;
    transcriptRef.current.setSelectionRange(selection.start, selection.end);
  }, [page, selection]);

  useEffect(() => {
    if (!documentId || !canvasRef.current) return;
    let cancelled = false;
    let renderTask: RenderTask | null = null;
    let pdfDocument: PDFDocumentProxy | null = null;

    async function renderPage() {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      const loadingTask = pdfjs.getDocument({
        url: `/api/sources?documentId=${encodeURIComponent(documentId)}&mode=file`,
      });
      pdfDocument = await loadingTask.promise;
      const pdfPage = await pdfDocument.getPage(pageNumber);
      if (cancelled || !canvasRef.current) return;
      const viewport = pdfPage.getViewport({ scale: 1.15 });
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = Math.floor(viewport.width * ratio);
      canvas.height = Math.floor(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      renderTask = pdfPage.render({
        canvas,
        canvasContext: context,
        viewport,
        transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0],
      });
      await renderTask.promise;
    }

    renderPage().catch((reason: unknown) => {
      if (!cancelled && (reason as { name?: string }).name !== "RenderingCancelledException") {
        setError(errorMessage(reason));
      }
    });

    return () => {
      cancelled = true;
      renderTask?.cancel();
      void pdfDocument?.destroy();
    };
  }, [documentId, pageNumber]);

  async function uploadPdf(file: File) {
    setError("");
    setBusy("Reading PDF…");
    try {
      const pages = await extractPages(file, (current, total) => {
        setBusy(`Reading page ${current} of ${total}…`);
      });
      setBusy("Saving source…");
      const form = new FormData();
      form.set("assignmentId", assignmentId);
      form.set("file", file);
      form.set("pages", JSON.stringify(pages));
      const response = await fetch("/api/sources", { method: "POST", body: form });
      const result = (await response.json()) as {
        source?: SourceDocument;
        error?: string;
      };
      if (!response.ok || !result.source) {
        throw new Error(result.error || "Could not save the source.");
      }
      setDocumentId(result.source.id);
      setPageNumber(1);
      setSelection(null);
      await onReload();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy("");
    }
  }

  async function saveEvidence() {
    if (!page || !selection || !documentId) {
      setError("Select an exact passage in the page transcript first.");
      return;
    }
    setBusy("Saving evidence…");
    setError("");
    try {
      const before = new Set(evidence.map((item) => item.id));
      const workspace = await workspaceAction({
        action: "createEvidence",
        assignmentId,
        documentId,
        pageNumber,
        startOffset: selection.start,
        endOffset: selection.end,
        quote: selection.quote,
        note,
      });
      onWorkspaceChange(workspace);
      const created = workspace.evidence.find(
        (item) => item.assignmentId === assignmentId && !before.has(item.id),
      );
      if (created) onSelectEvidence(created.id);
      setNote("");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy("");
    }
  }

  function readSelection(target: HTMLTextAreaElement) {
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const quote = target.value.slice(start, end);
    setSelection(quote.trim() ? { start, end, quote } : null);
  }

  function focusEvidence(item: EvidenceSpan) {
    setDocumentId(item.documentId);
    setPageNumber(item.pageNumber);
    setSelection({
      start: item.startOffset,
      end: item.endOffset,
      quote: item.quote,
    });
    onSelectEvidence(item.id);
  }

  return (
    <section className="room-grid source-room" aria-labelledby="source-room-title">
      <div className="room-main">
        <div className="room-heading">
          <div>
            <p className="eyebrow">Room 2</p>
            <h2 id="source-room-title">Source mine</h2>
            <p>Select words from the extracted page. Esslay keeps the PDF, page, and exact character range together.</p>
          </div>
          <label className={busy ? "upload-button is-disabled" : "upload-button"}>
            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={Boolean(busy)}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPdf(file);
                event.currentTarget.value = "";
              }}
            />
            {busy || "Upload PDF"}
          </label>
        </div>

        {!sources.length ? (
          <div className="empty-room">
            <div className="empty-icon" aria-hidden="true">▧</div>
            <h3>Add the first source</h3>
            <p>Upload a text-based PDF. Scanned PDFs will need OCR in a later build.</p>
          </div>
        ) : (
          <>
            <div className="source-controls">
              <label>
                Source
                <select
                  value={documentId}
                  onChange={(event) => {
                    setDocumentId(event.target.value);
                    setPageNumber(1);
                    setSelection(null);
                  }}
                >
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>{source.filename}</option>
                  ))}
                </select>
              </label>
              <div className="page-stepper" aria-label="PDF page">
                <button
                  type="button"
                  onClick={() => setPageNumber((value) => Math.max(1, value - 1))}
                  disabled={pageNumber <= 1}
                  aria-label="Previous page"
                >
                  ←
                </button>
                <span>Page {pageNumber} / {currentDocument?.pageCount ?? 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPageNumber((value) => Math.min(currentDocument?.pageCount ?? value, value + 1))
                  }
                  disabled={pageNumber >= (currentDocument?.pageCount ?? 1)}
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </div>

            <div className="pdf-stage">
              <canvas ref={canvasRef} aria-label={`PDF page ${pageNumber}`} />
            </div>

            <div className="transcript-card">
              <div className="transcript-heading">
                <div>
                  <p className="eyebrow">Selectable page text</p>
                  <h3>{selection ? `${selection.quote.length} characters selected` : "Drag across a useful passage"}</h3>
                </div>
                <button type="button" className="primary-button" onClick={saveEvidence} disabled={!selection || Boolean(busy)}>
                  Save evidence
                </button>
              </div>
              <textarea
                ref={transcriptRef}
                className="page-transcript"
                value={page?.textContent ?? "Loading page text…"}
                readOnly
                onSelect={(event) => readSelection(event.currentTarget)}
                aria-label="Extracted PDF page text"
              />
              <label className="field-label">
                Why might this matter? <span>optional</span>
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="e.g. supports the counterargument"
                />
              </label>
            </div>
          </>
        )}
        {error && <p className="error-banner" role="alert">{error}</p>}
      </div>

      <aside className="room-aside">
        <p className="eyebrow">Evidence shelf</p>
        <h3>{evidence.length} saved passage{evidence.length === 1 ? "" : "s"}</h3>
        <div className="evidence-list">
          {evidence.map((item) => {
            const source = sources.find((candidate) => candidate.id === item.documentId);
            return (
              <button
                type="button"
                key={item.id}
                className={item.id === selectedEvidenceId ? "evidence-card is-selected" : "evidence-card"}
                onClick={() => focusEvidence(item)}
              >
                <span className="source-location">{source?.filename ?? "Source"} · p. {item.pageNumber}</span>
                <q>{item.quote}</q>
                {item.note && <span className="evidence-note">{item.note}</span>}
              </button>
            );
          })}
          {!evidence.length && <p className="aside-empty">Saved passages will appear here.</p>}
        </div>
      </aside>
    </section>
  );
}

async function extractPages(
  file: File,
  onProgress: (current: number, total: number) => void,
) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages: IncomingPage[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    onProgress(pageNumber, pdf.numPages);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => {
        if (!("str" in item)) return "";
        return `${item.str}${item.hasEOL ? "\n" : " "}`;
      })
      .join("")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    pages.push({ pageNumber, textContent: text });
  }
  await pdf.destroy();
  return pages;
}

type IncomingPage = { pageNumber: number; textContent: string };

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Something went wrong.";
}
