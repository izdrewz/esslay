# Brief Fog Task Scroll PDF flow — 2026-06-21

Status: needs approval

## Task

Replace the assumption that every new run begins from one manually typed question.

Brief Fog now accepts an assignment brief, exam paper, guidance PDF, or pasted task text as a **Quest Scroll**. It cuts the text into instruction fragments, lets the player decide what each fragment means for the current assignment, and creates a player-confirmed Spell Recipe before Source Mine begins.

## User model

- The assignment PDF is the Quest Scroll.
- Brief Fog is the Task Scroll Sieve.
- Task requirements become spell ingredients, rules, and boss success conditions.
- Source Mine gathers evidence crystals for the ingredients the player selected.
- The game never writes the assignment, chooses the final argument, or silently decides what matters.

## New files

- `docs/study-cave-task-scroll-core-v1.js`
- `docs/study-cave-task-scroll-ui-v1.js`
- `docs/study-cave-task-scroll-controller-v1.js`

The existing `docs/study-cave-route-count-fix-v1.js` now loads these modules after the normal cave scripts. This avoids altering `docs/cave.html`, the approved Task Map, Cave Base presentation, Cave entrance, or existing Source Mine files.

## Import behaviour

- Uses the existing pinned local PDF.js runtime under `docs/assets/vendor/pdfjs/`.
- The player selects a local `.pdf` through a browser file picker.
- The PDF is processed locally in the browser. It is not uploaded to GitHub or a server.
- Text is extracted page by page.
- Every Task Scroll fragment stores PDF filename, page number, chunk index, original text, role, note/ingredient label, and decision timestamp.
- Pasted task text remains available as a fallback.
- Image-only/scanned PDFs show an OCR-needed message rather than creating empty fragments.

## Fog Sieve roles

The player chooses one role for each fragment:

- Current Boss / task I am doing now
- Quest Part / separate subtask
- Required Evidence / ingredient to gather
- Key Scope / concept ingredient
- Crafting Rule / structure or style
- Reference Rule
- Boss Success Condition / marking target
- Admin Detail / deadline or submission fact
- Park for Later

Parked fragments remain in the Task Scroll. Nothing is silently deleted.

## Spell Recipe and Source Mine handoff

The Spell Recipe displays:

- current boss
- quest parts
- Source Mine spell ingredients
- crafting rules
- reference rules
- boss success conditions
- admin details
- parked fragments

The player must select exactly one Current Boss and at least one Required Evidence or Key Scope ingredient before continuing.

For Source Mine ingredients, the player can write a short crystal-slot name, for example `Social context evidence`. That short name becomes the Source Mine bucket. The full task-scroll fragment and its page/chunk provenance remain stored in `state.briefFog.taskMap.taskScroll.ingredients`.

Confirming the Spell Recipe creates the existing `briefFog.taskMap.buckets` and `briefFog.chunks` data expected by Source Mine. Existing Crystal Sieve, evidence gem, Draft Route, later-room, and localStorage flows are not rewritten.

## Backup

Quest Scroll data can be exported and imported as `esslay-task-scroll` JSON version 1. Import restores only Brief Fog Task Scroll/task-map data and does not reset unrelated cave state.

## Test target

Use `E104_emtma04_ task.pdf` as the visible browser test.

For this real multi-part example, expected player decisions include:

- Part 2 task: Current Boss for the essay run.
- Part 1 and Part 3: Quest Parts.
- Specific evidence from required group a and group b: Required Evidence.
- Biological/neurological, psychological, and social requirements: Key Scope.
- Objective third-person writing: Crafting Rule.
- Own words / module references: Reference Rule.
- Marking grid: Boss Success Conditions.
- Deadline, weighting, resubmission information: Admin Detail or Park for Later, according to the player’s current need.

## Checks completed before browser approval

- The three new modules passed local JavaScript syntax checks.
- Mocked browser DOM/state testing confirmed manual Quest Compass fallback, Quest Scroll import, page-aware fragments, player sorting, Spell Recipe confirmation, and Source Mine handoff.
- A local PDF.js read of the E104 example returned seven pages and page-aware task fragments.
- The hosted visual GitHub Pages flow still needs Izzy’s browser test.

## Visible approval test

1. Reset the Study Cave save for a new run.
2. Enter Brief Fog through the normal route.
3. Confirm `Bring Quest Scroll` appears without changing the approved Task Map or Cave Base.
4. Import a selectable-text assignment PDF.
5. Confirm a Fog Sieve fragment shows the filename, page number, and fragment number.
6. Sort fragments, including one Current Boss and at least one short-named ingredient.
7. Confirm Spell Recipe → Source Mine.
8. Confirm Source Mine buckets are the player’s ingredient labels, not generic study-skills buckets.
9. Import a source PDF and save an evidence gem into an ingredient bucket.
10. Confirm Draft Route still receives the evidence gem.
11. Test image-only task PDF OCR-needed handling and Task Scroll JSON export/import separately.
12. Open and close the approved Task Map once. Issue #5 old-map flash remains separate.

## Known limits

- OCR is not included. Image-only/scanned task PDFs need an OCR copy or pasted text.
- Fragments are rule-based chunks, not AI claims about what the task means.
- The user must choose roles, ingredient labels, current boss, and final argument.
- Task Scroll feature is not locked until Izzy completes the visible browser run and approves it.
