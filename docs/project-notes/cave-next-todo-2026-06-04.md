# Cave next to-do — 2026-06-04

Status: active

Izzy confirmed the Brief Fog placeholder choice shell works and Venture Forth reaches the Source Mine placeholder. Next work should prioritise playable UI and routing over final art.

## Cave Base UI

Cave Base needs a clickable-place pass because it already has a room image.

Minimum requirement:
- keep Cave Base as a room
- use clear clickable places on the Cave Base image
- support Brief Fog entrance, Task Map, flags/missed loot, outfit/chest, and continue/next route
- use placeholders if needed
- do not make final art a blocker

## Source Mine next-room placeholder

Source Mine is the next cave room after Brief Fog.

Izzy supplied a Source Mine placeholder background on 2026-06-06.

Status:
- active placeholder for UI build once added as a stable asset
- not final art unless Izzy explicitly approves it as final

Recommended repo target path:
`docs/assets/study-cave/source-mine-placeholder-v01.png`

Checked image size in chat runtime:
1672 × 941

Room content:
- fantasy-academic mine room
- research desk with books and papers
- crystals and lanterns
- mine cart with scrolls
- tunnel route deeper into the cave
- Draft Route sign

Current connector limitation:
- this chat can update repo text notes
- this chat cannot directly commit the binary image file through the available GitHub connector
- the image still needs to be uploaded/committed to the recommended repo path before code references it as a real asset

When the image is committed:
- use it as the Source Mine room background
- keep the current Source Mine route shell working
- add clickable places on the image rather than only utility buttons
- support Source Notes, Cave Base, Task Map, Flags / Missed Loot, Quote Bank / saved evidence, and Draft Route / next route
- do not rebuild Brief Fog to add this
- do not make final art a blocker

Planned clickable zones:
- left research desk / open book / papers = Source Notes / add source
- mine cart with scrolls = saved quotes / mined evidence
- crystal clusters = useful quote or evidence nodes
- lower/right stash or crate = missed evidence / gaps
- back tunnel / Draft Route sign = next route once enough source notes exist
- Cave Base return = clear navigation hotspot or compact room control

## Prompt correction for future Area 10 image work

Area 10 produced bad geometric/abstract outputs for Source Mine, so the next image prompt must be stricter.

Future prompt must say:
- make a hand-painted fantasy-academic game room background, not a geometric diagram, icon layout, map, flowchart, UI mockup, or abstract concept board
- use one coherent wide interior room with readable perspective
- no floating geometric panels, boxes, triangles, grid overlays, or diagram shapes
- clickable areas should be environmental props, not UI blocks
- no baked UI buttons or labels; in-world wooden signs are acceptable only if they belong naturally to the scene
- leave open floor/negative space for future panels and hotspots

## Brief Fog visual placeholder cleanup

Problem: the placeholder glow made the scene look like a casting moment when it should not.

Fix:
- removed the fake glow marker from the Brief Fog VN placeholder layer
- removed the CSS state that made the glow visible

Commit:
- `efa4e23fc3865c85fbb50e0d788047c33ee4986e`

## Venture Forth routing

Problem: Venture Forth was still landing back at Cave Base.

Fix:
- Venture Forth now renders a Source Mine placeholder room directly
- Source Mine has a Source Notes placeholder panel
- Venture still marks Brief Fog complete, unlocks Source Mine, and records skipped assistance as missed loot

Commit:
- `efa4e23fc3865c85fbb50e0d788047c33ee4986e`

Browser note:
- hard refresh is required after this change
- later clean-up should bump the script cache or consolidate route scripts

## Next build order

1. Cave Base clickable-place UI pass.
2. Upload/commit Izzy's Source Mine placeholder image to `docs/assets/study-cave/source-mine-placeholder-v01.png`.
3. Add the Source Mine image as the room background after the asset exists in the repo.
4. Source Mine room shell with clickable objects for source notes, mined quotes/evidence, missed evidence, and Draft Route.
5. Source Notes placeholder panel.
6. Later: final images and visual polish.
