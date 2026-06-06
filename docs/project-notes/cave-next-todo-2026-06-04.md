# Cave next to-do — 2026-06-04

Status: active

Izzy confirmed the Brief Fog placeholder choice shell broadly works. Next work should prioritise playable UI and routing over final art.

## Cave Base UI

Cave Base needs a clickable-place pass because it already has a room image.

Minimum requirement:
- keep Cave Base as a room
- use clear clickable places on the Cave Base image
- support Brief Fog entrance, Task Map, flags/missed loot, outfit/chest, and continue/next route
- use placeholders if needed
- do not make final art a blocker

## Brief Fog visual placeholder cleanup

Problem: the placeholder glow made the scene look like a casting moment when it should not.

Fix:
- removed the fake glow marker from the Brief Fog VN placeholder layer
- removed the CSS state that made that glow visible

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
2. Source Mine room shell with its own clickable objects.
3. Source Notes placeholder panel.
4. Later: final images and visual polish.
