# Esslay V2

Esslay is a non-linear, source-grounded writing workspace. It turns one exam or essay into rooms that can be revisited in any order.

This repository is a clean rebuild of the original `izdrewz/esslay` experiment. The old repository is not modified.

## Working vertical slice

- Create separate exam runs.
- Import old assessment bundles from ZIP, DOCX, PDF, HTML, or HTM files.
- Preserve exact Word tutor comments and the words each comment was attached to.
- Connect questions, plans, marked submissions, feedback, revisions, and sources in one archive set.
- Break down a question, edit the map, and explicitly confirm it.
- Upload a PDF while retaining the original file.
- Extract selectable text by page.
- Save an exact evidence span with its page and character offsets.
- Write in a rich-text editor.
- Link selected draft words to saved evidence.
- Click highlighted writing to reveal its original source passage.
- Review which writing blocks have no explicit evidence link.

Esslay never silently rewrites a draft. The automatic question map is provisional until the writer confirms it. Evidence review checks source connections rather than claiming to verify universal truth.

## Rooms

| Room | Purpose |
| --- | --- |
| Archive | Import old work and retain exact tutor feedback in context. |
| Question | Turn the exact prompt into an editable task map. |
| Sources | Read PDFs and save precise passages. |
| Draft | Write and attach evidence to selected words. |
| Review | Inspect source-linked highlights and locate gaps. |

The room order is guidance, not a lock. There is no global XP tree. A task garden can be added later as a separate home-task system.

## Data ownership

Structured workspace data is stored in D1. Original source and archive files are stored in R2. Every record is scoped to the signed-in ChatGPT user header, with a development-only local identity for localhost previews.

The source validation endpoint confirms that a saved quote still matches the stored page text at the submitted offsets.

## Stack

- Vinext, React, and TypeScript
- Tiptap for the evidence-aware editor
- PDF.js for browser-side extraction and page rendering
- JSZip for ZIP and DOCX archive inspection
- Drizzle with Cloudflare D1
- Cloudflare R2 for source files

## Commands

```bash
npm run dev
npm run build
npm run lint
npx tsc --noEmit
npm test
```

After a schema change, generate and inspect the migration:

```bash
npm run db:generate
```

## Current boundary

This build deliberately focuses on the writing engine and its evidence-backed memory. Household-task crops, narrative scenes, OCR for scanned PDFs, and broader AI assistance remain later slices. The archive labels feedback deterministically and always presents the tutor's original wording; it does not train a model or silently rewrite a draft.
