# Main repo status

Last updated: 2026-06-11

## Current Study Cave route status

The active Study Cave build is now a static visual-novel / click-flow cave route using browser localStorage.

Full Study Cave v1 route is now browser-tested and passing end-to-end:

1. Brief Fog / Quest Compass
2. Source Mine / Crystal Sieve
3. Draft Route v1
4. Paragraph Forge v1
5. Bridge Hall v1
6. Citation Vault v1
7. Polish Pool v1
8. Submission Gate / Final Spell v1

Current status: route logic works. Next work should be cleanup, consolidation, UX polish, and stronger real-assignment content handling.

## Current confirmed flow

The current working chain is:

1. Cave Base
2. Brief Fog / Quest Compass
3. Source Mine / Crystal Sieve
4. Draft Route v1
5. Paragraph Forge v1
6. Bridge Hall v1
7. Citation Vault v1
8. Polish Pool v1
9. Submission Gate / Final Spell v1

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
- Draft Route now has a direct Continue to Paragraph Forge shortcut when route markers exist.
- Paragraph Forge reads Draft Route markers.
- Paragraph Forge saves rough paragraphs and unlocks Bridge Hall.
- Bridge Hall reads rough paragraphs.
- Bridge Hall saves bridge/signpost links and unlocks Citation Vault.
- Citation Vault reads bridge links.
- Citation Vault saves citation checks and unlocks Polish Pool.
- Polish Pool reads citation checks.
- Polish Pool saves polish fixes and unlocks Submission Gate.
- Submission Gate reads polish fixes.
- Submission Gate saves the final check and marks the route complete.

## Current key files

Active shell and room scripts:

- `docs/cave.html`
- `docs/study-cave-clicks-v1.js`
- `docs/study-cave-brief-fog-compass-stable-v1.js`
- `docs/study-cave-source-mine-sieve-v2.js`
- `docs/study-cave-draft-route-v1.js`
- `docs/study-cave-paragraph-forge-v1.js`
- `docs/study-cave-bridge-hall-v1.js`
- `docs/study-cave-citation-vault-v1.js`
- `docs/study-cave-polish-pool-v1.js`
- `docs/study-cave-submission-gate-v1.js`
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
- `14e38c6` — Add Paragraph Forge shortcut to Draft Route planner
- `9fae88b` — Add Bridge Hall v1
- `fafb057` — Add Citation Vault v1
- `5dc0708` — Load Citation Vault v1
- `5533a80` — Add Polish Pool v1
- `6ccd594` — Add Submission Gate v1
- `851736b` — Load Submission Gate v1

## Current data chain

Brief Fog produces task buckets.

Source Mine uses those buckets to sort source cards and save evidence gems at:

- `state.sourceMine.evidenceGems`

Draft Route uses those evidence gems to build route markers at:

- `state.routeRooms["draft-route"].markers`

Paragraph Forge uses those route markers to create rough paragraphs at:

- `state.routeRooms["paragraph-forge"].paragraphs`

Bridge Hall uses rough paragraphs to create bridge/signpost links at:

- `state.routeRooms["bridge-hall"].links`

Citation Vault uses bridge links to create citation checks at:

- `state.routeRooms["citation-vault"].checks`

Polish Pool uses citation checks to create polish fixes at:

- `state.routeRooms["polish-pool"].fixes`

Submission Gate uses polish fixes to create final readiness checks at:

- `state.routeRooms["submission-gate"].checks`

## Current active next work: cleanup and route hardening

The next phase should not be another new room. The next phase should stabilise and clean up the completed v1 route.

Priority cleanup:

1. Consolidate old route placeholder handling so the new v1 rooms cannot fall back into old generic shells.
2. Clean Task Map status labels so locked / current / complete states reflect the new v1 route accurately.
3. Improve room-to-room buttons so the normal route is obvious without relying on Test Mode.
4. Reduce large hotspot boxes outside test mode.
5. Compact Source Mine and later-room panels so they are less visually heavy.
6. Add first-time intro / Begin Source Mine step.
7. Make Draft Route marker ordering, editing, removal, and reordering clearer.
8. Improve real-assignment wording so the route feels less like placeholder demo content.
9. Add export/copy helpers at Submission Gate.
10. Decide when to consolidate hotfix-style scripts into fewer stable route modules.

## Known issues / later polish

- Source Mine needs a first-time Begin Source Mine intro.
- Source Mine layout needs compaction.
- Draft Route marker ordering/editing is not polished yet.
- Large hotspot boxes are visually noisy and should be reduced outside test mode.
- Task Map status labels can lag behind newer route logic because older scripts still normalise route state.
- Some room scripts are temporary/hotfix-style and should be consolidated after route logic is stable.
- Test Mode can open rooms directly, but normal route navigation should remain the source of truth.
- GitHub Pages cache needs version bumps and hard refreshes after changes.
- Final room art and character pose work are not blocking the current route build.

## Do not spend time on yet

Do not prioritise final art, pose swaps, imp/monster animation, or room background polish until the route cleanup pass is done.

Do not rewrite working Brief Fog, Source Mine, Draft Route, Paragraph Forge, Bridge Hall, Citation Vault, Polish Pool, or Submission Gate unless a specific browser test fails.

Do not restore the old blank/cream Source Notes drawer.

## Next immediate action

Start a cleanup pass for the completed v1 route, beginning with old-route-shell fallback prevention and Task Map status clarity.