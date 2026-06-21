# Cave Base UI repair — 2026-06-21

Status: needs approval

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

## What still needs visible browser approval

1. The Cave Base card must stay fully visible with no clipped left text.
2. The right-side controls must be compact and individually clickable.
3. Task Map must still open centred with its approved image, close button, and hotspots unchanged.
4. Cave entrance and normal room navigation must still work.
5. The Source Mine PDF import flow must still open from the normal route.

## Known separate issue

The Cave Base card can still display `Current chamber: Source Mine` because this older base-card copy reflects the next route state rather than the physical Cave Base screen. This wording was not changed in the layout repair, so it remains a separate, non-blocking route-copy cleanup item.

## Outside scope

- GitHub issue #5: brief old-map flash before the illustrated Task Map settles.
- Task Map visual layout.
- Cave route restructuring.
- Source Mine data/PDF behaviour.
- Final Cave art.
