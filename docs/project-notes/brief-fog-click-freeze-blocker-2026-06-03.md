# Brief Fog click freeze blocker — 2026-06-03

Status: active blocker / retest required.

Izzy reported that, inside Brief Fog, clicking Task Brief did nothing, no controls worked, and the browser appeared to freeze or crash.

What changed after the freeze report:

- `docs/study-cave-task-map-fallback.js` was replaced with a minimal safe route helper.
- It no longer injects Brief Fog click-safety CSS.
- It no longer uses a MutationObserver.
- It no longer tries to patch Brief Fog labels or controls.
- It only opens Quest Board, Study Skills Trial → Task Map, Task Map, and Back to Quest Board.
- Brief Fog controls are now left to `docs/study-cave-enter-fix.js`.

Known remaining risk:

- `docs/cave.html` still references `study-cave-task-map-fallback.js?v=3`, so the browser may keep loading an old cached freezing version until a hard refresh or cache clear is done.

Retest required:

1. Close the frozen tab.
2. Open a fresh tab.
3. Hard refresh `docs/cave.html`, ideally with browser cache cleared for the site.
4. Go only as far as Brief Fog.
5. Test the X / close button first.
6. Then test Task Brief.

If the browser still freezes, stop testing. The next fix should remove cutscene-active behaviour from the default Brief Fog render or make Brief Fog open the Task Brief drawer by default so invisible hotspots are not required.
