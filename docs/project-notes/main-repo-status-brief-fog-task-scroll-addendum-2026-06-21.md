# Main repo status addendum — Brief Fog Task Scroll PDF

Date: 2026-06-21

Status: needs approval

This addendum records the current active feature without replacing the existing long-term main repository status history.

## Active focus

The next full Study Cave test begins with a local assignment-brief PDF in Brief Fog, then continues into the existing Source Mine PDF flow and the rest of the route.

The approved test direction is:

```text
Assignment PDF → Brief Fog Task Scroll Sieve → player-confirmed Spell Recipe → Source Mine evidence crystals → Draft Route → later rooms
```

## Implemented files

- `docs/study-cave-task-scroll-core-v1.js`
- `docs/study-cave-task-scroll-ui-v1.js`
- `docs/study-cave-task-scroll-controller-v1.js`
- `docs/study-cave-route-count-fix-v1.js` now sequentially loads those three modules.

## Preserved

- Existing manually entered/pasted Brief Fog/Quest Compass route remains available as fallback.
- Existing Source Mine PDF importer remains unchanged.
- Existing later-route modules remain unchanged.
- Approved Task Map image, placement, close button, hotspots, Cave entrance, Cave Base temporary presentation, and issue #5 old-map flash remain untouched.

## Required visible browser checks

1. Start a fresh Study Cave run.
2. Open Brief Fog by the normal route.
3. Import an assignment PDF through Bring Quest Scroll.
4. Confirm page-aware Fog Sieve fragments.
5. Confirm one Current Boss and user-named ingredients in the Spell Recipe.
6. Confirm Source Mine receives those ingredient names as buckets.
7. Import a source PDF and save an evidence gem.
8. Confirm Draft Route receives the evidence gem.
9. Test OCR-needed and Quest Scroll JSON backup separately.

## Cave Base status

Cave Base remains `completed needs further edits` but accepted for current PDF testing. Future isolated work: restore intended larger presentation without clipping; replace temporary compact controls with correctly placed in-scene click zones; clean the outdated Current chamber wording.

## Approval rule

Do not mark Brief Fog Task Scroll PDF import or the overall PDF/source full-run feature as locked until Izzy completes the visible browser run and approves it.
