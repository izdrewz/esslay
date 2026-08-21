"use client";

import { Mark, mergeAttributes } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import type { Draft, EvidenceSpan } from "../../lib/types";

const EvidenceLink = Mark.create({
  name: "evidenceLink",
  inclusive: false,
  addAttributes() {
    return {
      evidenceId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-evidence-id"),
        renderHTML: (attributes) => ({ "data-evidence-id": attributes.evidenceId }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "mark[data-evidence-id]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["mark", mergeAttributes(HTMLAttributes, { class: "evidence-link" }), 0];
  },
});

type Props = {
  draft: Draft;
  evidence: EvidenceSpan[];
  selectedEvidenceId: string | null;
  readOnly?: boolean;
  onSelectEvidence: (evidenceId: string) => void;
  onSave: (contentJson: Record<string, unknown>, plainText: string) => Promise<void>;
  onLinkCreated: (evidenceId: string) => void;
};

export function EvidenceEditor({
  draft,
  evidence,
  selectedEvidenceId,
  readOnly = false,
  onSelectEvidence,
  onSave,
  onLinkCreated,
}: Props) {
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [message, setMessage] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(onSave);

  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit,
      EvidenceLink,
      Placeholder.configure({
        placeholder: "Write your answer here. Select a phrase, then connect it to saved evidence.",
      }),
    ],
    content: draft.contentJson,
    editorProps: {
      attributes: { class: "essay-editor" },
      handleClick: (_view, _position, event) => {
        const target = event.target instanceof Element ? event.target : null;
        const mark = target?.closest("mark[data-evidence-id]");
        const evidenceId = mark?.getAttribute("data-evidence-id");
        if (evidenceId) {
          onSelectEvidence(evidenceId);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (readOnly) return;
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          await saveRef.current(
            currentEditor.getJSON() as Record<string, unknown>,
            currentEditor.getText(),
          );
          setSaveState("saved");
        } catch {
          setSaveState("error");
        }
      }, 850);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!editor) return <div className="editor-loading">Opening draft…</div>;

  const selectedEvidence = evidence.find((item) => item.id === selectedEvidenceId);
  const words = editor.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0;

  async function saveNow() {
    if (!editor || readOnly) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    try {
      await onSave(editor.getJSON() as Record<string, unknown>, editor.getText());
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function linkSelection() {
    if (!editor || !selectedEvidence) {
      setMessage("Choose a saved evidence passage first.");
      return;
    }
    const { from, to, empty } = editor.state.selection;
    if (empty || from === to) {
      setMessage("Select the exact words in your draft that this evidence supports.");
      return;
    }
    editor
      .chain()
      .focus()
      .setMark("evidenceLink", { evidenceId: selectedEvidence.id })
      .run();
    onLinkCreated(selectedEvidence.id);
    setMessage("Linked. Click the amber highlight at any time to reopen its source.");
  }

  return (
    <div className={readOnly ? "editor-shell editor-shell--review" : "editor-shell"}>
      {!readOnly && (
        <div className="editor-toolbar" aria-label="Draft formatting">
          <div className="formatting-tools">
            <button
              type="button"
              className={editor.isActive("bold") ? "tool-button is-active" : "tool-button"}
              onClick={() => editor.chain().focus().toggleBold().run()}
              aria-label="Bold"
            >
              B
            </button>
            <button
              type="button"
              className={editor.isActive("italic") ? "tool-button is-active" : "tool-button"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              aria-label="Italic"
            >
              <span className="italic-label">I</span>
            </button>
            <button
              type="button"
              className={editor.isActive("heading", { level: 2 }) ? "tool-button is-active" : "tool-button"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </button>
            <button
              type="button"
              className={editor.isActive("bulletList") ? "tool-button is-active" : "tool-button"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              List
            </button>
          </div>
          <button type="button" className="link-button" onClick={linkSelection}>
            <span aria-hidden="true">↗</span>
            Link selected writing
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
      {!readOnly && (
        <div className="editor-footer">
          <span>{words} words</span>
          <span className={`save-state save-state--${saveState}`}>
            {saveState === "saved" ? "Saved" : saveState === "saving" ? "Saving…" : "Save failed"}
          </span>
          <button type="button" className="text-button" onClick={saveNow}>
            Save now
          </button>
        </div>
      )}
      {message && !readOnly && <p className="editor-message">{message}</p>}
    </div>
  );
}
