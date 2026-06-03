# Brief Fog click freeze blocker — 2026-06-03

Status: active blocker / retest required.

Izzy reported that, inside Brief Fog, clicking Task Brief did nothing, no controls worked, and the browser appeared to freeze or crash.

Corrected diagnosis:

The Task Brief failure is likely caused by fragile rendering of saved Brief Fog data from localStorage, not a missing button.

Risk points:

- Task Brief renders saved task text directly into a textarea.
- Task Brief loops through every saved fog chunk.
- The older render path assumes every chunk has `originalText` and that it is a string.
- Old localStorage from earlier builds may have a different shape.
- Very large pasted task text or too many chunks can make the drawer too heavy.
- localStorage writes can fail if the saved object becomes too large.

What changed after the corrected diagnosis:

- `docs/study-cave-task-map-fallback.js` now sanitises Brief Fog saved data before the emergency Task Brief drawer renders.
- Missing or non-string chunk text is converted into safe recovered text.
- Task text is capped for safe rendering.
- Chunk text is capped for safe rendering.
- Saved chunks are capped before rendering.
- The visible chunk list is limited so the drawer does not render a massive list all at once.
- localStorage writes are wrapped in a fallback. If the save is too large, the code reduces the Brief Fog save and tries again.
- The emergency Task Brief drawer includes `Reset Brief Fog save` as a recovery option.

Earlier freeze mitigation remains:

- The route helper no longer injects Brief Fog click-safety CSS.
- It no longer uses a MutationObserver.
- It no longer patches Brief Fog labels through delayed re-rendering.

Known remaining risk:

- `docs/cave.html` still references `study-cave-task-map-fallback.js?v=3`, so the browser may keep loading an old cached version until a hard refresh or cache clear is done.

Retest required:

1. Close the frozen tab.
2. Open a fresh tab.
3. Hard refresh `docs/cave.html`, ideally with browser cache cleared for the site.
4. Go only as far as Brief Fog.
5. Test the X / close button first.
6. Then test Task Brief.
7. If Task Brief opens, try Save task brief and Suggest chunks.
8. If the drawer warns that saved data is too large or bad, use Reset Brief Fog save.

If the browser still freezes, stop testing. The next fix should move this sanitising logic into `docs/study-cave-enter-fix.js` directly and bump the script cache in `docs/cave.html`.
