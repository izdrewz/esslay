# Main repo status

Last updated: 2026-06-16

## Current Home Base / Garden status

Current active focus: Home Base + Garden / XP progression direction.

The 8-stage XP Garden progression image assets are installed in:

- `docs/assets/rooms/garden/`

The Garden room shell is implemented through:

- `docs/garden.html`
- `docs/garden.css`
- `docs/garden.js`

Shared room viewport fitting is now a repo-wide room system through:

- `docs/room-viewport.css`
- `docs/room-viewport.js`

Shared viewport behaviour:

- dynamically fits a 16:9 room frame to the current browser viewport
- supports top reserve and bottom safety spacing for pages with separate headers
- keeps room art contained rather than cropped where image art is involved
- adds a medieval fantasy frame/backdrop so gaps look intentional
- provides a small in-game View control: smaller / reset / larger
- places the View control into a page header/top-bar slot when available
- saves per-room view scale in `localStorage` key `esslay-room-viewport-settings-v1`

Current applied room/screen shells:

- `docs/garden.html`
- `docs/house.html`
- `docs/cave.html`
- `docs/edit-room.html`
- `docs/hub.html`
- `docs/domestic.html`
- `docs/training.html`

Testing rule: if viewport fitting breaks on one room, fix the shared viewport or that room's viewport data instead of creating separate one-off screen-size hacks.

Home Base currently links to the Garden with a temporary nav link in `docs/house.html`. This is not the final Home Base door design. Later Home Base redesign should use in-scene doors / room transitions.

Home task completion now credits Garden XP through:

- `docs/garden-xp-bridge.js`

This bridge listens for successful Home task completion and credits +5 Garden XP to `localStorage` key `esslay-garden-state-v1`. It stores credited Home task instance IDs so the same task instance is not repeatedly credited.

Garden art status: approved implementation asset set, not locked final art unless Izzy later explicitly marks it locked final.

Relevant note:

- `docs/project-notes/home-garden-exterior-direction-2026-06-12.md`

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

Current status: route logic works. The shared viewport was applied to the Study Cave shell only; the existing Study Cave route scripts were not rewritten.

## Current confirmed Study Cave flow

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

Active Study Cave shell and room scripts:

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

Home/Garden/room shell files:

- `docs/house.html`
- `docs/house.css`
- `docs/house-no-scroll-ui.css`
- `docs/house-no-scroll-ui.js`
- `docs/home-life-admin-room-map.css`
- `docs/home-life-admin-room-map.js`
- `docs/home-life-admin-task-board.css`
- `docs/home-life-admin-task-board.js`
- `docs/garden.html`
- `docs/garden.css`
- `docs/garden.js`
- `docs/garden-xp-bridge.js`
- `docs/edit-room.html`
- `docs/hub.html`
- `docs/domestic.html`
- `docs/training.html`
- `docs/room-viewport.css`
- `docs/room-viewport.js`

Important project notes:

- `docs/project-notes/cave-next-todo-2026-06-04.md`
- `docs/project-notes/source-mine-crystal-sieve-2026-06-08.md`
- `docs/project-notes/home-garden-exterior-direction-2026-06-12.md`
- `docs/project-notes/main-repo-status.md`

Current localStorage keys:

- Study Cave: `esslay-study-cave-simple-v1`
- Home Base: `esslay-house-state-v4`
- Garden: `esslay-garden-state-v1`
- Shared room viewport: `esslay-room-viewport-settings-v1`

## Latest commits of note

- `45b58e3` — Add Draft Route planner v1
- `14e38c6` — Add Paragraph Forge shortcut to Draft Route planner
- `9fae88b` — Add Bridge Hall v1
- `fafb057` — Add Citation Vault v1
- `5dc0708` — Load Citation Vault v1
- `5533a80` — Add Polish Pool v1
- `6ccd594` — Add Submission Gate v1
- `851736b` — Load Submission Gate v1
- `e9ab047` — Add XP Garden progression image assets
- `cf90d8d` — Add XP Garden room shell
- `e4076d6` — Add XP Garden progression logic
- `3478deb` — Connect Home tasks to Garden XP
- `6998383` — Add shared room viewport styles
- `5590418` — Add shared room viewport controls
- `5db21a9` — Move Garden view controls into top bar
- `aaa07e9` — Support room viewport top reserve
- `d34e452` — Apply shared viewport to Home Base
- `15e21e3` — Apply shared viewport to Edit Room
- `4aa8abe` — Apply shared viewport to Quest Village
- `da76ed6` — Restore Notebook Shrine label
- `f47ed66` — Apply shared viewport to Domestic board shell
- `36ac485` — Apply shared viewport to training shell
- `baf3b52` — Apply shared viewport to Study Cave
- `785ae7c` — Bump Garden shared viewport cache
- `5145099` — Update shared viewport rollout note

## Current Study Cave data chain

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

## Current active next work

Viewport rollout test order:

1. Test `garden.html` first because it is the confirmed working reference.
2. Test `house.html`, especially whether the room image, task board, and mirror still open.
3. Test `cave.html`, especially Enter cave, Task Map, route drawers, and Full screen.
4. Test `edit-room.html`, especially the stage fit and hotspots.
5. Test `hub.html`, `domestic.html`, and `training.html` as placeholder/future-room shells.
6. If one room fails, fix the shared viewport or that room's viewport data.

For Home Base / Garden direction:

1. Confirm each XP threshold swaps the image correctly.
2. Confirm a Home task marked done adds +5 Garden XP once.
3. Later, redesign Home Base navigation so Garden is reached through an in-world door / room transition.

For Study Cave cleanup later:

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

- Shared viewport has now been applied across current room/screen shells and needs cross-room browser testing.
- Home Base will be redesigned later so room routes use doors / in-scene transitions instead of only nav links.
- Garden art is implemented for progression use but not locked final unless Izzy explicitly locks it.
- Garden XP currently comes from Home task completion. Study Cave completion can be connected later.
- Source Mine needs a first-time Begin Source Mine intro.
- Source Mine layout needs compaction.
- Draft Route marker ordering/editing is not polished yet.
- Large hotspot boxes are visually noisy and should be reduced outside test mode.
- Task Map status labels can lag behind newer route logic because older scripts still normalise route state.
- Some room scripts are temporary/hotfix-style and should be consolidated after route logic is stable.
- Test Mode can open rooms directly, but normal route navigation should remain the source of truth.
- GitHub Pages cache needs version bumps and hard refreshes after changes.
- Final Study Cave room art and character pose work are not blocking the current route build.

## Do not spend time on yet

Do not rewrite working Brief Fog, Source Mine, Draft Route, Paragraph Forge, Bridge Hall, Citation Vault, Polish Pool, or Submission Gate unless a specific browser test fails.

Do not restore the old blank/cream Source Notes drawer.

Do not mark Garden art as locked final unless Izzy explicitly approves it as locked final.
