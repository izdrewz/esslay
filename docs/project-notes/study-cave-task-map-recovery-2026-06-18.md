# Study Cave Task Map Recovery — 2026-06-18

## Status

Active fix applied; Izzy needs to test in browser.

## Problem found

The Study Cave entrance and Task Map were being affected by stale override code.

Main causes:

- `docs/study-cave-frame-fix-v2.js` was applying `transform: scale(1.08)` to `.game-cave.room-viewport-frame`, which could zoom/crop the cave entrance and throw off hotspot alignment.
- `docs/cave.html` was no longer loading the normal `study-cave-map-image-v1.css` stylesheet.
- `docs/study-cave-map-image-v1.js` had been disabled, so the intended illustrated map renderer was not running.
- `docs/study-cave-map-asset-v1.css` contained a stale embedded base64 map image override and could replace the intended uploaded map asset if reloaded.

## Fix applied

- Restored `study-cave-map-image-v1.css` loading in `docs/cave.html`.
- Restored `study-cave-map-image-v1.js` renderer.
- Removed `study-cave-frame-fix-v2.js` from the page and deleted it from the repo.
- Deleted stale embedded `study-cave-map-asset-v1.css`.
- Added a small route count display fix for the current 8-step Study Cave route.

## Files changed

- `docs/cave.html`
- `docs/study-cave-map-image-v1.js`
- `docs/study-cave-route-count-fix-v1.js`
- deleted `docs/study-cave-frame-fix-v2.js`
- deleted `docs/study-cave-map-asset-v1.css`

## Test

Use a fresh cache URL:

`https://izdrewz.github.io/esslay/docs/cave.html?fresh=task-map-recovery-1`

Check:

1. Cave entrance is not zoomed/cropped unexpectedly.
2. Entrance hotspots line up with the visible entrance image.
3. Task Map opens.
4. Task Map shows the uploaded `study-cave-map-v01.jpg` image, not the stale embedded asset.
5. Task Map progress shows `/ 8`.

## Remaining risk

If the user's browser has an old room viewport setting saved, clear localStorage key `esslay-room-viewport-settings-v1` or use the room view reset control if visible.
