# Main repo status

Last updated: 2026-06-10

## Current Study Cave route status

The active Study Cave build is now a static visual-novel / click-flow cave route using browser localStorage.

Confirmed working enough to move on:

1. Brief Fog / Quest Compass
2. Source Mine / Crystal Sieve
3. Draft Route v1

Current active build:

4. Paragraph Forge v1

Still placeholder / needs real v1 logic after Paragraph Forge:

5. Bridge Hall
6. Citation Vault
7. Polish Pool
8. Submission Gate / Final Spell

## Current confirmed flow

The current working chain is:

1. Cave Base
2. Brief Fog / Quest Compass
3. Source Mine / Crystal Sieve
4. Draft Route v1
5. Paragraph Forge placeholder opens

Browser testing confirmed:

- Brief Fog passes real buckets forward:
  - planning
  - source notes
  - drafting
  - proofreading
  - referencing habits
- Source Mine can save an evidence gem to a real bucket.
- Bucket Vault shows saved evidence.
- Source Mine save persists after refresh.
- Draft Route reads Source Mine evidence gems.
- Draft Route builds a route marker from the evidence gem.
- Review Route shows the route marker.
- Continue to Paragraph Forge opens Paragraph Forge.

## Current key files

Active shell and room scripts:

- `docs/cave.html`
- `docs/study-cave-clicks-v1.js`
- `docs/study-cave-brief-fog-compass-stable-v1.js`
- `docs/study-cave-source-mine-sieve-v2.js`
- `docs/study-cave-draft-route-v1.js`
- `docs/study-cave-route-rooms-v1.js`
- `docs/study-cave-test-mode-v1.js`

Important project notes:

- `docs/project-notes/cave-next-todo-2026-06-04.md`
- `docs/project-notes/source-mine-crystal-sieve-2026-06-08.md`
- `docs/project-notes/main-repo-status.md`

Current localStorage key:

- `esslay-study-cave-simple-v1`

## Latest commits of note

- `45b58e3` — Add Draft Route planner v1
- `2fc920d` — Flag Source Mine intro improvement

## Current data chain

Brief Fog produces task buckets.

Source Mine uses those buckets to sort source cards and save evidence gems at:

- `state.sourceMine.evidenceGems`

Draft Route uses those evidence gems to build route markers at:

- `state.routeRooms["draft-route"].markers`

Paragraph Forge v1 should use those route markers to create rough paragraphs at:

- `state.routeRooms["paragraph-forge"].paragraphs`

## Current active next build: Paragraph Forge v1

Paragraph Forge currently opens, but it is still a generic placeholder from `study-cave-route-rooms-v1.js`.

Next work should make Paragraph Forge read Draft Route markers and use them as paragraph starters.

Minimum Paragraph Forge v1 behaviour:

1. Read `state.routeRooms["draft-route"].markers`.
2. Show available route markers.
3. Let Izzy choose a marker.
4. Show the evidence text and source label beside the paragraph drafting area.
5. Save a rough paragraph to `state.routeRooms["paragraph-forge"].paragraphs`.
6. Keep saved rough paragraphs after refresh.
7. Unlock Bridge Hall after at least one rough paragraph is saved.

Suggested Paragraph Forge tabs:

- Forge Paragraph
- Route Markers
- Saved Paragraphs
- Missing / Weak

## Current known issues / later polish

- Source Mine needs a first-time Begin Source Mine intro.
- Source Mine layout needs compaction.
- Draft Route marker ordering/editing is not polished yet.
- Large hotspot boxes are visually noisy and should be reduced outside test mode.
- Task Map status labels can lag behind newer route logic because older scripts still normalise route state.
- Some room scripts are temporary/hotfix-style and should be consolidated after route logic is stable.
- Final room art and character pose work are not blocking the current route build.

## Do not spend time on yet

Do not prioritise final art, pose swaps, imp/monster animation, or room background polish until Paragraph Forge v1 works.

Do not rewrite working Brief Fog, Source Mine, or Draft Route unless a specific browser test fails.

Do not restore the old blank/cream Source Notes drawer.

## Next immediate action

Build Paragraph Forge v1.