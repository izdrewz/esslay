"use client";

import { useMemo, useState } from "react";
import {
  prepareArchiveBundles,
  type PendingArtifact,
  type PendingBundle,
} from "../../lib/archive-import";
import type {
  ArchiveArtifact,
  ArchiveBundle,
  ArchiveRole,
  ArchiveSection,
  FeedbackCategory,
  FeedbackNote,
} from "../../lib/types";

type Props = {
  bundles: ArchiveBundle[];
  artifacts: ArchiveArtifact[];
  feedback: FeedbackNote[];
  onReload: () => Promise<void>;
};

type ArtifactDetail = {
  artifact: ArchiveArtifact;
  sections: ArchiveSection[];
};

const ROLE_OPTIONS: Array<{ value: ArchiveRole; label: string }> = [
  { value: "question", label: "Question + rubric" },
  { value: "plan", label: "Essay plan" },
  { value: "draft", label: "Draft" },
  { value: "submission", label: "Marked submission" },
  { value: "revision", label: "Later revision" },
  { value: "feedback", label: "Tutor feedback" },
  { value: "source", label: "Source material" },
  { value: "other", label: "Other" },
];

const ROLE_ORDER: ArchiveRole[] = [
  "question",
  "plan",
  "draft",
  "submission",
  "feedback",
  "revision",
  "source",
  "other",
];

export function ArchiveRoom({ bundles, artifacts, feedback, onReload }: Props) {
  const [pending, setPending] = useState<PendingBundle[] | null>(null);
  const [selectedBundleId, setSelectedBundleId] = useState(bundles[0]?.id ?? "");
  const [selectedArtifactId, setSelectedArtifactId] = useState("");
  const [detail, setDetail] = useState<ArtifactDetail | null>(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [showAllFeedback, setShowAllFeedback] = useState(false);

  const activeBundleId = bundles.some((bundle) => bundle.id === selectedBundleId)
    ? selectedBundleId
    : bundles[0]?.id ?? "";
  const selectedBundle = bundles.find((bundle) => bundle.id === activeBundleId) ?? null;
  const selectedArtifacts = useMemo(
    () =>
      artifacts
        .filter((artifact) => artifact.bundleId === activeBundleId)
        .sort((left, right) => ROLE_ORDER.indexOf(left.role) - ROLE_ORDER.indexOf(right.role)),
    [artifacts, activeBundleId],
  );
  const selectedFeedback = feedback.filter((note) => note.bundleId === activeBundleId);
  const improvementCount = feedback.filter((note) => note.tone === "improve").length;

  async function inspectArtifact(artifactId: string) {
    setSelectedArtifactId(artifactId);
    setDetail(null);
    setMessage("");
    try {
      const response = await fetch(
        `/api/archive?artifactId=${encodeURIComponent(artifactId)}`,
        { cache: "no-store" },
      );
      const payload = (await response.json()) as ArtifactDetail & { error?: string };
      if (!response.ok || !payload.artifact) {
        throw new Error(payload.error || "Could not open that archive item.");
      }
      setDetail(payload);
    } catch (reason) {
      setMessage(errorMessage(reason));
    }
  }

  async function readFiles(files: File[]) {
    setMessage("");
    setBusy("Opening your files…");
    try {
      const next = await prepareArchiveBundles(files, setBusy);
      setPending(next);
      setBusy("");
    } catch (reason) {
      setMessage(errorMessage(reason));
      setBusy("");
    }
  }

  async function saveImport() {
    if (!pending?.length) return;
    setMessage("");
    try {
      for (let bundleIndex = 0; bundleIndex < pending.length; bundleIndex += 1) {
        const bundle = pending[bundleIndex];
        if (!bundle.artifacts.length) continue;
        setBusy(`Saving archive set ${bundleIndex + 1} of ${pending.length}…`);
        const form = new FormData();
        form.set(
          "bundle",
          JSON.stringify({
            title: bundle.title,
            moduleCode: bundle.moduleCode,
            assessmentCode: bundle.assessmentCode,
            score: bundle.score,
          }),
        );
        form.set(
          "manifest",
          JSON.stringify(
            bundle.artifacts.map((artifact, artifactIndex) => ({
              fileField: `file-${artifactIndex}`,
              filename: artifact.filename,
              contentType: artifact.contentType,
              role: artifact.role,
              sections: artifact.sections,
              feedback: artifact.feedback,
            })),
          ),
        );
        bundle.artifacts.forEach((artifact, artifactIndex) => {
          form.set(`file-${artifactIndex}`, artifact.file);
        });
        const response = await fetch("/api/archive", { method: "POST", body: form });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error || "Could not save this archive set.");
      }
      setPending(null);
      setBusy("Refreshing feedback memory…");
      await onReload();
      setBusy("");
      setMessage("Archive imported. Originals, extracted text, and exact tutor comments are connected.");
    } catch (reason) {
      setBusy("");
      setMessage(errorMessage(reason));
    }
  }

  if (pending) {
    return (
      <ImportReview
        bundles={pending}
        busy={busy}
        message={message}
        onBundlesChange={setPending}
        onCancel={() => setPending(null)}
        onSave={() => void saveImport()}
      />
    );
  }

  return (
    <section className="archive-room" aria-labelledby="archive-room-title">
      <div className="archive-hero">
        <div>
          <p className="eyebrow">Archive room</p>
          <h2 id="archive-room-title">Teach Esslay from your real work</h2>
          <p>
            Import questions, plans, marked submissions, later revisions, tutor feedback, and sources. Esslay keeps the original wording and records what connects to what.
          </p>
        </div>
        <label className={busy ? "upload-button is-disabled" : "upload-button archive-upload"}>
          <input
            type="file"
            accept=".zip,.docx,.pdf,.htm,.html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/html"
            multiple
            disabled={Boolean(busy)}
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              if (files.length) void readFiles(files);
              event.currentTarget.value = "";
            }}
          />
          {busy || (bundles.length ? "Import more work" : "Choose archive files")}
        </label>
      </div>

      <div className="archive-metrics">
        <Metric value={bundles.length} label="assessment sets" />
        <Metric value={feedback.length} label="exact tutor notes" />
        <Metric value={improvementCount} label="improvement signals" />
      </div>

      {message && <p className="archive-message" role="status">{message}</p>}

      {!bundles.length ? (
        <div className="archive-empty">
          <div className="archive-drop-mark" aria-hidden="true">A</div>
          <h3>Bring the whole trail, not just the final answer</h3>
          <p>
            The importer accepts ZIP bundles, Word files with tutor comments, HTML feedback summaries, and PDFs. It ignores Mac ZIP metadata and shows every detected relationship before saving.
          </p>
          <ul>
            <li>Original files remain unchanged.</li>
            <li>Comments stay linked to the words they were attached to.</li>
            <li>Automatic labels are editable before import.</li>
          </ul>
        </div>
      ) : (
        <div className="archive-layout">
          <aside className="archive-library" aria-label="Imported assessment sets">
            <p className="eyebrow">Assessment sets</p>
            {bundles.map((bundle) => {
              const count = artifacts.filter((artifact) => artifact.bundleId === bundle.id).length;
              return (
                <button
                  type="button"
                  key={bundle.id}
                  className={bundle.id === activeBundleId ? "archive-set is-selected" : "archive-set"}
                  onClick={() => {
                    setSelectedBundleId(bundle.id);
                    setSelectedArtifactId("");
                    setDetail(null);
                    setShowAllFeedback(false);
                  }}
                >
                  <span>{bundle.moduleCode || "Study archive"}</span>
                  <strong>{bundle.title}</strong>
                  <small>{count} file{count === 1 ? "" : "s"}{bundle.score !== null ? ` · ${bundle.score}%` : ""}</small>
                </button>
              );
            })}
          </aside>

          <div className="archive-workbench">
            {selectedBundle && (
              <>
                <div className="archive-set-heading">
                  <div>
                    <p className="eyebrow">Connected trail</p>
                    <h3>{selectedBundle.title}</h3>
                    <p>
                      {[selectedBundle.moduleCode, selectedBundle.assessmentCode && `assessment ${selectedBundle.assessmentCode}`]
                        .filter(Boolean)
                        .join(" · ") || "Imported assessment"}
                    </p>
                  </div>
                  {selectedBundle.score !== null && <div className="score-seal"><strong>{selectedBundle.score}</strong><span>score</span></div>}
                </div>

                <div className="artifact-path" aria-label="Archive relationships">
                  {selectedArtifacts.map((artifact) => (
                    <button
                      type="button"
                      key={artifact.id}
                      className={artifact.id === selectedArtifactId ? "artifact-node is-selected" : "artifact-node"}
                      onClick={() => void inspectArtifact(artifact.id)}
                    >
                      <span>{roleLabel(artifact.role)}</span>
                      <strong>{artifact.filename}</strong>
                      <small>{artifact.commentCount ? `${artifact.commentCount} tutor notes` : fileSummary(artifact)}</small>
                    </button>
                  ))}
                </div>

                {detail && (
                  <ArtifactInspector key={detail.artifact.id} detail={detail} />
                )}

                <div className="memory-heading">
                  <div>
                    <p className="eyebrow">Feedback memory</p>
                    <h3>Exact tutor language, kept in context</h3>
                  </div>
                  <span>{selectedFeedback.length} note{selectedFeedback.length === 1 ? "" : "s"}</span>
                </div>

                {!selectedFeedback.length ? (
                  <p className="archive-inline-empty">No tutor comments were detected in this set.</p>
                ) : (
                  <div className="feedback-memory-grid">
                    {(showAllFeedback ? selectedFeedback : selectedFeedback.slice(0, 8)).map((note) => (
                      <FeedbackCard key={note.id} note={note} artifacts={artifacts} />
                    ))}
                  </div>
                )}
                {selectedFeedback.length > 8 && (
                  <button
                    type="button"
                    className="secondary-button archive-more-button"
                    onClick={() => setShowAllFeedback((value) => !value)}
                  >
                    {showAllFeedback ? "Show fewer notes" : `Show all ${selectedFeedback.length} notes`}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <p className="archive-privacy">
        Esslay does not rewrite imported work. Originals are stored with your account; extracted text is used only to make source and feedback links inspectable.
      </p>
    </section>
  );
}

function ImportReview({
  bundles,
  busy,
  message,
  onBundlesChange,
  onCancel,
  onSave,
}: {
  bundles: PendingBundle[];
  busy: string;
  message: string;
  onBundlesChange: (bundles: PendingBundle[]) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  function updateBundle(bundleKey: string, patch: Partial<PendingBundle>) {
    onBundlesChange(
      bundles.map((bundle) => (bundle.key === bundleKey ? { ...bundle, ...patch } : bundle)),
    );
  }

  function updateArtifact(bundleKey: string, artifactKey: string, role: ArchiveRole) {
    onBundlesChange(
      bundles.map((bundle) =>
        bundle.key === bundleKey
          ? {
              ...bundle,
              artifacts: bundle.artifacts.map((artifact) =>
                artifact.key === artifactKey ? { ...artifact, role } : artifact,
              ),
            }
          : bundle,
      ),
    );
  }

  function moveArtifact(fromKey: string, artifact: PendingArtifact, toKey: string) {
    if (fromKey === toKey) return;
    onBundlesChange(
      bundles.map((bundle) => {
        if (bundle.key === fromKey) {
          return { ...bundle, artifacts: bundle.artifacts.filter((item) => item.key !== artifact.key) };
        }
        if (bundle.key === toKey) return { ...bundle, artifacts: [...bundle.artifacts, artifact] };
        return bundle;
      }),
    );
  }

  return (
    <section className="import-review" aria-labelledby="import-review-title">
      <div className="room-heading import-review-heading">
        <div>
          <p className="eyebrow">Import check</p>
          <h2 id="import-review-title">Confirm the archive map</h2>
          <p>
            Esslay has grouped the files and guessed each role. Check the full map below; every label and grouping can be changed before anything is saved.
          </p>
        </div>
        <span className="import-count">{bundles.reduce((sum, bundle) => sum + bundle.artifacts.length, 0)} files</span>
      </div>

      {bundles.map((bundle) => (
        <div className="pending-bundle" key={bundle.key}>
          <div className="pending-bundle-fields">
            <label>
              Archive set name
              <input
                value={bundle.title}
                onChange={(event) => updateBundle(bundle.key, { title: event.target.value })}
              />
            </label>
            <label>
              Module
              <input
                value={bundle.moduleCode}
                onChange={(event) => updateBundle(bundle.key, { moduleCode: event.target.value.toUpperCase() })}
                placeholder="e.g. E104"
              />
            </label>
            <label>
              Assessment
              <input
                value={bundle.assessmentCode}
                onChange={(event) => updateBundle(bundle.key, { assessmentCode: event.target.value })}
                placeholder="e.g. 04"
              />
            </label>
            <label>
              Score
              <input
                type="number"
                min="0"
                max="100"
                value={bundle.score ?? ""}
                onChange={(event) => {
                  const value = event.target.value ? Number(event.target.value) : null;
                  updateBundle(bundle.key, { score: value });
                }}
                placeholder="optional"
              />
            </label>
          </div>
          <div className="pending-artifacts">
            {bundle.artifacts.map((artifact) => (
              <div className="pending-artifact" key={artifact.key}>
                <div>
                  <strong>{artifact.filename}</strong>
                  <span>
                    {artifact.sections.length} section{artifact.sections.length === 1 ? "" : "s"}
                    {artifact.feedback.length ? ` · ${artifact.feedback.length} tutor notes` : ""}
                  </span>
                </div>
                <label>
                  Role
                  <select
                    value={artifact.role}
                    onChange={(event) =>
                      updateArtifact(bundle.key, artifact.key, event.target.value as ArchiveRole)
                    }
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                {bundles.length > 1 && (
                  <label>
                    Archive set
                    <select
                      value={bundle.key}
                      onChange={(event) => moveArtifact(bundle.key, artifact, event.target.value)}
                    >
                      {bundles.map((option) => (
                        <option value={option.key} key={option.key}>{option.title}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
            ))}
            {!bundle.artifacts.length && <p className="archive-inline-empty">No files are assigned to this set.</p>}
          </div>
        </div>
      ))}

      {message && <p className="archive-message" role="alert">{message}</p>}
      <div className="import-review-actions">
        <button type="button" className="secondary-button" onClick={onCancel} disabled={Boolean(busy)}>Cancel</button>
        <button
          type="button"
          className="primary-button"
          onClick={onSave}
          disabled={Boolean(busy) || !bundles.some((bundle) => bundle.artifacts.length)}
        >
          {busy || "Save connected archive"}
        </button>
      </div>
    </section>
  );
}

function ArtifactInspector({ detail }: { detail: ArtifactDetail }) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const section = detail.sections[sectionIndex];
  return (
    <div className="artifact-inspector">
      <div className="artifact-inspector-heading">
        <div>
          <p className="eyebrow">Extracted original</p>
          <h4>{detail.artifact.filename}</h4>
        </div>
        <a
          className="secondary-button archive-original-link"
          href={`/api/archive?artifactId=${encodeURIComponent(detail.artifact.id)}&mode=file`}
          target="_blank"
          rel="noreferrer"
        >
          Open original
        </a>
      </div>
      {detail.sections.length > 1 && (
        <label className="artifact-page-select">
          Page
          <select value={sectionIndex} onChange={(event) => setSectionIndex(Number(event.target.value))}>
            {detail.sections.map((item, index) => (
              <option value={index} key={item.sectionNumber}>
                {item.pageNumber ? `Page ${item.pageNumber}` : `Section ${item.sectionNumber}`}
              </option>
            ))}
          </select>
        </label>
      )}
      <pre>{section?.textContent || "No text could be extracted from this item."}</pre>
    </div>
  );
}

function FeedbackCard({ note, artifacts }: { note: FeedbackNote; artifacts: ArchiveArtifact[] }) {
  const artifact = artifacts.find((item) => item.id === note.artifactId);
  return (
    <article className={`feedback-memory-card feedback-memory-card--${note.tone}`}>
      <div className="feedback-card-meta">
        <span>{categoryLabel(note.category)}</span>
        <span>{note.tone === "improve" ? "To carry forward" : note.tone === "strength" ? "Strength" : "Tutor note"}</span>
      </div>
      <blockquote>{note.commentText}</blockquote>
      {note.anchorText && (
        <div className="feedback-anchor">
          <span>Attached to</span>
          <q>{note.anchorText}</q>
        </div>
      )}
      <small>{artifact?.filename || note.locationLabel}</small>
    </article>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="metric-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function roleLabel(role: ArchiveRole) {
  return ROLE_OPTIONS.find((option) => option.value === role)?.label || "Other";
}

function categoryLabel(category: FeedbackCategory) {
  const labels: Record<FeedbackCategory, string> = {
    task_focus: "Task focus",
    analysis: "Analysis",
    evidence: "Evidence",
    structure: "Structure",
    writing: "Writing",
    referencing: "Referencing",
    reflection: "Reflection",
    other: "Tutor note",
  };
  return labels[category];
}

function fileSummary(artifact: ArchiveArtifact) {
  if (artifact.contentType === "application/pdf") return `${artifact.pageCount} page${artifact.pageCount === 1 ? "" : "s"}`;
  return formatBytes(artifact.byteSize);
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Something went wrong.";
}
