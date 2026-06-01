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
- Continue Quest opens Brief Fog scene.
- Brief Fog v0.1 now has a scene-first task workflow: task brief drawer, chunk generation, fog-patch chunk drawers, highlight categories, plain-meaning notes, action-created notes, flags, missed loot, dismissed wording, chunk state decisions, summary, and clear behaviour.
- Brief Fog completion now returns to Cave Base, keeps Brief Fog completed, unlocks Source Mine placeholder, and updates progress to 1 / 7.
- Cave Base has compact placeholder panels for Outfit Chest, Cave Journal / Route Ledger, Completed Chamber Summary, and Flags / Missed Loot.
- Brief Fog export is available from the summary drawer as `.md`, `.txt`, and Word-openable `.doc` copy/download panels.
- Brief Fog fog patches are visual-only CSS cutscene/state patches, not clickable buttons.
- Brief Fog chunk actions save correctly and show a temporary cutscene before the chunk-saved result drawer.
- Brief Fog quest box is more translucent and fog patch oval outlines were removed.
- Brief Fog placeholder light beam now shoots from the character hand area toward the active fog/imp target during the CSS cutscene.
- Brief Fog placeholder character is flipped during the active cutscene so she faces toward the fog/imp target better until final pose art exists.

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
- Brief Fog v0.1 is implemented as a functional placeholder and needs Izzy testing before it can be marked completed locked.
- Brief Fog v0.1 currently uses compact drawers and placeholder CSS scene effects, not final monster animation/art.
- UI should continue avoiding long scrolling forms. Current version uses compact drawers, but this needs visual review on Izzy's screen.
- Final Area 1 cave character poses and magic-light assets are not in repo yet.
- Command Imp CSS placeholder reveal works as a temporary effect, but the imp fall/flee sequence is not good enough yet. Future fix: proper Command Imp art/animation or stronger CSS fall/flee keyframes.
- Brief Fog character facing/casting is currently a CSS flip and hand-spark placeholder. Future fix: Area 1 should provide final focused hand-spark and casting light-beam poses facing the fog/imp direction.

## Received area responses

Received and recorded:

- Area 9 — Brief Fog v0.1 field/UI workflow. Status: completed. Saved in `docs/project-notes/area-9-brief-fog-workflow.md`.
- Area 10 — Brief Fog and Cave Base scene-first layout support. Status: completed needs further edits. Saved in `docs/project-notes/area-10-visual-scenes.md`.
- Area 11 — Brief Fog save/export structure. Status: completed. Saved in `docs/project-notes/area-11-save-export.md`.
- Area 12 — Cave Base panels and route update after Brief Fog clears. Status: completed. Saved in `docs/project-notes/area-12-route-behaviour.md`.

Still useful later:

- Area 1 — final cave character poses, cave outfits, sparkle/light overlays, and cave-specific avatar polish. Not blocking placeholder build.

## Current review status

Brief Fog v0.1 implementation status:

active / needs Izzy review

Review question for Izzy:
- If Brief Fog v0.1 works and feels acceptable for now, mark it `completed needs further edits` because final art, monster effects, and visual polish are still future work.
- If Izzy is happy to lock this placeholder behaviour, mark route/workflow behaviour `completed locked` while keeping visual polish as future work.
- If Izzy is not happy, keep it `active` and list exact fixes needed.

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

Priority 1 review:
Test Brief Fog v0.1 in browser and decide whether it is acceptable for now.

Test path:
- Open `docs/cave.html`
- Open Quest Board
- Select Study Skills Trial
- Enter Cave Base
- Continue Quest
- Save task brief
- Suggest chunks
- Open fog patches
- Add highlight / note / flag / missed loot / dismissal
- Mark chunks fully unpacked or parked
- Open summary
- Finish Brief Fog
- Confirm Source Mine unlocks and Cave Base shows progress 1 / 7
- Test exports from Brief Fog summary drawer

Priority 2:
Improve Cave Base interaction after Izzy review if needed.

Potential future improvements:
- better hotspot placement
- clearer labels on hover
- nicer compact panel styling
- stronger visual state feedback

Priority 3:
Persist Study Cave state cleanly.

Current v0.1 uses localStorage key `esslay-study-cave-save-v01`.

Future improvement may be needed if the final data shape is moved into separate files or shared with other systems.

Priority 4:
Asset polish.

Needed later:
- sharpen Cave Base background
- final Cave Base character pose
- final Brief Fog character magic poses
- final casting pose facing fog/imp target
- light beam / sparkle overlays
- Command Imp placeholder or final art
- Command Imp fall/flee sequence polish
- cave-specific avatar lighting asset

## Coordination rule

After every repo change, update this file and any affected area note file in the same commit if the change affects design, behaviour, save logic, character assets, exports, or next steps.
