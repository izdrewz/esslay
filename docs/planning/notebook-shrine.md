# Notebook Shrine planning note

This is a planned small side panel for Esslay. It should not be built before the current end-to-end test checklist is completed and repaired.

## Role

Notebook Shrine, Study Archive, or Training Library should sit on the training side of the game. It should not become the main source library and should not replace tmazing.

## What it can store

It should allow pasted or imported NotebookLM notes, summaries, key points, questions, answers, study-guide outputs, and notebook links.

Items should be taggable by module, task, source, or topic. Where possible, an item should link back to the relevant source record in tmazing.

## Evidence boundary

NotebookLM material should be labelled as study material, not citation-ready evidence. If a point is used for a TMA, Esslay should remind the user to check the original source in tmazing first.

## Game behaviour

Notebook Shrine can feed Training Notes, revision tasks, understanding checks, and quote-bank preparation. It can award training XP, but it must not automatically count as source evidence or complete citation checkpoints.

## Screen structure note

If the app becomes overloaded, split it into separate screens or files rather than using Git branches as normal navigation. Branches are better for experiments and alternate versions.

A later structure could use:

- `docs/index.html` as the hub
- `docs/screens/tma-battle.html`
- `docs/screens/training.html`
- `docs/screens/home-base.html`
- `docs/screens/archive.html`

The app can link between those pages. Branches can still be used for experimental builds such as `feature/notebook-shrine` or `experiment/home-base-ui`.
