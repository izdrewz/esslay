# Area 12 route handoff fix — 2026-06-03

Status: needs browser retest.

Change recorded for Area 12 route behaviour:

- Study Skills Trial selection now opens the Task Map threshold.
- Quest Board hotspot clicking is now handled by the route handoff script and opens `#quest-board-panel`.
- The fallback route script no longer owns Enter Cave Base or Continue Quest.
- The newer scene script owns Cave Base, Brief Fog, completion, and Source Mine placeholder behaviour.
- The rendered chunk-generation button is normalised to `Suggest chunks`.

Retest path:

1. Hard refresh the browser so the changed script is loaded.
2. Open `docs/cave.html`.
3. Click the Quest Board hotspot and confirm the Quest Board opens.
4. Select Study Skills Trial.
5. Confirm Task Map threshold opens.
6. Enter Cave Base.
7. Continue Quest.
8. Confirm the full Brief Fog v0.1 workflow opens.
9. Finish Brief Fog and confirm Source Mine unlocks with progress 1 / 7.

If this passes, Brief Fog can move from active review to completed needs further edits. Visual polish remains future work.
