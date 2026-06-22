# Brief Fog automatic review rebuild — 2026-06-22

Status: needs approval

## Reason for the rebuild

The first Task Scroll Sieve asked the player to classify every PDF fragment manually even when the browser had already made an estimate. That was repetitive form work rather than a useful game interaction.

Brief Fog now uses an automatic-review structure:

```text
Quest Scroll PDF → automatic Fog Reading → Bright Path acceptance → Fog Knot mini-game → Spell Recipe → Source Mine
```

## New files

- `docs/study-cave-task-scroll-auto-fog-v1.js`
- `docs/study-cave-task-scroll-auto-fog-ui-v2.js`

The existing final-loaded `study-cave-task-scroll-autoselect-v1.js` now sequentially loads these modules after the normal Task Scroll modules. No Cave Base, Task Map, Cave entrance, Source Mine importer, or later route module was changed.

## Automatic Fog Reading

After a Quest Scroll import, every fragment is given:

- an estimated role
- a confidence level: high, medium, or low
- the wording signals that contributed to the estimate
- up to two other possible roles where there is competing evidence

The built-in role estimator uses transparent local matching rules for task wording, task parts, evidence requirements, scope concepts, crafting rules, reference rules, marking criteria, and administration. It does not call an external service and does not upload the assignment PDF.

## Player interaction

- **Bright Path** lists high-confidence readings. The player can accept them together and can still edit them later.
- **Fog Knots** contains medium/low-confidence or mixed wording only.
- Each Fog Knot shows the estimated role, signal words/phrases, alternatives, source filename/page/fragment, and note field.
- The player can keep the Fog reading, park it, or recast it through Review / edit fragments.
- Review / edit fragments remains the full correction and history route.

## Local learning

When the player changes an estimated role, Brief Fog stores a local browser-only correction record:

- original estimated role
- player-selected role
- informative words from the fragment
- timestamp

Those corrections produce small local phrase weights that influence later estimates in the same browser. The UI shows the total number of local corrections.

This is not a server model, shared account learning, or a guarantee that one correction becomes universally correct. It is deliberately local, visible, and editable.

## Checks completed before browser approval

- JavaScript syntax checks passed for both new modules.
- A mocked engine test passed for Current Boss, Reference Rule, and Admin Detail estimates.
- The test accepted high-confidence Bright Path readings and recorded a player recast as local learning.
- A mocked UI test rendered Fog Reading with Bright Path and Fog Knots.
- The hosted GitHub Pages click-through still needs Izzy's visible test.

## Fresh visible test

1. Hard refresh the cave page.
2. Reset the current Study Cave save; do not continue the previous manual-sieve run.
3. Start Brief Fog through the normal route and import the fictional practice Quest Scroll.
4. Confirm that Fog Reading appears instead of a blank role dropdown.
5. Confirm the page displays Bright Path, Fog Knots, confidence labels, signal words, and a local-learning count.
6. Accept Bright Path once.
7. Investigate at least one Fog Knot.
8. Recast one estimate through Review / edit fragments and confirm the local-learning count increases.
9. Confirm Spell Recipe → Source Mine still passes player-named ingredients as buckets.
10. Keep Task Map issue #5 and Cave Base future viewport/click-zone fixes outside this test.

## Future design change — room theme

Izzy dislikes the name and presentation of **Fog Knots**. The mechanic is accepted as a useful automatic-review function, but the current knot metaphor does not fit the Brief Fog room or the wider game theme.

Do not change this during the current functional PDF test. In a later focused visual/narrative pass, rename and redesign the uncertain-fragment interaction so it reads as an in-world Brief Fog activity rather than a generic knot mini-game. Preserve the underlying behavior: automatic estimates, transparent trigger words, user corrections, local learning, and editable decisions.
