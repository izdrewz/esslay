# Main repo status

Last updated: 2026-05-31

## Current locked Study Cave flow

The Study Cave opening flow is now:

1. Study Cave entrance
2. Quest Board
3. Task Map threshold
4. Cave Base
5. Brief Fog / Question-Unpacking Chamber
6. Source Mine placeholder

The old first-chamber flow is outdated:

- Task Intake Chamber as first separate chamber
- Command Word Gate as second separate chamber

Those are now absorbed into Brief Fog / Question-Unpacking Chamber.

## Current implemented state

Implemented in repo:

- `docs/cave.html` uses the new Study Cave scene shell.
- Quest Board can open.
- Study Skills Trial can be selected.
- Task Map threshold can open.
- Enter Cave Base now works.
- Cave Base scene opens using `docs/assets/study-cave/cave-base-placeholder-v01.jpg`.
- Character appears in Cave Base at a workable size.
- Character has CSS filter/drop-shadow blending.
- The rectangle lighting box bug was removed by removing the rectangular pseudo-element overlay and bumping the CSS cache to `study-cave-stage-scene.css?v=4`.
- Continue Quest opens Brief Fog scene placeholder.

Relevant files:

- `docs/cave.html`
- `docs/study-cave-enter-fix.js`
- `docs/study-cave-stage-scene.css`
- `docs/study-cave-task-map-fallback.js`
- `docs/assets/study-cave/cave-base-placeholder-v01.jpg`
- `docs/assets/study-cave/brief-fog-placeholder-v01.jpg`

## Current known issues

- Cave Base background needs sharpening. This is flagged for later asset/image work, not urgent route logic.
- Character blending is improved but still CSS-based. A better future fix is a cave-specific avatar PNG with lighting baked in.
- Brief Fog is currently placeholder-level and needs the real scene-first chunk/highlight workflow.
- UI should avoid long scrolling forms. Use compact panels, hotspots, click-to-open cards, and hover/tap previews.
- Final Area 1 cave character poses and magic-light assets are not in repo yet.

## Received area responses

Received and recorded:

- Area 9 — Brief Fog v0.1 field/UI workflow. Status: completed. Saved in `docs/project-notes/area-9-brief-fog-workflow.md`.
- Area 11 — Brief Fog save/export structure. Status: completed. Saved in `docs/project-notes/area-11-save-export.md`.

Still useful before or during implementation:

- Area 10 — scene-first layout for Brief Fog panels, fog patches, flag marker, missed-loot stash, route-forward placement, placeholder effects, and Cave Base sharpening guidance.
- Area 12 — exact Cave Base panel behaviour and route updates after Brief Fog clears.
- Area 1 — final cave character poses, cave outfits, sparkle/light overlays, and cave-specific avatar polish. Not blocking placeholder build.

## Priority ownership by area

Priority 1 belongs mainly to Area 9, with support from Area 10, Area 11, and Area 12.

Build Brief Fog / Question-Unpacking Chamber v0.1 as a usable scene-first workflow.

Area ownership:
- Area 9 owns the academic chunk/highlight workflow.
- Area 10 owns the scene-first visual layout, clickable object placement, fog patches, and visual states.
- Area 11 owns saving chunks, highlights, notes, flags, missed loot, completion, and export data.
- Area 12 owns how Brief Fog opens from Cave Base, how progress returns to Task Map/Cave Base, and how Source Mine unlocks.
- Area 1 owns character pose/effect assets later, but it is not blocking the placeholder build.

Priority 2 belongs mainly to Area 12 and Area 11, with Area 10 support.

Improve Cave Base interaction.

Area ownership:
- Area 12 owns Cave Base behaviour, buttons, return flow, and route state.
- Area 11 owns Cave Base persistence, progress, flags, missed loot, and outfit override save fields.
- Area 10 owns Cave Base visual hotspot placement and background/asset polish.
- Area 1 owns final Cave Base character/outfit/chest poses later.

Priority 3 belongs mainly to Area 11.

Persist Study Cave state cleanly.

Needed features:
- localStorage StudyCaveSaveState
- completed chambers persist
- flags and missed loot persist
- reset Study Skills Trial only
- export updated route as `.md`, `.txt`, and Word-openable `.doc`

Priority 4 belongs mainly to Area 10 and Area 1.

Asset polish.

Needed later:
- sharpen Cave Base background
- final Cave Base character pose
- final Brief Fog character magic poses
- light beam / sparkle overlays
- Command Imp placeholder or final art
- cave-specific avatar lighting asset

## Next priorities

Priority 1:
Build Brief Fog / Question-Unpacking Chamber v0.1 as a usable scene-first workflow.

Needed features:
- raw task text input
- split into chunks
- chunk cards
- highlight category selection
- plain-meaning note
- action-created note
- flag button
- missed loot button
- dismissal reason
- chunk state
- completion check that every chunk has a decision
- output cards for command words, keywords, scope/limits, source requirements, task demand summary
- save/export support from Area 11

Priority 2:
Improve Cave Base interaction.

Needed features:
- outfit chest placeholder panel
- cave journal / route ledger panel
- completed chamber summary panel
- flags/missed loot panel
- clearer continue route hotspot

Priority 3:
Persist Study Cave state cleanly.

Needed features:
- localStorage StudyCaveSaveState
- completed chambers persist
- flags and missed loot persist
- reset Study Skills Trial only
- export updated route as `.md`, `.txt`, and Word-openable `.doc`

Priority 4:
Asset polish.

Needed later:
- sharpen Cave Base background
- final Cave Base character pose
- final Brief Fog character magic poses
- light beam / sparkle overlays
- Command Imp placeholder or final art
- cave-specific avatar lighting asset

## Coordination rule

After every repo change, update this file and any affected area note file in the same commit if the change affects design, behaviour, save logic, character assets, exports, or next steps.
