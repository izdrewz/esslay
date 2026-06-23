# Source Mine native bucket select — 2026-06-23

Status: **completed; visible GitHub Pages test still required before approval**

## Scope

A narrow recovery fix replaced the Source Mine Crystal Sieve bucket checkbox group with one native browser dropdown.

## File changed

- `docs/study-cave-source-mine-sieve-v2.js`

## Behaviour now

- The sorter presents one dropdown labelled `Save this evidence in`.
- Its first option is `Choose a bucket`.
- No bucket is selected automatically, including for `needs sorting` cards.
- Source suggestions remain visible above the dropdown as guidance only.
- Saving requires one chosen bucket and creates one evidence gem.
- The Source Mine direct save path now stores source title, citation label, original filename, import type, page number, chunk index, and source-card ID on the evidence gem.
- The save action is named `source-sort-card-select`, so the existing PDF enhancement module does not replace it with the older checkbox-era provenance handler.

## Not changed

- Brief Fog
- Cave Base
- Task Map, including issue #5
- current browser save data
- paste-text import
- local PDF import
- local PDF.js dependency
- PDF OCR-needed message
- Source Library JSON export/import
- loaders, checkpoint scripts, recovery scripts, or cache-busting logic

## Validation completed

- JavaScript syntax check passed for the staged Source Mine module.
- Diff inspection confirmed only `docs/study-cave-source-mine-sieve-v2.js` changed in the feature branch.
- The current `main` commit after the fast-forward is `08eeeb446e7d8a384ce4af49a71f5142be345173`.

## Remaining acceptance check

A fresh deployed-browser test must confirm that the dropdown remains selected until Save gem is pressed, that one gem is saved into the chosen bucket, and that the saved PDF gem retains filename, title, citation label, page number, and chunk index. No reset, replay of Brief Fog, reimport, or local-storage clearing is required for that check.
