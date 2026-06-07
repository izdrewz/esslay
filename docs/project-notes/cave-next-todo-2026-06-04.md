# Cave next to-do — 2026-06-04

Status: active

Izzy confirmed the Brief Fog placeholder choice shell works and Venture Forth reaches Source Mine. Current priority is building the complete route architecture before fine UI/art polish.

## Current repo status — 2026-06-07

Implemented route code now includes placeholder shells for the remaining cave rooms:

- Brief Fog
- Source Mine
- Draft Route
- Paragraph Forge
- Bridge Hall
- Citation Vault
- Polish Pool
- Submission Gate / Final Spell

Current route-shell files:
- `docs/study-cave-brief-fog-vn-v4.js`
- `docs/study-cave-source-mine-v4-hotfix.js`
- `docs/study-cave-route-rooms-v1.js`

`docs/cave.html` now loads the route room controller before the room-specific handlers so Draft Route and later rooms can intercept their route actions.

Commits:
- `ad02f1427e8a8250a1a477d4d60ccef785c75b76` — added remaining room shells
- `7e4937333f1eb5c154ee70a905c72abe48aafa3c` — loaded route room controller before room-specific handlers

## Cave Base UI

Cave Base still needs a clickable-place pass because it already has a room image.

Minimum requirement:
- keep Cave Base as a room
- use clear clickable places on the Cave Base image
- support Brief Fog entrance, Task Map, flags/missed loot, outfit/chest, and continue/next route
- use placeholders if needed
- do not make final art a blocker

Status: active / later UI polish task after route shells are tested.

## Source Mine next-room placeholder

Source Mine is the next cave room after Brief Fog.

Izzy supplied a Source Mine placeholder background on 2026-06-06.

Current repo status:
- `docs/assets/study-cave/source-mine-placeholder-v01.png` exists in the repo
- `docs/cave.html` references the Source Mine placeholder image as the Source Mine room background
- Source Mine opens from Venture Forth
- Source Mine is a gather quest, not a monster room

Status:
- active placeholder / needs browser testing after route-shell update
- not final art unless Izzy explicitly approves it as final

Checked image size in chat runtime:
1672 × 941

Room content:
- fantasy-academic mine room
- research desk with books and papers
- crystals and lanterns
- mine cart with scrolls
- tunnel route deeper into the cave
- Draft Route sign

Implemented Source Mine data flow:
- source records are stored in the local Study Cave save
- quote/paraphrase/evidence notes are stored in the local Study Cave save
- evidence notes can link to saved Brief Fog chunks
- missing evidence gaps can be recorded as missed loot
- Draft Route now opens the Draft Route placeholder shell when route controller is loaded

## Source Mine UX correction after first visual test

Izzy tested the Source Mine room and found the screen too overwhelming because every hotspot was visible immediately.

Design correction:
- Source Mine should use a Begin Quest / room-intro gate like Brief Fog.
- On first entry, show the room image and one clear opening action, such as `Begin Source Mine`.
- After beginning, unlock Source Notes first.
- Unlock Mined Quotes only after at least one source exists.
- Unlock Evidence Nodes only after at least one quote/evidence note exists.
- Unlock Missing Evidence only after Brief Fog chunks exist or after at least one evidence note is being mapped.
- Unlock Draft Route only after there is enough saved source/evidence material to justify continuing.
- Locked zones can remain visible as environmental areas, but they should not all present as active choices at once.

Clickable placement correction:
- The current image is usable as a placeholder, but some hotspot boxes do not sit naturally on the objects.
- Source Notes works best on the left desk/open book area.
- Mined Quotes works best on the centre mine cart with scrolls.
- Evidence Nodes works best on the glowing crystal clusters.
- Missing Evidence works best on a crate/stash or shadowed lower-right area, but it needs less visual dominance.
- Draft Route works best on the existing right-side route sign/tunnel.
- Task Map should be a compact room control, not a huge floor hotspot.
- Cave Base should also be a compact room control unless a clear return path is added to the art.

Image status:
- do not reject the placeholder yet; shuffle hotspots and stage the UI first
- flag that a later final Source Mine image should include clearer environmental places for locked/unlocked interactions

## Source Mine metaphor / gather quest

Source Mine is a gather quest, not a monster room.

The stronger game metaphor is: mine evidence crystals/gems needed for later spell casting.

Room idea:
- sources are raw ore
- quotes/paraphrases/examples are mined gems or evidence crystals
- explaining the quote in the player's own words polishes the gem
- linking the quote to a Brief Fog chunk sets the gem into the correct spell slot
- weak/missing evidence becomes cracked ore, unstable crystal, or missed loot

No Source Mine monster is needed. The challenge is collection, sorting, and making the evidence usable.

Possible Source Mine quest loop:
1. Enter Source Mine.
2. Begin quest.
3. Add source ore.
4. Mine evidence gems from the source.
5. Polish each gem by explaining it in own words.
6. Slot gems into Brief Fog task chunks.
7. Record gaps as missed loot.
8. Continue to Draft Route when enough gems are ready.

## Cave route / room purpose plan

Current functional route:
- Save the question/task and guidance.
- Brief Fog: break down and understand the task.
- Source Mine: gather quotes/evidence relevant to each part of the question.

Implemented placeholder room sequence:
- Draft Route: turn task chunks plus evidence gems into a paragraph route / argument path.
- Paragraph Forge: write rough body paragraphs from the route.
- Bridge Hall: improve flow, signposting, and paragraph links.
- Citation Vault: check citations, references, page numbers, and quote integration.
- Polish Pool: final clarity, wording, formatting, and obvious mistakes.
- Submission Gate / Final Spell: final read-through and submit/export moment.

Each placeholder room currently has:
- a Begin room state
- one main save form
- Review
- Issues / missed loot capture
- Next-room unlock after at least one saved item
- placeholder background path with fallback to existing cave images until Izzy supplies room images

Future image target paths:
- `docs/assets/study-cave/draft-route-placeholder-v01.png`
- `docs/assets/study-cave/paragraph-forge-placeholder-v01.png`
- `docs/assets/study-cave/bridge-hall-placeholder-v01.png`
- `docs/assets/study-cave/citation-vault-placeholder-v01.png`
- `docs/assets/study-cave/polish-pool-placeholder-v01.png`
- `docs/assets/study-cave/submission-gate-placeholder-v01.png`

Boss concept:
- The boss should not be ordinary editing.
- The boss should be the final submission/read-through trial where all collected components become one spell.
- Brief Fog gives the spell target.
- Source Mine gives evidence gems.
- Draft Route shapes the spell path.
- Paragraph Forge creates the spell body.
- Bridge Hall stabilises the spell flow.
- Citation Vault prevents the spell collapsing through weak references.
- Polish Pool cleans the spell.
- Submission Gate is the boss / final cast.

Final boss direction:
- The final boss can be Submission Gate, Deadline Dragon, Rubric Warden, or Final Read-Through Guardian.
- The final action should feel like casting the completed academic spell, not just pressing submit.
- Missing chunks, weak evidence, and citation gaps become boss weaknesses or damage risks.

## Test required

1. Hard refresh the cave.
2. Use Brief Fog → Read task scroll → Venture Forth.
3. Confirm Source Mine opens with the supplied placeholder image.
4. Begin Source Mine and confirm Add Source opens.
5. Save a source and confirm Mine Quote unlocks.
6. Save an evidence gem and confirm Evidence Gems and Draft Route unlock.
7. Use Draft Route and confirm the Draft Route placeholder room opens.
8. Save one item in each later room and confirm the next room unlocks:
   - Draft Route → Paragraph Forge
   - Paragraph Forge → Bridge Hall
   - Bridge Hall → Citation Vault
   - Citation Vault → Polish Pool
   - Polish Pool → Submission Gate
9. Refresh and confirm saved state persists.

## Prompt correction for future Area 10 image work

Area 10 produced bad geometric/abstract outputs for Source Mine, so the next image prompt must be stricter.

Future prompt must say:
- make a hand-painted fantasy-academic game room background, not a geometric diagram, icon layout, map, flowchart, UI mockup, or abstract concept board
- use one coherent wide interior room with readable perspective
- no floating geometric panels, boxes, triangles, grid overlays, or diagram shapes
- clickable areas should be environmental props, not UI blocks
- no baked UI buttons or labels; in-world wooden signs are acceptable only if they belong naturally to the scene
- leave open floor/negative space for future panels and hotspots

## Brief Fog visual placeholder cleanup

Problem: the placeholder glow made the scene look like a casting moment when it should not.

Fix:
- removed the fake glow marker from the Brief Fog VN placeholder layer
- removed the CSS state that made the glow visible

Commit:
- `efa4e23fc3865c85fbb50e0d788047c33ee4986e`

## Venture Forth routing

Problem: Venture Forth was landing back at Cave Base.

Fix:
- Venture Forth now opens Source Mine
- Venture still marks Brief Fog complete, unlocks Source Mine, and records skipped assistance as missed loot

## Next build order

1. Browser-test full placeholder route from Source Mine to Submission Gate.
2. Fix route bugs before adding more polish.
3. Add supplied room background images one by one into the target paths.
4. Cave Base clickable-place UI pass.
5. Consolidate the temporary hotfix files after route behaviour is stable.
6. Later: final images and visual polish.
