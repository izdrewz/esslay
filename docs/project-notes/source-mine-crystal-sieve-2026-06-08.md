# Source Mine Crystal Sieve v1

Status: active / needs browser test

Date: 2026-06-08

## Summary

Source Mine has been upgraded from a blank evidence form into a Crystal Sieve sorting workflow.

This was kept in the main repo rather than split into area work because it touches Brief Fog buckets, Source Mine evidence logic, source-library data, saved word groups, localStorage state, and future Draft Route use.

## Implemented files

- `docs/study-cave-source-mine-v4-hotfix.js`
- `docs/cave.html`

## Behaviour added

Source Mine now has tabs:

- Crystal Sieve
- Bucket Vault
- Add Source
- Word Constellations
- Review Cart

## Source Library

The Add Source tab lets Izzy paste a source, transcript, notes, or copied PDF text.

The system creates small source cards from the pasted text and stores:

- source title
- citation/source label
- source type
- source preview
- created cards
- source id

MP3 and MP4 files are not automatically mined yet. They need a transcript first.

## Crystal Sieve

The Crystal Sieve shows one source card at a time. Each card can be:

- saved as evidence to one or more Brief Fog buckets
- parked
- discarded

Saved evidence becomes an evidence gem.

Each evidence gem stores:

- bucket
- bucket id
- source id
- source title
- citation label
- evidence text
- Izzy note / link explanation
- matched words
- created timestamp

## Word Constellations

Word Constellations are reusable related-word groups. They help future source cards auto-suggest matching buckets.

Default groups exist for current Study Skills Trial buckets:

- planning
- source notes
- drafting
- proofreading
- referencing habits

There are also early CYS-style groups included for future source work:

- children's voice
- childhood as social construction
- children's rights
- young carers
- attachment

These are editable in the Word Constellations tab.

## Bucket Vault

Bucket Vault shows the Brief Fog buckets and saved evidence gems.

This is the future bridge into Draft Route, where saved gems can become paragraph material.

## Review Cart

Review Cart stores parked and discarded source cards so nothing is silently lost.

Parked or discarded cards can be restored to the sieve.

## Test path

1. Open `docs/cave.html?test=1&fresh=7` after Pages updates.
2. Open Study Cave and reach Source Mine.
3. Open Add Source.
4. Use Seed demo cards or paste a source text.
5. Confirm source cards appear in Crystal Sieve.
6. Save one card to a bucket.
7. Confirm Bucket Vault shows the saved evidence gem.
8. Park or discard one card.
9. Confirm Review Cart shows it and restore works.
10. Confirm refresh keeps the saved source cards and evidence gems.

## Known limits

- This is local/browser rule-matching, not AI.
- Uploaded PDFs are not automatically read by the game; text must be pasted for now.
- Uploaded audio/video need transcripts before they can become source cards.
- Source Mine visual polish is still placeholder and may need compaction after Izzy tests.
- Cave Base review hooks are planned but not yet visible as a dedicated Base review panel.

## Next decision after test

If Izzy approves the working loop, mark this as completed needs further edits because the workflow is usable but still needs visual polish and Cave Base review integration.

If it fails, keep active and record the exact failing click or save state.