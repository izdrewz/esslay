# Area 12 route handoff fix — 2026-06-03

Status: needs browser retest.

Change recorded for Area 12 route behaviour:

- Study Skills Trial selection now opens the Task Map threshold.
- The fallback route script no longer owns Enter Cave Base or Continue Quest.
- The newer scene script owns Cave Base, Brief Fog, completion, and Source Mine placeholder behaviour.
- The rendered chunk-generation button is normalised to `Suggest chunks`.

Retest path:

1. Open `docs/cave.html`.
2. Open Quest Board.
3. Select Study Skills Trial.
4. Confirm Task Map threshold opens.
5. Enter Cave Base.
6. Continue Quest.
7. Confirm the full Brief Fog v0.1 workflow opens.
8. Finish Brief Fog and confirm Source Mine unlocks with progress 1 / 7.

If this passes, Brief Fog can move from active review to completed needs further edits. Visual polish remains future work.
