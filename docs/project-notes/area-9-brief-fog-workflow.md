# Area 9 - Brief Fog v0.1 field/UI workflow

Task:
Brief Fog v0.1 field/UI workflow

Area:
9 / Brief Fog academic workflow

Status:
completed

What I checked:
- docs/project-notes/README.md exists and says project notes are the shared handover area and source of truth.
- docs/project-notes/main-repo-status.md was not found when checked.
- docs/project-notes/area-9-brief-fog-workflow.md is this Area 9 note.
- Current Area 9 chat context for Brief Fog v0.1 workflow.

Output:
Brief Fog is the first working Study Cave chamber. It replaces the old separate Task Intake and Command Word Gate start. It is for understanding the task before planning, sourcing, drafting, or editing. It must not write assignment content, generate paragraphs, decide the user's argument, or replace the user's interpretation.

Exact screen labels:
- Screen title: Brief Fog
- Subtitle: Question-Unpacking Chamber
- Intro text: Paste the task, question, brief, guidance, or marking notes. Then break it into chunks and work through each one so the task becomes clear before you move on.
- Reminder: This chamber is for understanding the task, not writing the answer.

Exact field labels:
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

Exact button labels:
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

Exact chunk card layout:
- Chunk number, chunk type, and chunk state at the top.
- Original wording shown as highlightable text.
- Highlight toolbar with category menu, confidence menu, and save highlight.
- Selected highlights list showing category, note, confidence, and status.
- Plain-meaning note.
- Action-created note.
- Flags.
- Missed loot.
- Dismissed wording.
- Chunk decision.
- Save chunk, Mark fully unpacked, Park for later, Previous chunk, Next chunk.

Exact highlight category menu:
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

Exact confidence menu:
- Sure
- Unsure
- Needs checking

Exact chunk type menu:
- Main question
- Task instruction
- Guidance note
- Marking instruction
- Source requirement
- Format instruction
- Word count / deadline instruction
- Submission instruction
- Tutor feedback instruction
- Reflection instruction
- Unknown

Exact chunk state menu:
- Not started
- In progress
- Fully unpacked
- Dismissed with reason
- Flagged for later
- Parked as missed loot
- Partially unpacked - warning accepted

Exact completion rules:
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

Exact warning messages:
- No chunks have been created yet. Split the task into chunks before entering Brief Fog.
- This chunk has no decision yet. Highlight, note, dismiss, flag, or park it before finishing Brief Fog.
- This chunk has no plain-meaning note. Add a short note or confirm that no note is needed.
- This chunk does not say what action it creates. Add an action-created note or confirm that it creates no action.
- One or more highlights are marked needs checking. Add a flag or change the confidence.
- There is a blocking flag in Brief Fog. You can continue, but this will be carried into the next chamber.
- Dismissed wording will not be used for next-chamber cards unless you undo the dismissal.
- Some chunks are unfinished or parked. You can continue, but they will appear as missed loot or flags later.
- Brief Fog is for understanding the task. Drafting happens later.

Exact final Brief Fog summary fields:
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

What gets passed to later chambers:
- commandWordCards to Command Word Chamber
- keywordCards to Keyword Lanterns
- scopeLimitCards to Scope Map
- sourceRequirementCards to Source Mine
- taskDemandSummary to Planning Board

What should not be built yet:
- automatic AI extraction
- assignment drafting
- paragraph generation
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

Dependencies:
- Main repo should create or restore docs/project-notes/main-repo-status.md because it was not found when Area 9 checked.
- Visual styling belongs to the cave visuals area, not Area 9.
- Main repo should ask Izzy whether the implemented Brief Fog chamber is acceptable before marking it completed locked.

Repo note update:
no note update needed after this file update; this file is now the Area 9 Brief Fog workflow note.
