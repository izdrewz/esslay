# Cave next to-do — current route build

Status: full Study Cave v1 route passing / cleanup phase next

Last updated: 2026-06-11

## Current confirmed progress

The Study Cave v1 route is now working end-to-end in browser testing:

1. Brief Fog / Quest Compass — passing.
2. Source Mine / Crystal Sieve — passing.
3. Draft Route v1 — passing.
4. Paragraph Forge v1 — passing.
5. Bridge Hall v1 — passing.
6. Citation Vault v1 — passing.
7. Polish Pool v1 — passing.
8. Submission Gate / Final Spell v1 — passing.

The next step is not another new room. The next step is cleanup, route hardening, UX polish, and reducing old placeholder/fallback behaviour.

## Confirmed browser tests

### Brief Fog

Confirmed:
- real Brief Fog route can be entered from Cave Base
- Quest Compass shows the full task meaning and real buckets
- real buckets passed forward correctly:
  - planning
  - source notes
  - drafting
  - proofreading
  - referencing habits

Still needed later:
- visual polish
- less visually noisy hotspot outlines outside test mode
- final visual-novel style intro/state art

### Source Mine / Crystal Sieve

Confirmed:
- Source Mine opens from Brief Fog
- Add Source works
- Seed demo cards works
- Crystal Sieve shows one card at a time
- real Brief Fog buckets are used, not only generic test buckets
- saving an evidence gem works
- Bucket Vault shows the saved evidence gem
- parked / restored card logic worked in testing
- browser refresh keeps the saved Source Mine data

Important current data shape:
- source cards live in `state.sourceMine.sieveQueue`
- saved evidence lives in `state.sourceMine.evidenceGems`
- each evidence gem stores bucket, source label, evidence text, note/link, matched words, and timestamp

Still needed later:
- first-time intro / Begin Source Mine step
- layout compaction
- clearer wording for multi-bucket matches
- make strongest match the only auto-ticked bucket by default
- show source labels in Bucket Vault previews more clearly
- hide or reduce giant hotspot boxes outside test mode
- do not restore the old cream Source Notes drawer

### Draft Route v1

Implemented by commits:
- `45b58e3` — Add Draft Route planner v1
- `14e38c6` — Add Paragraph Forge shortcut to Draft Route planner

Confirmed:
- Draft Route opens from the current route after Source Mine has evidence
- Draft Route reads Source Mine evidence gems
- Route Planner shows evidence-gem counts by bucket
- Build route from evidence gems creates a route marker
- Review Route shows the saved route marker
- Continue to Paragraph Forge opens Paragraph Forge
- Route Planner now also shows Continue to Paragraph Forge when at least one route marker exists

Important current data shape:
- route markers live in `state.routeRooms["draft-route"].markers`
- each marker stores bucket, focus/title, evidence text, source label, note/purpose, and evidenceGemId

Still needed later:
- route marker ordering controls need a proper UI pass
- route markers should eventually be editable, removable, and reorderable
- Draft Route should feel more like a path/route mini-game, not only a panel
- Task Map node status still needs polish so locked/unlocked/current labels stay intuitive

### Paragraph Forge v1

Confirmed:
- Paragraph Forge opens from Draft Route and Test Mode
- it reads Draft Route markers
- Forge Paragraph tab shows the marker/evidence
- Route Markers tab works
- Missing tab works
- Save rough paragraph works
- Saved Paragraphs shows the saved rough paragraph
- Bridge Hall unlocks after a rough paragraph is saved

Important current data shape:
- rough paragraphs live in `state.routeRooms["paragraph-forge"].paragraphs`
- each paragraph stores markerId, bucket, citationLabel, focus, paragraph text, evidence, needs, and timestamps

Still needed later:
- paragraph text should become more genuinely useful for real assignments
- better edit/remove controls
- better visual distinction between evidence and paragraph draft
- reduce old generic route-shell fallback risk

### Bridge Hall v1

Confirmed:
- Bridge Hall opens from Paragraph Forge
- it reads saved rough paragraphs
- Build Bridge tab works
- Paragraphs tab works
- Save bridge link works
- Saved Bridges shows the saved bridge link
- Citation Vault unlocks after a bridge link is saved

Important current data shape:
- bridge/signpost links live in `state.routeRooms["bridge-hall"].links`

Still needed later:
- better multi-paragraph transition logic
- drag/reorder or explicit paragraph ordering
- clearer language for signposting vs explanation

### Citation Vault v1

Confirmed:
- Citation Vault opens from Bridge Hall
- it reads saved bridge links
- Check Citation tab works
- Bridge Links tab works
- Save citation check works
- Saved Checks shows the saved citation check
- Polish Pool unlocks after a citation check is saved

Important current data shape:
- citation checks live in `state.routeRooms["citation-vault"].checks`

Still needed later:
- real citation fields should be more structured
- should distinguish source label, author/year/page, URL, timestamp, and module/unit details
- should better flag placeholder/demo sources

### Polish Pool v1

Confirmed:
- Polish Pool opens from Citation Vault
- it reads saved citation checks
- Polish Fix tab works
- Citation Checks tab works
- Save polish fix works
- Saved Fixes shows the saved polish fix
- Submission Gate unlocks after a polish fix is saved

Important current data shape:
- polish fixes live in `state.routeRooms["polish-pool"].fixes`

Still needed later:
- improve proofreading categories
- make final wording more student-friendly
- add checks for clarity, repetition, citation placeholders, and missing links

### Submission Gate / Final Spell v1

Confirmed:
- Submission Gate opens from Polish Pool
- it reads saved polish fixes
- Final Spell tab works
- Route Summary tab works
- Save final check works
- Saved Checks shows the saved final check
- browser save says route complete

Important current data shape:
- final checks live in `state.routeRooms["submission-gate"].checks`
- `state.finalSpellComplete` may be set true when final spell is completed

Still needed later:
- export/copy helper
- final checklist should be more useful and less placeholder
- should show a clear “route complete” state on Task Map

## Current data chain

Brief Fog produces task buckets.

Source Mine saves evidence gems at:

- `state.sourceMine.evidenceGems`

Draft Route saves route markers at:

- `state.routeRooms["draft-route"].markers`

Paragraph Forge saves rough paragraphs at:

- `state.routeRooms["paragraph-forge"].paragraphs`

Bridge Hall saves bridge/signpost links at:

- `state.routeRooms["bridge-hall"].links`

Citation Vault saves citation checks at:

- `state.routeRooms["citation-vault"].checks`

Polish Pool saves polish fixes at:

- `state.routeRooms["polish-pool"].fixes`

Submission Gate saves final readiness checks at:

- `state.routeRooms["submission-gate"].checks`

## Current known code/UX issues

- There are still older placeholder scripts in the route. Some old Task Map labels can lag behind the newer room logic.
- Several new v1 rooms were added as separate hotfix-style scripts and should eventually be consolidated.
- GitHub Pages cache needs version bumps and hard refreshes after changes.
- Some large hotspot boxes are visually distracting.
- The current implementation uses localStorage key `esslay-study-cave-simple-v1`.
- Source Mine and Draft Route now use newer localStorage structures, while older code still normalises/reshapes some save state.
- Future consolidation is needed once the route behaviour is stable.
- Test Mode is useful, but the normal route should stay the source of truth.

## Cleanup priorities

1. Prevent old route-shell fallback from taking over any new v1 room.
2. Clean Task Map status labels for complete/current/locked/unlocked route nodes.
3. Make normal route buttons obvious so Test Mode is not needed for normal navigation.
4. Reduce or hide giant hotspot boxes outside test mode.
5. Compact Source Mine, Draft Route, and later-room panels.
6. Add Source Mine first-time intro / Begin Source Mine step.
7. Add edit/remove/reorder controls for Draft Route markers and later saved items.
8. Improve real-assignment language across Paragraph Forge, Citation Vault, Polish Pool, and Submission Gate.
9. Add Submission Gate copy/export helper.
10. Consolidate temporary scripts after behaviour is stable.

## Do not do yet

Do not spend time on final art, final CGs, pose swaps, monster/imp animation, or room background polish until the route cleanup pass is done.

Do not rewrite working Brief Fog, Source Mine, Draft Route, Paragraph Forge, Bridge Hall, Citation Vault, Polish Pool, or Submission Gate logic unless a specific browser test fails.

Do not restore old blank/cream Source Notes style UI.

## Immediate next action

Start a cleanup pass for the completed Study Cave v1 route.