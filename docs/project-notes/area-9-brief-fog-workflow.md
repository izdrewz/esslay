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

## Area 9 returned task response — Brief Fog v0.1 field/UI workflow

Task:
Brief Fog v0.1 field/UI workflow

Area:
9 / Brief Fog academic workflow

Status:
completed

What I checked:
Area 9 worked from the current Brief Fog role: academic workflow and task interpretation logic for the first working Study Cave chamber.

Output:

### Purpose

Brief Fog is the first working Study Cave chamber. It replaces the old separate Task Intake and Command Word Gate start.

It is for understanding the task before planning, sourcing, drafting, or editing.

It must not write assignment content, generate essay paragraphs, decide the user’s argument, or replace the user’s interpretation.

### Required v0.1 flow

1. User pastes raw task/guidance text.
2. User optionally adds task title and assessment type.
3. User clicks “Suggest chunks” or adds chunks manually.
4. User reviews chunks and can split, merge, reorder, rename, delete, or add chunks.
5. User works through chunk cards one at a time.
6. User highlights important wording and assigns categories.
7. User writes a plain-meaning note.
8. User writes an action-created note.
9. User can add flags, missed loot, or dismissed wording with reasons.
10. User chooses a chunk state.
11. User can finish Brief Fog only when every chunk has a decision.
12. Final summary passes cards to later chambers.

### Screen labels

Screen title: Brief Fog

Subtitle: Question-Unpacking Chamber

Intro text: Paste the task, question, brief, guidance, or marking notes. Then break it into chunks and work through each one so the task becomes clear before you move on.

Reminder: This chamber is for understanding the task, not writing the answer.

### Field labels

Raw task panel:
- Task Brief
- Paste task / question / guidance
- Task title
- Assessment type

Chunk card fields:
- Original wording
- Highlight category
- Confidence
- Highlight note
- Plain-meaning note
- Action-created note
- Flag note
- Missed loot note
- Dismissal reason
- Chunk state

### Button labels

- Suggest chunks
- Add chunk manually
- Approve chunks
- Save task brief
- Save chunk
- Add highlight
- Edit highlight
- Remove highlight
- Add flag
- Resolve flag
- Add missed loot
- Collect missed loot
- Dismiss wording
- Undo dismissal
- Mark fully unpacked
- Park for later
- Accept warning and continue
- Return to chunk
- Previous chunk
- Next chunk
- Finish Brief Fog
- View Brief Fog summary
- Send to next chamber

### Chunk card layout

[Chunk number] [Chunk type] [Chunk state]

Original wording:
[highlightable chunk text]

Highlight toolbar:
[category menu] [confidence menu] [save highlight]

Selected highlights:
[list of highlights with category, note, confidence, and status]

Plain-meaning note:
[text area]

Action-created note:
[text area]

Flags:
[flag list] [Add flag]

Missed loot:
[missed loot list] [Add missed loot]

Dismissed wording:
[dismissed wording list] [Dismiss wording]

Chunk decision:
[state menu]

Buttons:
Save chunk
Mark fully unpacked
Park for later
Previous chunk
Next chunk

### Highlight category menu

- Command word / action word
- Topic keyword
- Scope / limit
- Evidence / source requirement
- Format / output rule
- Word count / deadline rule
- Marking / quality clue
- Optional / context wording
- Dismissed wording
- Unsure

### Chunk state menu

- Not started
- In progress
- Fully unpacked
- Dismissed with reason
- Flagged for later
- Parked as missed loot
- Partially unpacked - warning accepted

### Completion rules

Brief Fog can be completed only when every chunk is one of:

- Fully unpacked
- Dismissed with reason
- Flagged for later
- Parked as missed loot
- Partially unpacked - warning accepted

A chunk can be marked Fully unpacked only when:

- the user has reviewed the wording
- important command words are highlighted or confirmed absent
- important keywords are highlighted or confirmed absent
- scope, limit, source, format, word count, deadline, or marking clues are highlighted, dismissed, flagged, or parked
- a plain-meaning note exists unless the chunk is dismissed
- an action-created note exists unless the user confirms no action is created
- uncertainty is flagged
- the user confirms the chunk decision

### Warning messages

- No chunks have been created yet. Split the task into chunks before entering Brief Fog.
- This chunk has no decision yet. Highlight, note, dismiss, flag, or park it before finishing Brief Fog.
- This chunk has no plain-meaning note. Add a short note or confirm that no note is needed.
- This chunk does not say what action it creates. Add an action-created note or confirm that it creates no action.
- One or more highlights are marked needs checking. Add a flag or change the confidence.
- There is a blocking flag in Brief Fog. You can continue, but this will be carried into the next chamber.
- Dismissed wording will not be used for next-chamber cards unless you undo the dismissal.
- Some chunks are unfinished or parked. You can continue, but they will appear as missed loot or flags later.
- Brief Fog is for understanding the task. Drafting happens later.

### Final Brief Fog summary fields

- Task title
- Assessment type
- Number of chunks
- Chunks fully unpacked
- Chunks dismissed
- Chunks flagged
- Chunks parked as missed loot
- Command words found
- Topic keywords found
- Scope / limits found
- Source requirements found
- Format / output rules found
- Word count / deadline rules found
- Marking / quality clues found
- Open flags
- Missed loot
- Dismissed wording summary
- Next recommended chamber

### Outputs passed onward

To Command Word Chamber:
- commandWordCards

To Keyword Lanterns:
- keywordCards

To Scope Map:
- scopeLimitCards

To Source Mine:
- sourceRequirementCards

To Planning Board:
- taskDemandSummary

### Do not build yet

- automatic AI extraction
- assignment drafting
- essay paragraph generation
- automatic source finding
- automatic quote selection
- automatic reference generation
- complex animations
- monster combat logic
- reward unlock logic
- furniture or clothing rewards
- full export system
- full source upload parser
- final submission checker

### Implementation priority

Manual-first, editable, reversible, and reliable. The user stays in control of task interpretation.

Dependencies:
Area 11 save/export response is needed before main repo should finalise persistence and export for this workflow.

Repo note update:
This section has been added to the Area 9 note as the completed Brief Fog v0.1 field/UI workflow response.
