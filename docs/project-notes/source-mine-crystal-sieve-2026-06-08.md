# Source Mine Crystal Sieve v1

Status: active / needs browser test

Date: 2026-06-08

## Summary

Source Mine has been upgraded from a blank evidence form into a Crystal Sieve sorting workflow.

This was kept in the main repo rather than split into area work because it touches Brief Fog buckets, Source Mine evidence logic, source-library data, saved word groups, localStorage state, and future Draft Route use.

## Implemented files

- `docs/study-cave-source-mine-v4-hotfix.js`
- `docs/cave.html`

## Behaviour added

Source Mine now has tabs:

- Crystal Sieve
- Bucket Vault
- Add Source
- Word Constellations
- Review Cart

## Source Library

The Add Source tab lets Izzy paste a source, transcript, notes, or copied PDF text.

The system creates small source cards from the pasted text and stores:

- source title
- citation/source label
- source type
- source preview
- created cards
- source id

MP3 and MP4 files are not automatically mined yet. They need a transcript first.

## Crystal Sieve

The Crystal Sieve shows one source card at a time. Each card can be:

- saved as evidence to one or more Brief Fog buckets
- parked
- discarded

Saved evidence becomes an evidence gem.

Each evidence gem stores:

- bucket
- bucket id
- source id
- source title
- citation label
- evidence text
- Izzy note / link explanation
- matched words
- created timestamp

## Word Constellations

Word Constellations are reusable related-word groups. They help future source cards auto-suggest matching buckets.

Default groups exist for current Study Skills Trial buckets:

- planning
- source notes
- drafting
- proofreading
- referencing habits

There are also early CYS-style groups included for future source work:

- children's voice
- childhood as social construction
- children's rights
- young carers
- attachment

These are editable in the Word Constellations tab.

## Bucket Vault

Bucket Vault shows the Brief Fog buckets and saved evidence gems.

This is the future bridge into Draft Route, where saved gems can become paragraph material.

## Review Cart

Review Cart stores parked and discarded source cards so nothing is silently lost.

Parked or discarded cards can be restored to the sieve.

## Test path

1. Open `docs/cave.html?test=1&fresh=7` after Pages updates.
2. Open Study Cave and reach Source Mine.
3. Open Add Source.
4. Use Seed demo cards or paste a source text.
5. Confirm source cards appear in Crystal Sieve.
6. Save one card to a bucket.
7. Confirm Bucket Vault shows the saved evidence gem.
8. Park or discard one card.
9. Confirm Review Cart shows it and restore works.
10. Confirm refresh keeps the saved source cards and evidence gems.

## Latest browser-test result

Source Mine Sieve is now reachable from the real route and is receiving the correct Brief Fog buckets:

- planning
- source notes
- drafting
- proofreading
- referencing habits

The demo source card matched planning and drafting, which confirms the word-matching logic is working.

## Flagged future improvement: Source Mine intro / begin quest

Izzy flagged that Source Mine should still have a clearer intro / begin-quest moment before the Crystal Sieve starts.

Current issue:

- the room can jump straight into Add Source / Crystal Sieve once the route is active
- this works for code testing, but feels abrupt as a game room
- the old Begin Source Mine popup existed, but it belonged to the old Source Notes flow and should not be reused as-is

Future desired behaviour:

- Source Mine opens with a short themed intro the first time only
- intro explains that this is a gather quest
- intro explains that buckets are crystal slots from Brief Fog
- player chooses Begin Source Mine, then Add Source / Crystal Sieve unlocks
- after the first begin, returning to Source Mine should resume the current Sieve state, not force the intro every time

Suggested wording direction:

"Source Mine is a gather quest. Your Brief Fog buckets are crystal slots. Add a source, sift it into useful cards, then save the best cards as evidence gems."

Do not restore the old cream Source Notes drawer. Build the intro into the new Sieve flow.

## Known limits

- This is local/browser rule-matching, not AI.
- Uploaded PDFs are not automatically read by the game; text must be pasted for now.
- Uploaded audio/video need transcripts before they can become source cards.
- Source Mine visual polish is still placeholder and may need compaction after Izzy tests.
- Cave Base review hooks are planned but not yet visible as a dedicated Base review panel.
- Source Mine needs a new first-time intro / Begin Source Mine step for the Sieve flow.

## Next decision after test

If Izzy approves the working loop, mark this as completed needs further edits because the workflow is usable but still needs visual polish, a first-time intro, and Cave Base review integration.

If it fails, keep active and record the exact failing click or save state.

## PDF/source import phase — 2026-06-21

Status: needs approval

### What changed

The existing pasted-text route remains available in **Add Source**.

A local PDF route now appears in the same panel. The player chooses a `.pdf` through the browser file picker. The selected file is read locally in the browser only; it is not uploaded to GitHub and is not sent to a server.

PDF.js is pinned locally at `pdfjs-dist` version `4.10.38` under `docs/assets/vendor/pdfjs/`. Its install record is in `docs/assets/vendor/pdfjs/README.md`.

A readable PDF is processed page by page, then cut into the existing Crystal Sieve card flow. A PDF-derived source stores its title, citation label, filename, import type, page count, chunk count, and creation time. Every PDF-derived card stores the source identity, filename, page number, chunk index, original text, and queue status.

The Sieve displays filename, page number, and chunk number for PDF cards. Saved evidence gems preserve the source-card ID, title, citation label, filename, import type, page number, chunk index, evidence text, bucket choice, and player note.

The existing user-controlled actions remain: choose one or more buckets, add an optional note, Park, Discard, and Restore. This feature does not write essays or decide a final argument.

Image-only or scanned PDFs that produce no meaningful text show an **OCR needed** message and do not create blank source cards. Password-protected PDFs show an unlock-first message.

Source Library data can now be exported to JSON and merged into another browser. The backup includes source records, cards in every Source Mine state, evidence gems, word groups, and reviewed count. Import merges Source Mine data by ID without replacing unrelated cave progress.

### Current limits

- OCR is not included in this phase. Use an OCR version of a scanned PDF or paste copied text.
- One PDF currently creates at most 500 cards to protect browser localStorage. The saved status says when only the first 500 cards were created.
- The user-visible GitHub Pages test is still required before this feature can be locked.

### Files added or changed

```text
docs/cave.html
docs/study-cave-pdf-import-v1.js
docs/assets/vendor/pdfjs/pdf.mjs
docs/assets/vendor/pdfjs/pdf.worker.mjs
docs/assets/vendor/pdfjs/README.md
.github/workflows/vendor-pdfjs.yml
```

### Checks completed

- `study-cave-pdf-import-v1.js` passed `node --check`.
- A selectable two-page test PDF was extracted with the pinned PDF.js build; page 1 and page 2 text were returned separately.
- An image-only PDF returned no text and followed the OCR-needed path.
- An isolated Source Mine DOM/state test confirmed that PDF cards retained page/chunk details, saved gems retained provenance, JSON export preserved Source Mine data, JSON import merged data without deleting unrelated cave state, and the existing pasted-source controls remained present.
- The hosted tool environment could not open a local browser page because of browser policy. Izzy needs to complete the final visible GitHub Pages test.

### Approval check

1. Open Source Mine → Add Source and confirm the old paste-text route still makes sieve cards.
2. Import a normal selectable-text PDF and confirm cards show the correct filename, page number, and chunk number.
3. Save one card as an evidence gem, then open Draft Route and check its citation label remains visible.
4. Test Park, Discard, Restore, Export Source Library JSON, then Import Source Library JSON.
5. Try a scanned/image-only PDF and confirm it says OCR needed rather than creating blank cards.
6. Open and close the Task Map once to confirm its approved layout was not changed. The separate old-map flash remains GitHub issue #5 and is not part of this task.

Do not mark this PDF/source import phase locked until Izzy completes the visible test and approves it.
