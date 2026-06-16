# Shared viewport auto-fit correction — 2026-06-16

## Status

The visible Fit / Wide / Fill / Reset / plus / minus controls were rejected because they made the room header more cluttered while not solving the Home Base layout problem.

Current correction:

- `docs/room-viewport-auto.js` was added as the clean automatic fitter.
- `docs/house.html` now loads `room-viewport-auto.js?v=1`.
- `docs/garden.html` now loads `room-viewport-auto.js?v=1`.
- `docs/room-viewport.css` now hides `.room-viewport-controls` and `[data-room-viewport-controls-slot]` by default so old visible viewport controls do not clutter room headers.
- `docs/house-viewport-fix.css` was added to stop the Home Base room image being treated as a smaller left-side scene inside a larger empty frame.

## Home Base correction

The Home Base viewport frame is now the outer `.room-shell`, not the inner `.room-stage`.

Reason:

- When the inner `.room-stage` was the fitted frame, the outer `.room-shell` could remain wider and show dead empty space on the right.
- The correct structure is: `.room-shell` is the fitted visual frame, and `.room-stage` fills it.

Implemented structure:

- `section.room-shell.room-viewport-frame[data-room-viewport-frame]`
- inner `div.room-stage` fills the frame

## Home Base floating menu button + zoom — 2026-06-16

The left rail was still too much UI and made the menu feel inaccessible. The corrected direction is now:

- no top control bar
- no full vertical rail
- one small floating menu button on the far left edge
- menu opens as an overlay drawer from the left
- scene is zoomed slightly with a medieval border/backdrop so wide-screen gaps feel intentional

Current files:

- `docs/house.html`
- `docs/house-side-menu.css`
- `docs/house-side-menu.js`

Current Home Base layout behaviour:

- `docs/house.html` uses `data-room-viewport-padding="8"` and no top reserve so the scene can use more of the screen.
- `docs/house-side-menu.css` places the menu button as a fixed floating tab at the left edge.
- `docs/house-side-menu.css` scales the room frame to `1.11` on desktop to make the image visibly larger.
- The frame uses a stronger medieval border/shadow so any remaining gaps read as an intentional game frame.
- The side menu drawer overlays the scene and does not push or squeeze it.

Side menu contents:

- Room: Open room map, Edit Room, Wardrobe / home items
- Tasks: Today’s tasks, Life Admin Rooms, Wallet
- Travel: Study Cave, Garden, Village, Idle
- Info: Asset credits

Important behaviour:

- the drawer overlays the scene instead of pushing or squeezing the room image
- the drawer closes from its Close button, Escape, backdrop click, or when a menu action opens a panel/page
- `docs/home-life-admin-room-map.js` skips adding duplicate Life Admin buttons to the header when the side menu exists
- duplicate task/header buttons are suppressed by `docs/house-side-menu.css` while the in-scene Tasks hotspot still remains

## Current rule

Screen fitting should be automatic first.

Do not expose viewport-size controls in every room header by default. If manual view controls return later, they should be tucked into a small settings/menu interaction, not displayed as a row of pills.

Home Base navigation should stay scene-first. Avoid putting every route/tool in a horizontal top header.

## Test focus

Test first:

- `docs/house.html`
- `docs/garden.html`

Expected Home Base result:

- no visible Fit / Wide / Fill / Reset / plus / minus controls
- no large empty black/right-side frame area
- no horizontal top button strip
- no full vertical side rail
- one small menu tab appears on the far left edge
- the room image is larger than before because the scene is zoomed
- the remaining border/gap reads as intentional fantasy game framing
- the menu button opens a left-side overlay drawer
- drawer does not resize or push the room scene
- Today’s tasks opens the task board
- Open room map / Life Admin Rooms opens the Life Admin room map
- Wardrobe / home items opens the home item library
- Mirror / Wardrobe / Shelf / Edit Room / Study Cave hotspots still work

Expected Garden result:

- no visible viewport controls
- Garden still auto-fits inside the screen
- Garden progression still swaps tree stage images
