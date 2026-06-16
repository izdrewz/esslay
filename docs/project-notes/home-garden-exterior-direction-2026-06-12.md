# Home Garden / Exterior Direction — 2026-06-12

## Status

Garden exterior direction is approved as a concept.

The 8-stage XP Garden image progression set is now installed and implemented as the current Garden asset set.

Status label: approved implementation asset set, not locked final art unless Izzy later explicitly marks it locked final.

A previous SVG/vector-style placeholder was rejected and removed. Do not use SVG/vector diagram placeholders for this room.

## Decision

Use the **right-hand cliffside house reference** as the main exterior direction.

The chosen exterior direction is:

- habitable timber-and-stone home built into a mountain cliff
- warm domestic house, not a fortress
- dramatic rock overhang and mountain scale
- mist / waterfall / valley atmosphere
- cosy lights against cool mountain shadows
- connected naturally to cave rooms and Study Cave

Use a little of the left reference only for mystery and scale, not as the main structure.

## Impact on Home Base interior

The Home Base interior should shift slightly toward:

- more stone framing and archways
- clearer mountain/cliff construction
- cooler ambient cave or outdoor blue light in places
- hidden dwelling / mountain refuge feeling
- still warm, domestic, and usable for life-admin rooms

Do **not** make the inside feel like a dark castle. The sweet spot is:

> warm timber home + mountain cliff + cave magic

## Garden / XP Tree direction

The XP development tree should be in a separate Garden room, reached from Home Base.

Preferred garden type:

- cliffside terrace garden
- sheltered mountain courtyard
- magical sapling / XP tree in the centre
- stone path, planters, lanterns, small bench/worktable
- warm lanterns mixed with cool mountain/cave glow
- no UI baked into the image
- no characters

## Visual quality bar

The Garden must be a proper painterly environment background, not a flat/vector placeholder.

It should match the room-art direction more closely:

- wide 16:9 visual-novel / point-and-click background
- coherent environment, not a concept diagram
- painterly fantasy-academic style
- warm lanterns plus cool mountain/cave atmosphere
- readable hotspots but no UI baked in
- enough negative space for overlays/hotspots
- central XP tree/sapling must feel integrated into the terrace, not pasted on

## Shared viewport direction — 2026-06-16

The shared room viewport system has now been rolled out beyond Garden because the fitting issue affects multiple current and future rooms.

Shared viewport files:

- `docs/room-viewport.css`
- `docs/room-viewport.js`

Current shared viewport behaviour:

- dynamically measures the browser viewport
- supports top reserve and bottom safety spacing for pages with separate headers
- adds a medieval fantasy frame/backdrop so any gaps look intentional
- adds a small in-game View control with Fit / Wide / Fill / smaller / reset / larger buttons
- Fit keeps the full room image visible inside a 16:9 frame
- Wide prioritises horizontal screen width and may crop slightly on height when image art uses cover mode
- Fill uses more of the available frame area and may crop more than Wide
- places the View control in the room top bar/header when a slot is provided
- saves the chosen size and mode per room in localStorage key `esslay-room-viewport-settings-v1`

Applied room/screen shells:

- `docs/garden.html`
- `docs/house.html`
- `docs/cave.html`
- `docs/edit-room.html`
- `docs/hub.html`
- `docs/domestic.html`
- `docs/training.html`

Important: the shared viewport should now be tested across those rooms. If one room breaks, fix the shared viewport or that room's viewport data instead of creating separate one-off screen-size hacks.

## Implemented XP Garden assets — 2026-06-16

Installed asset paths:

- `docs/assets/rooms/garden/xp-garden-stage-01-newly-planted.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-02-first-growth.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-03-established.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-04-strong-growth.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-05-mature.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-06-bloom-milestone.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-07-fruiting.jpg`
- `docs/assets/rooms/garden/xp-garden-stage-08-harvest-mastery.jpg`

Stage meanings:

1. Newly planted
2. First growth
3. Established
4. Strong growth
5. Mature
6. Bloom milestone
7. Fruiting
8. Harvest / mastery

Implementation files:

- `docs/garden.html`
- `docs/garden.css`
- `docs/garden.js`
- `docs/garden-xp-bridge.js`
- `docs/room-viewport.css`
- `docs/room-viewport.js`

Current behaviour:

- `docs/garden.html` loads the staged XP Garden images.
- `docs/garden.js` selects the tree image from `localStorage` key `esslay-garden-state-v1`.
- Home Base has a temporary nav link to `garden.html`.
- `docs/garden-xp-bridge.js` credits +5 Garden XP when a Home task is successfully marked done.
- The bridge keeps credited Home task instance IDs so the same task instance is not repeatedly credited for Garden XP.

Known follow-up:

- Home Base will later be redesigned so the Garden is reached through an in-scene door / room transition, not just a nav link.
- Garden art is implemented for progression use, but should not be marked locked final unless Izzy explicitly locks it.
- The shared viewport rollout now needs browser testing across current room-style pages.

## Reference asset warning

The earlier exterior reference image remains reference-only unless confirmed safe/licensed for public repo use.
