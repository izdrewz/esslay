# Study Cave Smart Review layer — 2026-06-16

## Status

First real Grammarly-like Study Cave support layer added.

Current frame/layout status: working again after browser check.

The Study Cave opening scene is now using the Home Base-style frame approach:

- scene-first layout
- hidden old top header
- zoomed framed room image
- small left Cave Coach tab
- overlay panels instead of permanent UI clutter

Important fix that made the current visible frame work:

- `docs/cave.html` loads `docs/study-cave-frame-fix-v2.js`
- `docs/study-cave-frame-fix-v2.js` now directly forces the active Cave frame to `scale(1.08)`
- the earlier over-zoomed attempt was too cropped and should not be restored

Do not reintroduce the previous broken Cave frame behaviour:

- do not replace the opening cave art with a plain dark background
- do not let Flags / Quest Board / Task Map become full-screen cream sheets
- do not re-add the horizontal cave header as the main UI
- do not increase Cave zoom back to `scale(1.32)` without Izzy explicitly asking

## What changed

The Cave Coach now includes a Smart Review card.

Smart Review can be opened from the left floating Cave Coach tab and lets Izzy paste a paragraph or draft into a local browser-saved review box.

Local storage key:

- `esslay-study-cave-smart-review-v1`

## Current checks

This is still local rule-based checking, not a live AI model.

It currently checks for:

- missing draft text
- draft too short for meaningful review
- weak task match against Brief Fog task keywords
- vague opening claim / missing answer signal
- long sentences over roughly 36 words
- missing visible evidence support
- saved evidence gems not used in the pasted draft
- citation / page-number risk when a quote or citation appears
- heavy first sentence in a long paragraph
- weak transitions across multiple paragraphs
- wordiness / filler phrases
- repetitive sentence starts

## User-facing behaviour

The Smart Review panel shows:

- score out of 100
- word count
- task-term match count
- source count
- evidence gem count
- actionable suggestion cards
- red / amber / green severity labels
- short fix instructions
- route-room labels for where to fix the issue

## Important limitation

This is a client-side rule-based assistant. It is meant to feel more like Grammarly-style guidance, but it does not yet call an AI model and cannot truly understand a full essay.

The next stronger version should connect the checks to actual route rooms:

- Brief Fog: task/question match
- Source Mine: evidence sufficiency
- Draft Route: structure and claim order
- Paragraph Forge: topic sentence + PEEL/TEA-style paragraph shape
- Bridge Hall: transition and flow
- Citation Vault: citation completeness and quote integration
- Polish Pool: wordiness, repetition, sentence length
- Submission Gate: final checklist

## Next recommended work

Now that the frame is usable again, the next work should be feature quality, not more layout churn.

Suggested next step:

1. Test Cave Coach and Smart Review with one pasted paragraph.
2. Fix any broken open/close actions in Cave Coach / Smart Review.
3. Start connecting Smart Review suggestion cards to the relevant route rooms, beginning with Brief Fog and Source Mine.

## Test

Open:

- `docs/cave.html`

Hard refresh with Ctrl + F5.

Expected:

- Study Cave opening art is visible and framed
- Cave scene size is acceptable with `scale(1.08)`
- left Cave Coach tab opens
- Cave Coach shows a Smart Review card
- Open writing checks opens Smart Review
- pasting a paragraph and clicking Save + run checks updates the score and suggestion list
- route buttons inside Smart Review still open cave rooms
- Test Mode remains available from Cave Coach
