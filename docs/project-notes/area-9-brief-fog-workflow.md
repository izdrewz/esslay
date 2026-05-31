# Area 9 — Brief Fog workflow

Last updated: 2026-05-31

## Area role

Area 9 owns the academic workflow and task interpretation logic.

Area 9 does not edit the repo, design cave visuals, or write the assignment.

## Current priority for Area 9

Area 9 is a current Priority 1 owner.

Main repo is about to build Brief Fog v0.1. Area 9 owns the academic logic for:
- raw task text becoming sentence/chunk cards
- highlight categories
- what counts as fully unpacked
- plain-meaning notes
- action-created notes
- command-word cards
- keyword cards
- scope/limit cards
- source requirement cards
- rules for flags and missed loot from an academic workflow point of view
- ensuring the chamber does not auto-write the assignment

If Area 9 is asked for more input, it should focus on exact field labels, chunk card wording, completion checks, and user prompts.

## Locked chamber

First working chamber:

Brief Fog / Question-Unpacking Chamber

This chamber receives the task, question, brief, guidance, marking grid wording, feedback instructions, or source requirements and helps the user understand what the task is asking.

It must not write the assignment.

## Current workflow rules

The task should be broken into sentence cards or chunk cards.

Each chunk can be:
- one sentence
- one bullet point
- one instruction line
- one paragraph of guidance
- one marking-grid criterion
- one source requirement
- one formatting/submission rule
- one piece of tutor feedback

The user must be able to merge, split, reorder, or rename chunks later.

## Required highlight categories

- command word / action word
- topic keyword
- scope / limit
- evidence / source requirement
- format / output rule
- word count / deadline rule
- marking / quality clue
- optional / context wording
- dismissed wording

## Chunk states

A chunk can leave Brief Fog as:
- fully unpacked
- dismissed with reason
- flagged
- parked as missed loot
- partially unpacked with warning accepted

The game should warn if a chunk has no processing decision.

## Fully picked apart rule

A chunk is fully picked apart when the user has decided what every important part of the chunk does.

The game should not require every word to be highlighted.

A chunk should have at least one of:
- highlight
- note
- dismissal reason
- flag
- missed loot entry
- confirmed no-action state

## Outputs passed forward

Brief Fog outputs:
- commandWordCards
- keywordCards
- scopeLimitCards
- sourceRequirementCards
- flags
- missedLoot
- taskDemandSummary

These feed later chambers including Command Word support if kept, Keyword Lanterns, Scope Map, Source Mine, Planning Board, Reference Vault, Dirty Draft, and Submission Gate.

## Anti-auto-writing rule

Brief Fog may:
- explain task wording
- ask guiding questions
- suggest highlight categories
- store the user's interpretation
- warn about missing decisions
- carry outputs into later chambers

Brief Fog must not:
- generate essay paragraphs
- generate final assignment wording
- decide the user's argument
- mark a task as understood without user confirmation
- replace the user's interpretation with a finished answer

## Repo implementation next

Main repo needs to turn this into the Brief Fog v0.1 scene-first workflow:
- raw task text input
- split into chunks
- chunk cards
- highlight category selector
- plain-meaning note
- action-created field
- flag button
- missed loot button
- dismissal button with reason
- chunk state selector
- final Brief Fog summary
- output arrays/cards saved to StudyCaveSaveState
