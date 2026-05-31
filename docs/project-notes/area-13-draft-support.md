# Area 13 — Draft support access

Last updated: 2026-05-31

## Area role

Area 13 owns source, quote, note, reference, and support-material logic.

Area 13 does not design cave visuals or edit repo code directly.

## Future drafting mode direction

The actual draft write-up should feel closer to Word/Grammarly than a cave form.

When the user reaches drafting mode, they should write in a large document-like editor while support panels remain accessible.

Support panels should include:
- task brief
- task map
- command word notes
- keyword notes
- marking grid notes
- feedback patterns
- source notes
- quote bank
- references
- draft template / paragraph route
- flags
- missed loot

## Core rule

The drafting area must not auto-write the assignment.

It must not silently insert quotes or rewrite paragraphs.

It should make the user's own notes, sources, quotes, references, and task plan accessible while the user writes.

## Data structures needed later

- draftMode
- drafts
- source cards
- quote/evidence cards
- task notes
- command word notes
- keyword notes
- marking grid notes
- feedback pattern notes
- draft support panel records
- paragraph route tiles
- draft sections
- source-to-point links
- reference notes

## v0.1 drafting support later

Build later:
- source card form
- quote/evidence card form
- task note form
- command word note form
- keyword note form
- reference note form
- marking note form
- feedback pattern note form
- paragraph route tile structure
- draft section structure
- manual link/unlink buttons
- mark used/parked/missed loot actions
- flag actions
- simple support panels
- export of draft support notes

Do not build yet:
- full Word-style rich text editor
- automatic Grammarly-style suggestions
- automatic source matching
- PDF/DOCX extraction inside draft mode
- automatic bibliography
- AI source interpretation
- automatic quote insertion
- live citation formatting
- grammar rewrite suggestions

## Current repo priority

Area 13 is not blocking the current Study Cave route build.

Brief Fog and Cave Base should be implemented first.
