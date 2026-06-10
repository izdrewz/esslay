# Cave next to-do — current route build

Status: active / route logic progressing

Last updated: 2026-06-10

## Current confirmed progress

The Study Cave placeholder route is now working through the first three real build stages:

1. Brief Fog / Quest Compass — working enough to move on.
2. Source Mine / Crystal Sieve — working enough to move on.
3. Draft Route v1 — working enough to move on.
4. Paragraph Forge — opens, but is still the old placeholder and needs its real v1 logic.

## Confirmed browser tests

### Brief Fog

Confirmed:
- real Brief Fog route can be entered from Cave Base
- Quest Compass shows the full task meaning and real buckets
- real buckets passed forward correctly:
  - planning
  - source notes
  - drafting
  - proofreading
  - referencing habits

Still needed later:
- visual polish
- less visually noisy hotspot outlines outside test mode
- final visual-novel style intro/state art

### Source Mine / Crystal Sieve

Confirmed:
- Source Mine opens from Brief Fog
- Add Source works
- Seed demo cards works
- Crystal Sieve shows one card at a time
- real Brief Fog buckets are used, not only generic test buckets
- saving an evidence gem works
- Bucket Vault shows the saved evidence gem
- parked / restored card logic worked in testing
- browser refresh keeps the saved Source Mine data

Important current data shape:
- source cards live in `state.sourceMine.sieveQueue`
- saved evidence lives in `state.sourceMine.evidenceGems`
- each evidence gem stores bucket, source label, evidence text, note/link, matched words, and timestamp

Still needed later:
- first-time intro / Begin Source Mine step
- layout compaction
- clearer wording for multi-bucket matches
- make strongest match the only auto-ticked bucket by default
- show source labels in Bucket Vault previews more clearly
- hide or reduce giant hotspot boxes outside test mode
- do not restore the old cream Source Notes drawer

### Draft Route v1

Implemented by commit:
- `45b58e3` — Add Draft Route planner v1

Files changed:
- `docs/study-cave-draft-route-v1.js`
- `docs/cave.html`
- follow-up connection edits in:
  - `docs/study-cave-clicks-v1.js`
  - `docs/study-cave-source-mine-sieve-v2.js`

Confirmed:
- Draft Route opens from the current route after Source Mine has evidence
- Draft Route reads Source Mine evidence gems
- Route Planner shows evidence-gem counts by bucket
- Build route from evidence gems creates a route marker
- Review Route shows the saved route marker
- Continue to Paragraph Forge opens Paragraph Forge

Important current data shape:
- route markers live in `state.routeRooms["draft-route"].markers`
- each marker stores bucket, focus/title, evidence text, source label, note/purpose, and evidenceGemId

Still needed later:
- route marker ordering controls need a proper UI pass
- route markers should eventually be editable, removable, and reorderable
- Draft Route should feel more like a path/route mini-game, not only a panel
- Task Map node status still needs polish so locked/unlocked/current labels stay intuitive

## Current active next build: Paragraph Forge v1

Paragraph Forge currently opens, but it is still the old placeholder form. It does not yet use the Draft Route markers.

Next build should make Paragraph Forge read:

- `state.routeRooms["draft-route"].markers`

Paragraph Forge v1 should:

1. Show saved Draft Route markers.
2. Let Izzy pick a route marker.
3. Turn the marker into a rough paragraph starter.
4. Keep the evidence text and source label visible beside the paragraph draft.
5. Save rough paragraphs into `state.routeRooms["paragraph-forge"].paragraphs`.
6. Unlock Bridge Hall after at least one rough paragraph is saved.
7. Preserve saved paragraphs after refresh.

Suggested Paragraph Forge tabs:

- Forge Paragraph
- Route Markers
- Saved Paragraphs
- Missing / Weak

Minimum test for Paragraph Forge v1:

1. Start with one Source Mine evidence gem.
2. Build one Draft Route marker.
3. Continue to Paragraph Forge.
4. Confirm the marker appears in Paragraph Forge.
5. Save one rough paragraph from that marker.
6. Refresh the browser.
7. Confirm the rough paragraph persists.
8. Confirm Bridge Hall unlocks.

## Later route rooms still needing real v1 logic

After Paragraph Forge v1:

1. Bridge Hall v1
   - should read saved paragraphs
   - should help add flow/signpost links between paragraphs
   - should save bridge links
   - should unlock Citation Vault

2. Citation Vault v1
   - should read evidence/source labels used in paragraphs
   - should flag missing citation details
   - should save citation checks
   - should unlock Polish Pool

3. Polish Pool v1
   - should read rough paragraphs and bridge/citation checks
   - should record final clarity/proofreading fixes
   - should unlock Submission Gate

4. Submission Gate / Final Spell v1
   - should show final route summary
   - should show remaining missing/weak items
   - should provide final copy/export placeholder
   - should feel like final academic spell cast, not normal editing

## Current known code/UX issues

- There are still older placeholder scripts in the route. Some old Task Map labels can lag behind the newer room logic.
- Several route rooms open but still use generic placeholder save forms.
- GitHub Pages cache needs version bumps and hard refreshes after changes.
- Some large hotspot boxes are visually distracting.
- The current implementation uses localStorage key `esslay-study-cave-simple-v1`.
- Source Mine and Draft Route now use the newer localStorage structure, while some older code still normalises/reshapes the save state.
- Future consolidation is needed once the route behaviour is stable.

## Do not do yet

Do not spend time on final art, final CGs, pose swaps, monster/imp animation, or room background polish until Paragraph Forge v1 works.

Do not rewrite working Brief Fog, Source Mine, or Draft Route logic unless a browser test finds a specific bug.

Do not restore old blank/cream Source Notes style UI.

## Immediate next action

Build Paragraph Forge v1 using the working Draft Route marker data.