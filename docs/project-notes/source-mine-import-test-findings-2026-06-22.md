# Source Mine PDF import test findings — 2026-06-22

Status: **blocked for next isolated fix pass**

## Scope of the test

The full route was run from Brief Fog Quest Scroll review into Source Mine using a fictional selectable-text source PDF, `esslay_practice_source_planning_before_drafting.pdf`.

The Brief Fog → Source Mine handoff did succeed in one important respect: the Bucket Vault received these four intended ingredient labels and no longer included the setup-only `use supplied practice source` label:

- `task clarity evidence`
- `Evidence organisation`
- `Flexible revision`
- `Avoid over-planning`

## Confirmed Source Mine failures

### 1. The PDF source is massively over-split

The imported one-page practice source produced **97 waiting cards**.

This is not usable as a study-game review interaction. A normal reading should become a manageable set of meaningful extracts, not one card per tiny line/item.

Required correction:

- Replace the current PDF-to-card splitting policy with semantic chunking.
- Keep paragraphs together where possible.
- Apply a target range such as roughly 40–140 words per card, with a hard upper bound only where needed.
- Never create a card for a title, isolated heading, page number, or decorative/empty line.
- Preserve page number and chunk index after the new chunking.

### 2. Title and heading material is saved as source cards

The first two generated cards were:

1. `Esslay practice source - selectable-text PDF for Source Mine testing Page 1`
2. `Planning Before Drafting`

Neither is evidence. They should be filtered before the Crystal Sieve opens.

Required correction:

- Remove document titles, repeated running headings, short heading-only lines, page labels, and similar boilerplate during import.
- Do not make the player discard boilerplate manually.
- Use the source title field / PDF filename for provenance rather than treating title text as evidence.

### 3. Empty or boilerplate cards receive an automatic bucket tick

The first title-only card displayed `Suggested bucket: needs sorting`, but `task clarity evidence` was already ticked. The second title-only card also arrived with that bucket ticked.

This is internally contradictory and risks accidental saving of irrelevant gems.

Required correction:

- A card whose suggestion is `needs sorting` must begin with **no bucket selected**.
- Automatic bucket preselection must happen only where the confidence threshold is met and the card contains substantive text.
- Boilerplate/heading cards must be filtered before any bucket suggestion is made.

### 4. The source-card classifier is not providing a useful estimate

The first visible cards showed `Suggested bucket: needs sorting`, with no explanation of why a bucket checkbox was preselected.

Required correction:

- Show a preselected bucket only for a genuine high-confidence estimate.
- For uncertain cards, show no selected checkbox and use clear wording such as `No bucket selected yet`.
- For any automatic suggestion, show the matching phrases / rule used and a confidence label.
- The player must still be able to select another bucket or multiple buckets deliberately if the design permits it.

### 5. The first visible source card needs a better reading surface

The card exposes filename/page/chunk metadata correctly, but the extracted text is too fragmented to judge evidence meaningfully. The provenance display is usable; the card content is not.

Required correction:

- Keep filename, page number, and stable chunk index.
- Show a readable evidence passage first, then provenance in a compact line.
- Ensure no title/heading gets assigned a source-card index presented as usable evidence.

### 6. The current source-import test must stop

After two title-only cards and 97 total cards, continuing would not test user decision-making; it would only create manual cleanup work.

Do not attempt to classify the remaining imported cards. Fix the import/chunking/preselection layer first, then run a new clean source import test from an empty Source Mine library.

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

## Next fix pass: required implementation order

1. Inspect the actual Source Mine PDF extractor and card-creation code before editing.
2. Add test fixtures for title-only, heading-only, paragraph, multi-page, image-only/scanned, and repeated-header PDFs.
3. Fix text cleanup and semantic chunking first.
4. Filter boilerplate before suggestion or UI rendering.
5. Repair bucket suggestion/preselection rules: no automatic tick for `needs sorting` or low-confidence cards.
6. Add source-card suggestion explanation and confidence state.
7. Verify provenance is retained on imported cards and saved gems.
8. Test paste-text and local-PDF routes separately.
9. Start with a fresh Source Mine library and rerun a short readable source PDF.
10. Only after Source Mine is stable, return to the separate Brief Fog classifier/chunking/theme pass.

## Acceptance criteria for the retest

- A one-page short source produces a small, readable number of cards; titles/headings do not appear as cards.
- No empty/boilerplate card receives a selected bucket.
- A `needs sorting` card has all buckets unchecked.
- A high-confidence card can show one suggested bucket with a visible reason; the player can change it.
- Filename, source title/citation label, page, and stable chunk index remain attached to the card and resulting evidence gem.
- Scanned/image-only PDFs show an OCR-needed message rather than empty cards.
- Source Library export/import remains intact after the changes.
- The existing Cave Base/Task Map/Brief Fog route is not visually altered by the Source Mine fix.
