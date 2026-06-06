# Brief Fog placeholder VN shell — 2026-06-04

Status: active / needs browser test

## Why this exists

Design/image generation for Area 10 and related visual work is currently erroring/corrupting. Izzy approved pausing final image production and using placeholders so the UI/code route can be built first.

This means final Brief Fog art is not blocking implementation.

## Implemented repo changes

Files changed:

- `docs/study-cave-brief-fog-vn.js`
- `docs/cave.html`

Commits:

- `6282cbd947402e08852706cf52ca7a116e18aae6` — added Brief Fog VN placeholder controller
- `086297aca9c7004aedbc82beef120f28b7cbf214` — loaded Brief Fog VN placeholder controller from `cave.html`

## Behaviour added

Brief Fog now has a placeholder visual-novel shell that sits on top of the existing functional cave/chunk workflow.

Flow:

1. Open Brief Fog.
2. Placeholder scene appears with fake fog/girl/imp markers and an in-world `Read task scroll` hotspot.
3. Clicking `Read task scroll` switches to the choice state.
4. Choice panel appears with:
   - `Begin Quest?` / `VANQUISH THE FOG`
   - `Scared?` / `Escape…`
   - `Confident, Bold, Perhaps Unwise?` / `Venture Forth… Into The Unknown`

Route behaviour:

- `VANQUISH THE FOG` saves the route choice and opens the existing Task Brief / chunk assistance flow.
- `Escape…` saves the escape choice and returns to Cave Base without clearing Brief Fog.
- `Venture Forth… Into The Unknown` saves the venture choice, marks Brief Fog complete, unlocks Source Mine, and records the skipped assistance chunks as missed loot.

## Placeholder rule

The current placeholder visuals are not final art and not approved final assets.

They are only there to prove the route and UI work while final Brief Fog stills are paused.

Future final art should be a drop-in replacement after the route is stable.

## Notes / risk

`docs/cave.html` now loads `study-cave-brief-fog-vn.js?v=1` after the existing `study-cave-clicks-v1.js?v=9`.

The new controller intercepts Brief Fog route clicks in capture phase so the existing chunk workflow can remain mostly intact.

Needs browser test because this is a code/UI routing change.

## Test path

1. Open Study Cave.
2. Quest Board → open Study Skills Trial.
3. Task Map → Enter Cave Base.
4. Continue/Open Brief Fog.
5. Confirm placeholder VN scene opens.
6. Click `Read task scroll`.
7. Confirm choice panel appears.
8. Test `VANQUISH THE FOG` opens Task Brief/chunk flow.
9. Test `Escape…` returns to Cave Base and saves route choice.
10. Reset save if needed, then test `Venture Forth… Into The Unknown` unlocks Source Mine and records missed loot.
11. Refresh and confirm saved state persists.

## Area impact

Area 10 is paused as a blocker for now. It can continue later with final stills, but UI/code should proceed using placeholders.

Area 1 is paused as a blocker for now. It can later support character/outfit consistency for the final stills.
