"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWorkspace, workspaceAction } from "../../lib/client-api";
import { mapQuestion } from "../../lib/question-map";
import type {
  ArchiveArtifact,
  ArchiveBundle,
  Assignment,
  Draft,
  EvidenceSpan,
  FeedbackNote,
  RoomId,
  SourceDocument,
  WorkspacePayload,
} from "../../lib/types";
import { ArchiveRoom } from "./archive-room";
import { EvidenceEditor } from "./evidence-editor";
import { SourceRoom } from "./source-room";

const ROOMS: Array<{ id: RoomId; number: string; label: string }> = [
  { id: "archive", number: "00", label: "Archive" },
  { id: "question", number: "01", label: "Question" },
  { id: "sources", number: "02", label: "Sources" },
  { id: "draft", number: "03", label: "Draft" },
  { id: "review", number: "04", label: "Review" },
];

export function EsslayWorkspace() {
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [assignmentId, setAssignmentId] = useState("");
  const [room, setRoom] = useState<RoomId>("question");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const next = await fetchWorkspace();
      setWorkspace(next);
      setAssignmentId((current) => current || next.assignments[0]?.id || "");
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchWorkspace()
      .then((next) => {
        if (cancelled) return;
        setWorkspace(next);
        setAssignmentId(next.assignments[0]?.id ?? "");
        setRoom(next.assignments[0]?.activeRoom ?? "question");
      })
      .catch((reason) => {
        if (!cancelled) setError(errorMessage(reason));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const assignment =
    workspace?.assignments.find((item) => item.id === assignmentId) ?? null;
  const sources = useMemo(
    () => workspace?.sources.filter((item) => item.assignmentId === assignmentId) ?? [],
    [workspace, assignmentId],
  );
  const evidence = useMemo(
    () => workspace?.evidence.filter((item) => item.assignmentId === assignmentId) ?? [],
    [workspace, assignmentId],
  );
  const draft = workspace?.drafts.find((item) => item.assignmentId === assignmentId) ?? null;
  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId) ?? null;

  function applyWorkspace(next: WorkspacePayload) {
    setWorkspace(next);
    setAssignmentId((current) =>
      next.assignments.some((item) => item.id === current)
        ? current
        : next.assignments[0]?.id ?? "",
    );
  }

  function chooseAssignment(nextId: string) {
    const nextAssignment = workspace?.assignments.find((item) => item.id === nextId);
    setAssignmentId(nextId);
    setRoom(nextAssignment?.activeRoom ?? "question");
    setSelectedEvidenceId(null);
  }

  function chooseRoom(nextRoom: RoomId) {
    setRoom(nextRoom);
    if (!assignment) return;
    void workspaceAction({
      action: "updateAssignment",
      assignmentId: assignment.id,
      activeRoom: nextRoom,
    })
      .then(applyWorkspace)
      .catch((reason) => setError(errorMessage(reason)));
  }

  if (!workspace) {
    return (
      <main className="app-loading">
        <div className="loading-mark">E</div>
        <p>{error || "Opening your workspace…"}</p>
        {error && <button onClick={() => void load()}>Try again</button>}
      </main>
    );
  }

  if ((!assignment && room !== "archive") || creating) {
    return (
      <NewRun
        hasExisting={workspace.assignments.length > 0}
        onCancel={() => setCreating(false)}
        onOpenArchive={() => {
          setCreating(false);
          setRoom("archive");
        }}
        onCreate={async (title, question) => {
          setError("");
          const before = new Set(workspace.assignments.map((item) => item.id));
          const next = await workspaceAction({
            action: "createAssignment",
            title,
            question,
            breakdown: mapQuestion(question),
          });
          applyWorkspace(next);
          const created = next.assignments.find((item) => !before.has(item.id));
          if (created) {
            setAssignmentId(created.id);
            setRoom("question");
          }
          setCreating(false);
        }}
      />
    );
  }

  const roomState = assignment
    ? completionState(
        assignment,
        sources,
        evidence,
        draft,
        workspace.archiveBundles,
        workspace.feedbackNotes,
      )
    : {
        archive: workspace.archiveBundles.length ? "complete" as const : "empty" as const,
        question: "empty" as const,
        sources: "empty" as const,
        draft: "empty" as const,
        review: "empty" as const,
      };

  return (
    <main className="esslay-app">
      <header className="app-header">
        <a className="brand" href="#workspace" aria-label="Esslay workspace">
          <span className="brand-mark" aria-hidden="true">E</span>
          <span>
            <strong>Esslay</strong>
            <small>source-grounded writing</small>
          </span>
        </a>

        {assignment ? (
          <div className="assignment-picker">
            <label htmlFor="assignment-select">Exam run</label>
            <select
              id="assignment-select"
              value={assignment.id}
              onChange={(event) => chooseAssignment(event.target.value)}
            >
              {workspace.assignments.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
          </div>
        ) : (
          <p className="no-active-run">Archive mode · no active exam</p>
        )}

        <button type="button" className="new-run-button" onClick={() => setCreating(true)}>
          + New exam run
        </button>
      </header>

      <nav className="room-nav" aria-label="Exam rooms">
        {ROOMS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={room === item.id ? "room-tab is-active" : "room-tab"}
            onClick={() => chooseRoom(item.id)}
            disabled={!assignment && item.id !== "archive"}
          >
            <span className={`room-status room-status--${roomState[item.id]}`} aria-hidden="true" />
            <span className="room-number">{item.number}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <p className="nav-note">Move between rooms whenever you need.</p>
      </nav>

      <div id="workspace" className="workspace-frame">
        {error && (
          <div className="global-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        {room === "archive" && (
          <ArchiveRoom
            bundles={workspace.archiveBundles}
            artifacts={workspace.archiveArtifacts}
            feedback={workspace.feedbackNotes}
            onReload={load}
          />
        )}

        {room === "question" && assignment && (
          <QuestionRoom
            key={assignment.id}
            assignment={assignment}
            onWorkspaceChange={applyWorkspace}
            onContinue={() => chooseRoom("sources")}
          />
        )}

        {room === "sources" && assignment && (
          <SourceRoom
            assignmentId={assignment.id}
            sources={sources}
            evidence={evidence}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={setSelectedEvidenceId}
            onWorkspaceChange={applyWorkspace}
            onReload={load}
          />
        )}

        {room === "draft" && assignment && draft && (
          <DraftRoom
            key={draft.id}
            assignment={assignment}
            draft={draft}
            sources={sources}
            evidence={evidence}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={setSelectedEvidenceId}
            onWorkspaceChange={applyWorkspace}
            onOpenSource={() => chooseRoom("sources")}
          />
        )}

        {room === "review" && assignment && draft && (
          <ReviewRoom
            key={`review-${draft.id}`}
            draft={draft}
            sources={sources}
            evidence={evidence}
            selectedEvidence={selectedEvidence}
            onSelectEvidence={setSelectedEvidenceId}
            onOpenSource={() => chooseRoom("sources")}
            feedbackNotes={workspace.feedbackNotes}
            archiveBundles={workspace.archiveBundles}
            archiveArtifacts={workspace.archiveArtifacts}
            onOpenArchive={() => chooseRoom("archive")}
          />
        )}
      </div>
    </main>
  );
}

function NewRun({
  hasExisting,
  onCancel,
  onOpenArchive,
  onCreate,
}: {
  hasExisting: boolean;
  onCancel: () => void;
  onOpenArchive: () => void;
  onCreate: (title: string, question: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!question.trim()) {
      setError("Paste the exam or essay question to begin.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onCreate(title.trim(), question.trim());
    } catch (reason) {
      setError(errorMessage(reason));
      setBusy(false);
    }
  }

  return (
    <main className="onboarding-shell">
      <div className="onboarding-brand">
        <span className="brand-mark" aria-hidden="true">E</span>
        <span>Esslay</span>
      </div>
      <section className="new-run-card">
        <p className="eyebrow">Start here</p>
        <h1>Bring in the question you are answering.</h1>
        <p className="new-run-intro">
          This creates a clean exam workspace. You can change rooms in any order and return to the question at any time.
        </p>
        <label className="field-label">
          Name this exam run <span>optional</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. POL204 final essay"
          />
        </label>
        <label className="field-label">
          Question
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Paste the exact question here…"
            rows={7}
            autoFocus
          />
        </label>
        {error && <p className="error-banner" role="alert">{error}</p>}
        <div className="form-actions">
          {hasExisting && <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>}
          <button type="button" className="secondary-button" onClick={onOpenArchive}>Import old work first</button>
          <button type="button" className="primary-button primary-button--large" onClick={submit} disabled={busy}>
            {busy ? "Creating…" : "Break down this question"}
          </button>
        </div>
      </section>
      <p className="privacy-note">Your workspace is attached to your signed-in account. Esslay does not rewrite your words.</p>
    </main>
  );
}

function QuestionRoom({
  assignment,
  onWorkspaceChange,
  onContinue,
}: {
  assignment: Assignment;
  onWorkspaceChange: (workspace: WorkspacePayload) => void;
  onContinue: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [question, setQuestion] = useState(assignment.question);
  const [breakdown, setBreakdown] = useState(assignment.breakdown);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(confirmed: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const next = await workspaceAction({
        action: "updateAssignment",
        assignmentId: assignment.id,
        title,
        question,
        breakdown,
        breakdownConfirmed: confirmed,
      });
      onWorkspaceChange(next);
      setMessage(confirmed ? "Question map confirmed." : "Question map saved.");
      return true;
    } catch (reason) {
      setMessage(errorMessage(reason));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="room-grid question-room" aria-labelledby="question-room-title">
      <div className="room-main">
        <div className="room-heading">
          <div>
            <p className="eyebrow">Room 1</p>
            <h2 id="question-room-title">Break down the question</h2>
            <p>The first map is a mechanical guess. Correct it until it matches what your teacher is actually asking.</p>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setBreakdown(mapQuestion(question))}
          >
            Re-map question
          </button>
        </div>

        <div className="question-card">
          <label className="field-label compact-field">
            Exam run name
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field-label">
            Exact question
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={5}
            />
          </label>
        </div>

        <div className="map-grid">
          <MapField
            label="Command"
            hint="What action must your answer perform?"
            value={breakdown.command}
            onChange={(value) => setBreakdown({ ...breakdown, command: value })}
          />
          <MapField
            label="Required output"
            hint="What should the answer produce?"
            value={breakdown.output}
            onChange={(value) => setBreakdown({ ...breakdown, output: value })}
          />
          <MapField
            label="Subject"
            hint="What is the answer about?"
            value={breakdown.subject}
            onChange={(value) => setBreakdown({ ...breakdown, subject: value })}
            wide
          />
          <MapField
            label="Focus"
            hint="Which angle or material controls the answer?"
            value={breakdown.focus}
            onChange={(value) => setBreakdown({ ...breakdown, focus: value })}
            wide
          />
          <ListField
            label="Constraints"
            hint="One per line. Add dates, cases, word limits, or required material."
            values={breakdown.constraints}
            onChange={(values) => setBreakdown({ ...breakdown, constraints: values })}
          />
          <ListField
            label="Evidence jobs"
            hint="What must your sources help you establish?"
            values={breakdown.evidenceNeeds}
            onChange={(values) => setBreakdown({ ...breakdown, evidenceNeeds: values })}
          />
        </div>

        <div className="room-actions">
          <span className="action-message">{message}</span>
          <button type="button" className="secondary-button" onClick={() => void save(false)} disabled={busy}>Save map</button>
          <button
            type="button"
            className="primary-button"
            disabled={busy || !question.trim() || !breakdown.command.trim()}
            onClick={async () => {
              if (await save(true)) onContinue();
            }}
          >
            Confirm and open sources
          </button>
        </div>
      </div>

      <aside className="room-aside guide-aside">
        <p className="eyebrow">Checkpoint</p>
        <h3>{assignment.breakdownConfirmedAt ? "Map confirmed" : "Needs your confirmation"}</h3>
        <p>
          Esslay will not treat the automatic map as correct until you confirm it. Your edits are authoritative.
        </p>
        <div className="guide-rule" />
        <h4>Useful test</h4>
        <p>Could you explain in one sentence what a strong answer must do? If not, keep editing the map.</p>
      </aside>
    </section>
  );
}

function MapField({
  label,
  hint,
  value,
  onChange,
  wide = false,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "map-field map-field--wide" : "map-field"}>
      <span>{label}</span>
      <small>{hint}</small>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={wide ? 3 : 2} />
    </label>
  );
}

function ListField({
  label,
  hint,
  values,
  onChange,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <label className="map-field map-field--wide">
      <span>{label}</span>
      <small>{hint}</small>
      <textarea
        value={values.join("\n")}
        onChange={(event) =>
          onChange(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))
        }
        rows={4}
      />
    </label>
  );
}

function DraftRoom({
  assignment,
  draft,
  sources,
  evidence,
  selectedEvidenceId,
  onSelectEvidence,
  onWorkspaceChange,
  onOpenSource,
}: {
  assignment: Assignment;
  draft: Draft;
  sources: SourceDocument[];
  evidence: EvidenceSpan[];
  selectedEvidenceId: string | null;
  onSelectEvidence: (evidenceId: string) => void;
  onWorkspaceChange: (workspace: WorkspacePayload) => void;
  onOpenSource: () => void;
}) {
  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId) ?? null;

  return (
    <section className="room-grid draft-room" aria-labelledby="draft-room-title">
      <div className="room-main">
        <div className="room-heading">
          <div>
            <p className="eyebrow">Room 3</p>
            <h2 id="draft-room-title">Draft chamber</h2>
            <p>Write freely. Source highlighting only appears when you deliberately connect selected words.</p>
          </div>
          <div className="question-chip" title={assignment.question}>{assignment.breakdown.command || "Question"}</div>
        </div>
        <EvidenceEditor
          draft={draft}
          evidence={evidence}
          selectedEvidenceId={selectedEvidenceId}
          onSelectEvidence={onSelectEvidence}
          onSave={async (contentJson, plainText) => {
            const next = await workspaceAction({
              action: "saveDraft",
              assignmentId: assignment.id,
              contentJson,
              plainText,
            });
            onWorkspaceChange(next);
          }}
          onLinkCreated={(evidenceId) => {
            void workspaceAction({
              action: "logDraftLink",
              assignmentId: assignment.id,
              evidenceId,
            }).then(onWorkspaceChange);
          }}
        />
      </div>

      <EvidenceAside
        sources={sources}
        evidence={evidence}
        selectedEvidence={selectedEvidence}
        onSelectEvidence={onSelectEvidence}
        onOpenSource={onOpenSource}
      />
    </section>
  );
}

function ReviewRoom({
  draft,
  sources,
  evidence,
  selectedEvidence,
  onSelectEvidence,
  onOpenSource,
  feedbackNotes,
  archiveBundles,
  archiveArtifacts,
  onOpenArchive,
}: {
  draft: Draft;
  sources: SourceDocument[];
  evidence: EvidenceSpan[];
  selectedEvidence: EvidenceSpan | null;
  onSelectEvidence: (evidenceId: string) => void;
  onOpenSource: () => void;
  feedbackNotes: FeedbackNote[];
  archiveBundles: ArchiveBundle[];
  archiveArtifacts: ArchiveArtifact[];
  onOpenArchive: () => void;
}) {
  const coverage = inspectDraft(draft.contentJson);
  const linkedEvidence = evidence.filter((item) => coverage.evidenceIds.has(item.id));

  return (
    <section className="room-grid review-room" aria-labelledby="review-room-title">
      <div className="room-main">
        <div className="room-heading">
          <div>
            <p className="eyebrow">Room 4</p>
            <h2 id="review-room-title">Evidence review</h2>
            <p>This checks source connections, not whether a claim is universally true. Click any amber text to inspect its origin.</p>
          </div>
        </div>

        <PastFeedbackPanel
          notes={feedbackNotes}
          bundles={archiveBundles}
          artifacts={archiveArtifacts}
          onOpenArchive={onOpenArchive}
        />

        <div className="review-metrics">
          <Metric value={coverage.linkedWords} label="words linked" />
          <Metric value={linkedEvidence.length} label="sources used" />
          <Metric value={coverage.unlinkedBlocks} label="blocks without links" />
        </div>

        <EvidenceEditor
          draft={draft}
          evidence={evidence}
          selectedEvidenceId={selectedEvidence?.id ?? null}
          readOnly
          onSelectEvidence={onSelectEvidence}
          onSave={async () => {}}
          onLinkCreated={() => {}}
        />

        <div className="review-explainer">
          <span className="legend-swatch" aria-hidden="true" />
          Amber writing has an explicit source connection. Unmarked writing may still be analysis, but it has not been tied to a saved passage.
        </div>
      </div>

      <EvidenceAside
        sources={sources}
        evidence={evidence}
        selectedEvidence={selectedEvidence}
        onSelectEvidence={onSelectEvidence}
        onOpenSource={onOpenSource}
      />
    </section>
  );
}

function PastFeedbackPanel({
  notes,
  bundles,
  artifacts,
  onOpenArchive,
}: {
  notes: FeedbackNote[];
  bundles: ArchiveBundle[];
  artifacts: ArchiveArtifact[];
  onOpenArchive: () => void;
}) {
  const carryForward = notes
    .filter(
      (note) =>
        note.tone === "improve" &&
        note.category !== "other" &&
        note.commentText.trim().length >= 20,
    )
    .sort((left, right) => {
      if (Boolean(left.anchorText) !== Boolean(right.anchorText)) {
        return left.anchorText ? -1 : 1;
      }
      return Math.abs(left.commentText.length - 140) - Math.abs(right.commentText.length - 140);
    })
    .slice(0, 4);
  if (!carryForward.length) return null;
  return (
    <section className="past-feedback-panel" aria-labelledby="past-feedback-title">
      <div className="past-feedback-heading">
        <div>
          <p className="eyebrow">Past tutor signals</p>
          <h3 id="past-feedback-title">Carry these exact notes into review</h3>
          <p>These are reminders from imported feedback. They do not change or score your writing.</p>
        </div>
        <button type="button" className="secondary-button" onClick={onOpenArchive}>Open archive</button>
      </div>
      <div className="past-feedback-list">
        {carryForward.map((note) => {
          const artifact = artifacts.find((item) => item.id === note.artifactId);
          const bundle = bundles.find((item) => item.id === note.bundleId);
          return (
            <article key={note.id}>
              <q>{note.commentText}</q>
              {note.anchorText && <span>Attached to “{note.anchorText}”</span>}
              <small>{bundle?.title || artifact?.filename || "Imported feedback"}</small>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EvidenceAside({
  sources,
  evidence,
  selectedEvidence,
  onSelectEvidence,
  onOpenSource,
}: {
  sources: SourceDocument[];
  evidence: EvidenceSpan[];
  selectedEvidence: EvidenceSpan | null;
  onSelectEvidence: (evidenceId: string) => void;
  onOpenSource: () => void;
}) {
  const source = sources.find((item) => item.id === selectedEvidence?.documentId);
  return (
    <aside className="room-aside evidence-aside">
      <p className="eyebrow">Source proof</p>
      {selectedEvidence ? (
        <>
          <h3>{source?.filename ?? "Source"}</h3>
          <p className="source-location">Page {selectedEvidence.pageNumber}</p>
          <blockquote>{selectedEvidence.quote}</blockquote>
          {selectedEvidence.note && <p className="evidence-note-full">{selectedEvidence.note}</p>}
          <button type="button" className="primary-button full-button" onClick={onOpenSource}>
            Open original page
          </button>
        </>
      ) : (
        <div className="aside-empty-card">
          <h3>No passage selected</h3>
          <p>Choose evidence below, or open the Source room to save a passage.</p>
          <button type="button" className="secondary-button full-button" onClick={onOpenSource}>Open sources</button>
        </div>
      )}
      {evidence.length > 0 && (
        <div className="evidence-mini-list">
          {evidence.map((item) => (
            <button
              type="button"
              key={item.id}
              className={item.id === selectedEvidence?.id ? "is-selected" : ""}
              onClick={() => onSelectEvidence(item.id)}
            >
              <span>p. {item.pageNumber}</span>
              {item.quote}
            </button>
          ))}
        </div>
      )}
    </aside>
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

function completionState(
  assignment: Assignment,
  sources: SourceDocument[],
  evidence: EvidenceSpan[],
  draft: Draft | null,
  archiveBundles: ArchiveBundle[],
  feedbackNotes: FeedbackNote[],
): Record<RoomId, "empty" | "started" | "complete"> {
  const coverage = inspectDraft(draft?.contentJson ?? {});
  return {
    archive: feedbackNotes.length ? "complete" : archiveBundles.length ? "started" : "empty",
    question: assignment.breakdownConfirmedAt ? "complete" : assignment.question ? "started" : "empty",
    sources: evidence.length ? "complete" : sources.length ? "started" : "empty",
    draft: draft?.plainText.trim() ? "complete" : "empty",
    review: coverage.evidenceIds.size ? "complete" : draft?.plainText.trim() ? "started" : "empty",
  };
}

function inspectDraft(content: Record<string, unknown>) {
  const evidenceIds = new Set<string>();
  let linkedWords = 0;
  let unlinkedBlocks = 0;

  function walk(node: unknown, block = false): { text: string; linked: boolean } {
    if (!node || typeof node !== "object") return { text: "", linked: false };
    const item = node as Record<string, unknown>;
    const marks = Array.isArray(item.marks) ? item.marks : [];
    const evidenceMark = marks.find(
      (mark) =>
        mark &&
        typeof mark === "object" &&
        (mark as Record<string, unknown>).type === "evidenceLink",
    ) as Record<string, unknown> | undefined;
    const attributes = evidenceMark?.attrs as Record<string, unknown> | undefined;
    const evidenceId = typeof attributes?.evidenceId === "string" ? attributes.evidenceId : null;
    const ownText = typeof item.text === "string" ? item.text : "";
    if (evidenceId) {
      evidenceIds.add(evidenceId);
      linkedWords += ownText.trim() ? ownText.trim().split(/\s+/).length : 0;
    }

    const children = Array.isArray(item.content) ? item.content : [];
    const childResults = children.map((child) => walk(child));
    const result = {
      text: ownText + childResults.map((child) => child.text).join(""),
      linked: Boolean(evidenceId) || childResults.some((child) => child.linked),
    };
    const isBlock = item.type === "paragraph" || item.type === "heading" || block;
    if (isBlock && result.text.trim() && !result.linked) unlinkedBlocks += 1;
    return result;
  }

  walk(content);
  return { evidenceIds, linkedWords, unlinkedBlocks };
}

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : "Something went wrong.";
}
