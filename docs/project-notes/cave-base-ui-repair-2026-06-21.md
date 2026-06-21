# Cave Base UI repair — 2026-06-21

Status: completed needs further edits

## Scope

Repair the visible Cave Base UI regression shown in the 2026-06-21 screenshot without changing the approved illustrated Task Map, its close button, its size/placement, Task Map hotspots, Cave entrance, or GitHub issue #5 old-map flash.

## Confirmed cause

The Study Cave frame had two conflicting layers:

- `study-cave-stage-scene.css` forced the full cave frame to `transform: scale(1.32)` after the shared viewport had calculated a fitted 16:9 size.
- Later inline Cave Base rules reintroduced large percentage-based hotspot rectangles and removed the Cave Base card height limit.

At desktop size, the forced scale pushed the left card beyond the visible frame and made the old hotspot areas collide with it.

## Implemented repair

Commit `4ae4e92` updates `docs/cave.html` only.

- The Cave Base frame now explicitly uses `transform: none` with a selector that overrides the old forced scale.
- The Cave Base card is capped to the viewport, has a safe maximum width, and scrolls internally instead of spilling outside the screen.
- Cave Base, Brief Fog, and Source Mine flow controls are compact pill buttons in a right-hand stack rather than oversized translucent rectangles.
- Duplicate hotspot label pseudo-elements are disabled.
- Existing Cave Base background, route buttons, room actions, Task Map element, Task Map script, Cave entrance, and localStorage keys are unchanged.

## User acceptance on 2026-06-21

The repaired Cave Base is accepted for now so PDF/source-import testing can continue. Do not make further Cave Base layout or viewport changes during the PDF test.

## Future fixes

1. **Study Cave screen size / viewport presentation**
   - The repair changed the perceived Cave Base screen size from the previously approved presentation.
   - This does not block current use, but it needs a later isolated viewport pass.
   - Restore the intended larger Cave Base presentation without clipping the left panel, reintroducing overflow, or changing the approved Task Map presentation.

2. **Environmental clickable zones**
   - The oversized translucent boxes were removed because they were visually and functionally wrong.
   - The compact right-side controls are acceptable as a temporary placeholder.
   - Later, replace these placeholder controls with correctly positioned, compact in-scene click zones over the actual Cave Base objects. Do not restore generic oversized rectangles.

3. **Cave Base route copy**
   - The base card can still display `Current chamber: Source Mine` because this older line reflects the next route state rather than the physical Cave Base screen.
   - This is non-blocking copy cleanup for a later pass.

## What still needs visible browser approval for the PDF task

1. Open Source Mine from the Cave Base normal route.
2. Confirm pasted text still creates cards.
3. Import a selectable-text PDF, then confirm filename, source title, citation label, page number, and chunk number reach a saved evidence gem and Draft Route.
4. Confirm Park, Discard, Restore, Source Library JSON export/import, and OCR-needed handling.
5. Confirm the approved Task Map still opens centred with its image, close button, hotspots, Cave entrance, and cave UI unchanged.

## Outside scope

- GitHub issue #5: brief old-map flash before the illustrated Task Map settles.
- Task Map visual layout.
- Cave route restructuring.
- Source Mine data/PDF behaviour.
- Final Cave art.
