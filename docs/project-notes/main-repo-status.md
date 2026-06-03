# Main repo status

Last updated: 2026-06-03

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
- Study Skills Trial selection is now intercepted by `docs/study-cave-task-map-fallback.js` and sent to the Task Map threshold instead of the old quest placeholder panel.
- Task Map threshold can open.
- Enter Cave Base now works.
- `docs/study-cave-task-map-fallback.js` no longer owns the Cave Base or Continue Quest buttons. The newer Brief Fog route script, `docs/study-cave-enter-fix.js`, owns Cave Base, Continue Quest, Brief Fog, completion, and Source Mine placeholder behaviour.
- Cave Base scene opens using `docs/assets/study-cave/cave-base-placeholder-v01.jpg`.
- Character appears in Cave Base at a workable size.
- Character has CSS filter/drop-shadow blending.
- The rectangle lighting box bug was removed by removing the rectangular pseudo-element overlay and bumping the CSS cache to `study-cave-stage-scene.css?v=4`.
- Continue Quest opens Brief Fog scene.
- Brief Fog v0.1 now has a scene-first task workflow: task brief drawer, chunk generation, fog-patch chunk drawers, highlight categories, plain-meaning notes, action-created notes, flags, missed loot, dismissed wording, chunk state decisions, summary, and clear behaviour.
- The rendered Brief Fog task drawer now uses the button label `Suggest chunks` for the chunk-generation action.
- A safe Task Brief guard has been added in `docs/quest-board.js` to intercept Task Brief clicks inside Brief Fog, avoid rendering oversized or malformed saved data, and provide a safe reset/save drawer instead of freezing the browser.
- Brief Fog completion now returns to Cave Base, keeps Brief Fog completed, unlocks Source Mine placeholder, and updates progress to 1 / 7.
- Cave Base has compact placeholder panels for Outfit Chest, Cave Journal / Route Ledger, Completed Chamber Summary, and Flags / Missed Loot.
- Brief Fog export is available from the summary drawer as `.md`, `.txt`, and Word-openable `.doc` copy/download panels.
- Brief Fog fog patches are visual-only CSS cutscene/state patches, not clickable buttons.
- Brief Fog chunk actions save correctly and show a temporary cutscene before the chunk-saved result drawer.
- Brief Fog quest box is more translucent and fog patch oval outlines were removed.
- Brief Fog placeholder light beam now shoots from the character hand area toward the active fog/imp target during the CSS cutscene.
- Brief Fog placeholder character is flipped during the active cutscene so she faces toward the fog/imp target better until final pose art exists.
- Brief Fog cutscene direction is now: character on the left, smoke cloud / Command Imp on the right.
- Brief Fog cutscene should feel more like a short Mortal Kombat/comic-frame duel overlay than a normal room interaction.
- Brief Fog magic should read as twinkle/sparkle magic, not a hard laser beam.
- Area 3 pose-swapping is now registered in the active project-notes handover as `docs/project-notes/area-3-pose-swapping.md`.
- `docs/character-display.js` now has a safe fallback to the current default teal explorer avatar when a requested pose image is missing or fails to load.

Relevant files:

- `docs/cave.html`
- `docs/study-cave-enter-fix.js`
- `docs/study-cave-stage-scene.css`
- `docs/study-cave-task-map-fallback.js`
- `docs/quest-board.js`
- `docs/assets/study-cave/cave-base-placeholder-v01.jpg`
- `docs/assets/study-cave/brief-fog-placeholder-v01.jpg`
- `docs/character-poses.js`
- `docs/character-display.js`
- `docs/project-notes/area-3-pose-swapping.md`

## Current known issues

- Brief Fog v0.1 needs browser retesting after the Task Brief crash guard.
- Task Brief had been reported to crash/freeze the browser when clicked. A safe guard has been added, but it needs confirmation on Izzy's browser.
- Cave Base background needs sharpening. This is flagged for later asset/image work, not urgent route logic.
- Character blending is improved but still CSS-based. A better future fix is a cave-specific avatar PNG with lighting baked in.
- Brief Fog v0.1 currently uses compact drawers and placeholder CSS scene effects, not final monster animation/art.
- UI should continue avoiding long scrolling forms. Current version uses compact drawers, but this needs visual review on Izzy's screen.
- Final Area 1 cave character poses and magic-light assets are not in repo yet.
- Area 3 approved pose PNGs are not present in the repo at their mapped paths yet, so live screens should not be switched fully to pose IDs until assets or deliberate fallback behaviour are confirmed.
- Command Imp CSS placeholder reveal works as a temporary effect, but the imp fall/flee sequence is not good enough yet. Future fix: proper Command Imp art/animation or stronger CSS fall/flee keyframes.
- Brief Fog character facing/casting is currently a CSS flip and hand-spark placeholder. Future fix: Area 1 should provide final focused hand-spark and casting light-beam poses facing the fog/imp direction.
- Area 1 now needs a proper Brief Fog cutscene pose set: attack/casting pose, confident/smug follow-up pose, threat-with-sparkle pose, and scared/defensive reaction poses for later scenes.
- Final attack pose should be designed with the character on the left shooting twinkle magic toward smoke/imp on the right.
- Latest Area 1 generated outfit/pose previews were rejected because the art style was incorrect and drifted into a glossy/semi-realistic fantasy look. Do not treat them as approved assets.

## Received area responses

Received and recorded:

- Area 9 — Brief Fog v0.1 field/UI workflow. Status: completed. Saved in `docs/project-notes/area-9-brief-fog-workflow.md`.
- Area 10 — Brief Fog and Cave Base scene-first layout support. Status: completed needs further edits. Saved in `docs/project-notes/area-10-visual-scenes.md`.
- Area 11 — Brief Fog save/export structure. Status: completed. Saved in `docs/project-notes/area-11-save-export.md`.
- Area 12 — Cave Base panels and route update after Brief Fog clears. Status: completed. Saved in `docs/project-notes/area-12-route-behaviour.md`.
- Area 1 — Brief Fog character pose/effect asset plan and rejected-art-style reset. Status: needs approval / no approved preview yet. Saved in `docs/project-notes/area-1-character-assets.md`.
- Area 3 — Character pose-swapping. Status: active / safe helper added / needs asset import before live screen wiring. Saved in `docs/project-notes/area-3-pose-swapping.md`.

Still useful later:

- Area 1 — final cave character poses, cave outfits, sparkle/light overlays, and cave-specific avatar polish. Not blocking placeholder build.
- Area 3 — pose asset import and safe screen wiring after approved pose PNGs exist in repo.

## Current review status

Brief Fog v0.1 implementation status:

active / needs browser retest after Task Brief crash guard

Review question for Izzy:

- If Task Brief now opens without crashing, continue retesting Brief Fog v0.1.
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
- Area 3 owns later pose mapping once approved Cave Base pose assets exist.

Priority 3 belongs mainly to Area 11.

Persist Study Cave state cleanly.

Needed features:
- localStorage StudyCaveSaveState
- completed chambers persist
- flags and missed loot persist
- reset Study Skills Trial only
- export updated route as `.md`, `.txt`, and Word-openable `.doc`

Priority 4 belongs mainly to Area 10, Area 1, and Area 3.

Asset and pose polish.

Needed later:
- sharpen Cave Base background
- final Cave Base character pose
- final Brief Fog character magic poses
- light beam / sparkle overlays
- Command Imp placeholder or final art
- cave-specific avatar lighting asset
- approved pose PNGs imported into `docs/assets/characters/academic-adventurer/poses/`
- live screens wired to request pose IDs after pose assets exist or fallback behaviour is deliberately accepted

## Next priorities

Priority 1 review:
Test Brief Fog v0.1 in browser after the Task Brief crash guard and decide whether it is acceptable for now.

Test path:
- Open `docs/cave.html`
- Open Quest Board
- Select Study Skills Trial
- Confirm Task Map threshold opens
- Enter Cave Base
- Continue Quest
- Click Task Brief and confirm it opens without freezing the browser
- Save task brief
- Suggest chunks
- Open fog patches
- Add highlight / note / flag / missed loot / dismissal
- Mark chunks fully unpacked or parked
- Open summary
- Finish Brief Fog
- Confirm Source Mine unlocks and Cave Base shows progress 1 / 7
- Test exports from Brief Fog summary drawer
- Return to Task Map and Quest Board to confirm Source Mine/current progress displays correctly

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
Asset and pose polish.

Needed later:
- sharpen Cave Base background
- final Cave Base character pose
- final Brief Fog character magic poses
- final casting pose facing fog/imp target
- final attack pose with character on left and smoke/imp on right
- light beam / sparkle overlays
- Command Imp placeholder or final art
- Command Imp fall/flee sequence polish
- cave-specific avatar lighting asset
- approved pose PNGs imported into the pose folder
- Area 3 live screen wiring after approved pose assets exist

## Current Area 1 request needed

Area 1 should make or plan the final Brief Fog cutscene character pose set using Izzy's jester references.

Required first cutscene direction:
- character on left
- smoke cloud / Command Imp on right
- character faces and shoots toward the imp
- magic should look twinkly/sparkly, not like a hard laser beam
