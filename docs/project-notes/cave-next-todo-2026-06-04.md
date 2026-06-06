# Cave next to-do — 2026-06-04

Status: active

Izzy confirmed the Brief Fog placeholder choice shell works and Venture Forth reaches Source Mine. Next work should prioritise playable UI and routing over final art.

## Cave Base UI

Cave Base still needs a clickable-place pass because it already has a room image.

Minimum requirement:
- keep Cave Base as a room
- use clear clickable places on the Cave Base image
- support Brief Fog entrance, Task Map, flags/missed loot, outfit/chest, and continue/next route
- use placeholders if needed
- do not make final art a blocker

Status: active / next UI polish task.

## Source Mine next-room placeholder

Source Mine is the next cave room after Brief Fog.

Izzy supplied a Source Mine placeholder background on 2026-06-06.

Current repo status:
- `docs/assets/study-cave/source-mine-placeholder-v01.png` exists in the repo
- `docs/cave.html` references the Source Mine placeholder image as the Source Mine room background
- `docs/cave.html` loads `study-cave-brief-fog-vn-v3.js?v=1`
- `docs/study-cave-brief-fog-vn-v3.js` adds the Source Mine interaction shell

Status:
- active placeholder / needs browser testing
- not final art unless Izzy explicitly approves it as final

Checked image size in chat runtime:
1672 × 941

Room content:
- fantasy-academic mine room
- research desk with books and papers
- crystals and lanterns
- mine cart with scrolls
- tunnel route deeper into the cave
- Draft Route sign

Implemented Source Mine clickable zones:
- Source Notes / Add Source
- Mined Quotes / Saved Evidence
- Evidence Nodes / quote-to-task-chunk review
- Missing Evidence / weak source gaps
- Draft Route checkpoint
- Task Map
- Cave Base through compact room controls

Implemented Source Mine data flow:
- source records are stored in the local Study Cave save
- quote/paraphrase/evidence notes are stored in the local Study Cave save
- evidence notes can link to saved Brief Fog chunks
- missing evidence gaps can be recorded as missed loot
- Draft Route currently acts as a checkpoint, not the full drafting room yet

Test required:
1. Hard refresh the cave.
2. Use Brief Fog → Read task scroll → Venture Forth.
3. Confirm Source Mine opens with the supplied placeholder image.
4. Click Source Notes and save a source.
5. Click Mined Quotes and save a quote/evidence note.
6. Click Evidence Nodes and confirm saved evidence appears.
7. Click Missing Evidence and record a missing evidence gap if Brief Fog chunks exist.
8. Click Draft Route and confirm the checkpoint opens.
9. Refresh and confirm source/evidence save persists.

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

Problem: Venture Forth was landing back at Cave Base.

Fix:
- Venture Forth now opens Source Mine
- Venture still marks Brief Fog complete, unlocks Source Mine, and records skipped assistance as missed loot

## Next build order

1. Browser-test Source Mine image + clickable source/evidence flow.
2. Fix any Source Mine routing or save bugs found in testing.
3. Cave Base clickable-place UI pass.
4. Draft Route shell after Source Mine is stable.
5. Later: final images and visual polish.
