# Study Cave clean UI + smart support pass — 2026-06-16

## Why

Izzy confirmed Home Base layout is now perfect and redirected focus back to Study Cave.

Problem statement:

- Study Cave is still not UI-clean.
- It is not ADHD-friendly enough.
- It does not yet feel like smart writing support similar in purpose to Grammarly.

## First pass implemented

File changed:

- `docs/study-cave-test-mode-v1.js`

This file already loads on `docs/cave.html`, so the first pass was added there without changing the route logic files.

## UI changes

The cave now follows the approved Home Base pattern more closely:

- no visible horizontal top header
- scene-first frame
- larger zoomed cave image
- stronger medieval/fantasy border treatment
- one small floating menu tab on the far left
- overlay panel instead of permanent UI clutter

The old bottom-right Test Mode launcher is hidden. Test Mode is now reachable from the Cave Coach panel.

## Smart support changes

A new Cave Coach overlay is injected by `docs/study-cave-test-mode-v1.js`.

The Cave Coach is rule-based for now, not a full AI writing assistant yet.

It reads the existing local Study Cave state from:

- `esslay-study-cave-simple-v1`

It shows:

- next best step
- why that step matters
- current room
- route progress
- flag count
- smart checks
- quick links to Task Map, Quest Board, Brief Fog, Source Mine, Flags, Home Base, and Village

Current smart checks respond to:

- no task chunks yet
- unresolved Brief Fog chunks
- Brief Fog done but Source Mine empty
- evidence gems saved and Draft Route unlocked
- flags / missed loot present

## Important limitation

This is the first clean UI + guidance pass. It does not yet perform real grammar, citation, paragraph, or argument analysis.

The next proper Grammarly-like layer should add room-specific checks such as:

- task/question match
- claim clarity
- evidence support
- quote integration
- paragraph topic sentence
- citation risk
- structure/flow
- repetition/wordiness
- missing transition
- final submission checklist

These should appear as small actionable suggestions, not a wall of text.

## Test

Open:

- `docs/cave.html`

Expected:

- top header is gone
- cave scene is larger and bordered
- one small left floating menu tab appears
- tab opens Cave Coach
- Cave Coach suggests one next best step
- smart checks change based on saved route state
- Test Mode is accessible from inside Cave Coach
- core Study Cave route actions still work
