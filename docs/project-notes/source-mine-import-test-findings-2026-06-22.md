# Source Mine PDF import test findings — 2026-06-22

Status: **implementation complete; visible retest required**

## Scope of the test

The full route was run from Brief Fog Quest Scroll review into Source Mine using a fictional selectable-text source PDF, `esslay_practice_source_planning_before_drafting.pdf`.

The Brief Fog → Source Mine handoff did succeed in one important respect: the Bucket Vault received these four intended ingredient labels and no longer included the setup-only `use supplied practice source` label:

- `task clarity evidence`
- `Evidence organisation`
- `Flexible revision`
- `Avoid over-planning`

## Confirmed Source Mine failures before this pass

### 1. The PDF source was massively over-split

The imported three-page practice source produced **97 waiting cards**.

This was caused by the importer joining each positioned PDF line as a separate paragraph and then turning those lines into cards. It was code behaviour, not a corrupt or image-only PDF.

### 2. Title and heading material was saved as source cards

The first two generated cards were:

1. `Esslay practice source - selectable-text PDF for Source Mine testing Page 1`
2. `Planning Before Drafting`

Neither is evidence.

### 3. Empty or boilerplate cards received an automatic bucket tick

The first title-only card displayed `Suggested bucket: needs sorting`, but `task clarity evidence` was already ticked. The second title-only card also arrived with that bucket ticked.

### 4. The source-card classifier did not provide a useful estimate

The first visible cards showed `Suggested bucket: needs sorting`, with no explanation of why a bucket checkbox was preselected.

### 5. The first visible source card did not provide a readable extract

Filename, page, and chunk metadata were preserved, but the extracted source passages were too fragmented to judge as evidence.

## Implementation completed in this pass

New file:

- `docs/study-cave-source-mine-import-fix-v1.js`

Loader update:

- `docs/study-cave-route-count-fix-v1.js`

The new import layer deliberately leaves Brief Fog, Cave Base, Task Map, existing Source Library JSON, and the existing paste-text route untouched.

It changes only local PDF import and PDF-card presentation:

1. Rebuilds positioned PDF text into visual lines, detects larger vertical gaps, and reconstructs paragraphs.
2. Removes repeated running headers and page-label lines before card creation.
3. Attaches short headings to the following passage rather than emitting a heading-only card.
4. Groups short passages together and splits only longer passages at sentence boundaries, targeting roughly 180–760 characters per card.
5. Keeps page number, source title, citation label, filename, and a per-page chunk index on every imported card.
6. Adds high-confidence source-bucket suggestions only when one bucket has at least two distinct matched terms and beats any competing bucket.
7. Leaves every low-confidence / mixed / no-match card with no bucket selected.
8. Shows either `High-confidence suggestion` with matched terms or `No bucket selected yet` with a reason.

The existing OCR-needed route remains in place. Scanned/image-only PDFs should continue to show an OCR-needed message rather than making empty cards.

## Local checks completed

- JavaScript syntax check passed for the new import-fix file.
- The supplied source PDF was inspected directly: it has three selectable-text pages with readable paragraph content, so it is suitable for the browser PDF workflow.
- A reconstruction test using the supplied source reduced the expected output from the observed 97 micro-cards to paragraph-sized cards. The exact browser output must still be checked because PDF.js layout items can differ from the local inspection library.

## Retest instructions

The old 96/97-card source remains in the current browser save. Do not continue sorting it.

1. Hard refresh the cave page with `Ctrl + Shift + R` so the new Source Mine import layer loads.
2. Clear the existing Source Mine test cards before importing again. This should be done with a fresh Source Mine library; do not reset Brief Fog decisions unless the current interface gives no other safe way to clear only the Source Mine test source.
3. Return to Source Mine → Add Source.
4. Choose `esslay_practice_source_planning_before_drafting.pdf` again.
5. Click `Read PDF into Crystal Sieve`.
6. Confirm the card count is a manageable number of readable cards, not 97.
7. Confirm the first card is not a title-only or page-label card.
8. Confirm a card with `needs sorting` / low confidence has no checkbox preselected.
9. Confirm a genuine high-confidence card shows its matched terms and can still be changed.
10. Save one gem and confirm its filename, source title/citation label, page number, and chunk index remain visible in the later evidence record.
11. Export and import Source Library JSON after a saved gem to confirm provenance survives.

## Brief Fog issues carried into the next pass

The source-import pass must not be edited together with Brief Fog logic unless explicitly approved, but these connected issues are already logged:

- The Quest Scroll sentence splitter produced 24 cards from the short test brief and carried headings such as `Important` into card text.
- Cards 5, 10, 13, and 14 were initially marked Park for later incorrectly.
- Card 22 was initially marked as Boss Success Condition incorrectly.
- A later-task/reflection card appeared under Current Boss in the Spell Recipe before manual correction.
- Repeated source setup text was initially treated as an extra ingredient.
- Review order and fragment identifiers became untrustworthy after splitting.
- The automatic-review language must not frame the player as teaching the villainous Fog.

## UI and narrative findings to preserve for later

- `Fog Knots` is not an accepted theme/name for Brief Fog.
- Brief Fog must not frame local adaptive behaviour as the player helping the Fog learn.
- A stale/old background briefly appears before the intended Brief Fog background during entry. This is separately logged in `brief-fog-background-transition-2026-06-22.md`.
- Use UK English throughout the game: UI, source guidance, spell-check/proofreading, generated text, and test fixtures.

## Acceptance criteria for the retest

- A short, readable source produces a manageable set of meaningful cards; titles/headings do not appear as standalone cards.
- No empty/boilerplate card receives a selected bucket.
- A `needs sorting` / low-confidence card has all buckets unchecked.
- A high-confidence card can show one suggested bucket with visible matching terms; the player can change it.
- Filename, source title/citation label, page, and stable chunk index remain attached to the card and resulting evidence gem.
- Scanned/image-only PDFs show an OCR-needed message rather than empty cards.
- Source Library export/import remains intact after the changes.
- The existing Cave Base/Task Map/Brief Fog route is not visually altered by the Source Mine fix.
