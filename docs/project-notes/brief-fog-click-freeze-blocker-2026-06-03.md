# Brief Fog click freeze blocker — 2026-06-03

Status: active blocker / retest required.

Izzy reported that, inside Brief Fog, clicking Task Brief did nothing, no controls worked, and the browser appeared to freeze or crash.

Likely cause found:

- The CSS has a `cutscene-active` state that disables pointer events on the Brief Fog close button and hotspots.
- A first attempted safety patch added a MutationObserver to reapply click safety and label fixes.
- That observer may have contributed to browser instability, so it was removed.

Current code state after fix:

- Static click-safety CSS is injected once from `docs/study-cave-task-map-fallback.js`.
- The MutationObserver loop has been removed.
- The click-safety rule keeps Brief Fog close button, `data-brief-panel`, `data-next-chunk`, and hotspot controls clickable during cutscene-active states.

Retest required:

1. Close the frozen tab if needed.
2. Open a fresh tab.
3. Hard refresh `docs/cave.html`.
4. Enter Brief Fog.
5. First test the X / close button.
6. Then test Task Brief.

If the browser still freezes, do not keep clicking. The next fix should remove the cutscene-active class from the default Brief Fog render or move cutscene effects so they cannot disable the working UI.
