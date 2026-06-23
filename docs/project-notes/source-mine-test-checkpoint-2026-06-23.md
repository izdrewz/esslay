# Source Mine test checkpoint — 2026-06-23

Status: **installed; needs one visible GitHub Pages confirmation**

## Purpose

This is a test-only shortcut for returning to the existing Source Mine state without replaying Brief Fog, reimporting a PDF, seeding test data, resetting the browser save, or changing selected buckets.

## Files

- `docs/study-cave-source-mine-checkpoint-v2.js`
- `docs/cave.html`

## Use

- In Cave Coach, open **Test Mode**, then choose **Jump to Source Mine checkpoint**.
- A direct browser route is also available at `cave.html?checkpoint=source-mine`.

## What it changes

Only the room-unlock/current-room fields needed to open Source Mine are set. Existing `sourceMine` cards, evidence gems, imported PDF metadata, and browser save data remain in place.

## What it does not use

- `study-cave-test-checkpoint-v1.js`
- checkbox fixes
- dropdown fixes
- checkpoint recovery loaders
- task map code
- Brief Fog content

## Implementation

- Script load commit: `cb5e5200c682f15ec5ecfb81b7c381644d1dfd2e`
- Test Mode button commit: `34821a2a938b980d376bd4c82cb8cd9dc6298218`
- The checkpoint script passed a JavaScript syntax check.
