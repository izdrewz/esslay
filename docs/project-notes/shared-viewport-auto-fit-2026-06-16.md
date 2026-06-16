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

## Home Base side rail — 2026-06-16

The intended direction is a thin vertical control strip on the far left, not a full top menu bar.

Current Home Base structure:

- far-left vertical rail holds the Home Base label and menu button
- the old top header is no longer used as a horizontal control strip
- the room scene sits to the right of the rail and can use more vertical screen space
- the drawer opens from the left side as an overlay instead of pushing or squeezing the scene

Side menu files:

- `docs/house-side-menu.css`
- `docs/house-side-menu.js`

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
- a thin left vertical rail appears on the far left
- the room image has more vertical space than it did with the top bar
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
