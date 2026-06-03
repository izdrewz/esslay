# Brief Fog task brief click fix — 2026-06-03

Status: active / retest required.

Izzy reported that after the freeze was removed, leaving Brief Fog worked again but clicking Task Brief still did not open anything.

Current fix:

- Added a narrow emergency Task Brief handler in `docs/study-cave-task-map-fallback.js`.
- The handler catches only `[data-brief-panel="task"]` clicks before the older Brief Fog handler.
- It opens an emergency Task Brief drawer inside the current Brief Fog scene.
- The drawer supports Save task brief and Suggest chunks.
- This does not replace the full Brief Fog workflow. It is a targeted unblocker for the broken Task Brief trigger.

Why this was done:

The original Task Brief handler still exists in `docs/study-cave-enter-fix.js`, so the button was not missing. The practical issue was that the click path was not opening the drawer in the browser. A narrow handler avoids rewriting the whole Brief Fog implementation while restoring access to the task brief.

Retest required:

1. Hard refresh or clear site cache.
2. Enter Brief Fog.
3. Click Task Brief from the scene/card.
4. Confirm the Task Brief drawer opens.
5. Try Save task brief.
6. Try Suggest chunks.

If this works, continue the Brief Fog v0.1 test. If it fails, the next fix should move the Task Brief drawer into the default Brief Fog render so it is visible without relying on a click trigger.
