# Master recovery status

Last updated: 2026-06-04

Status: active / recovered handover

Correct repo: `izdrewz/esslay`, not `izdrewz/game`.

Source of truth for continuing work:
- `docs/project-notes/README.md`
- `docs/project-notes/main-repo-status.md`
- `docs/project-notes/asset-reference-system.md`
- all relevant area notes in `docs/project-notes/`

Current project position:
- Study Cave route is: Study Cave entrance → Quest Board → Task Map threshold → Cave Base → Brief Fog / Question-Unpacking Chamber → Source Mine placeholder.
- Brief Fog v0.1 is implemented as a functional placeholder but still needs Izzy review before it can be locked.
- Area 1 is not blocking the placeholder build.
- Area 1 still owns final character pose/effect assets for Cave Base and Brief Fog.

Area 1 check:
- Area 1 updated `docs/project-notes/area-1-character-assets.md` with the Brief Fog pose/effect asset plan and rejected-art-style reset.
- Area 1 has no approved Brief Fog preview recorded yet.
- A local handoff mentioned `area1_avatar_front_default_locked_base.png`, but repo search did not find that filename in `izdrewz/esslay` at recovery time.
- Do not treat that local handoff file as imported or approved unless it is added to the repo and Izzy confirms its status.
- 2026-06-04 Area 1 reported status: active / needs current image set before corrected preview production.
- Correction: Izzy is not responsible for supplying a complete finished image set. Izzy has already supplied available references and closest frames. Area 10 should assemble/produce the missing Brief Fog still set from the supplied references, and Area 1 should support character/outfit consistency.
- Area 1 should not make sheets or new concept art while waiting. Its next step is to review the closest current frames supplied through Master/Area 10, classify usable placeholders, and identify exact corrections.
- Area 1 lists BF01 opening, BF02 read/choice, BF03 charge/vanquish, BF04 threat manifestation, BF05 aftermath, BF06 Escape, and BF07 Venture Forth as missing stills or layer-aligned assets.

Clarification added for Area 1:
- Area 1 must update the active task section in `area-1-character-assets.md`.
- Area 1 must mark status clearly.
- Area 1 must tell Izzy directly whether the repo note was updated.
- Area 1 must send Izzy previews/output directly if there are images to approve.
- Area 1 must say clearly if the work is only a plan and no preview exists yet.

Asset reference system:
- `docs/project-notes/asset-reference-system.md` now defines the reference-image handoff system.
- Reference images are not approved game assets by default.
- Master may read the full asset registry.
- Area 1 should use Area 1 character/outfit/sprite references unless Izzy or Master points it elsewhere.
- Area 10 should use Area 10 scene/background/imp/fog/VN references unless Izzy or Master points it elsewhere.
- The setup must not change playable cave files unless a later implementation task explicitly imports approved assets.
- Image files have not yet been committed through the new intake system.
- Next safe step is small labelled image batches with exact paths and status labels.

Task Brief stability patch:
- `docs/study-cave-enter-fix.js` was patched after Task Brief started crashing/freezing the browser.
- Likely cause: old or malformed saved Brief Fog data in browser `localStorage`, or a task/chunk list too large for the drawer to render safely.
- Patch added saved-chunk normalisation, safer output-card normalisation, safer storage writes, capped automatic chunk creation, capped visible chunk-list rendering, a Task Brief reset button, and a safe fallback if the Task Brief drawer cannot open.
- Commit: `92ec52ab0094163764c7cb8541e6689706f28554`.

Simple cave room-flow recovery:
- The current `docs/cave.html` is a simple click-flow rebuild with visual effects disabled while the cave workflow is stabilised.
- Working checkpoint commits to preserve:
  - Visible clickable room hotspots: `c2dfb30f95509989d2f7c9b065b421699738454d`
  - Direct room hotspots in script: `d88f4652b42c71179544fdca7b7a438db3e7881d`
  - Source Mine progression: `655143972e2901e45dcb6431e92299f6e6f17926`
  - Room navigation/save-status update: `6850ea9da825b0963ef0870ea38aa7899725dd7c`
  - Current `cave.html` loading `study-cave-clicks-v1.js?v=7`: `32f94ec9cf5333239e183856c54f4c7809577957`
- Izzy confirmed the cave rooms now work.
- Cave Base, Brief Fog, and Source Mine are now treated as route rooms, not dismissible overlays.
- Room-level corner X controls were removed.
- Drawer X controls remain for panels/drawers only.
- Visible local browser save status now appears in Cave Base, Brief Fog, Source Mine, Task Brief, Chunk, Summary, Export, and Flags/Loot.
- The UI now shows a timestamp and last action such as task saved, chunks refreshed, chunk saved, or Source Mine unlocked.

Future visual-novel/story direction:
- Izzy wants future development to include a stronger visual-novel/story layer with characters, story beats, text boxes, and choice-dependent scene screens.
- This story layer is an upgrade path and should not replace the core cave functionality.
- The cave function must remain usable with story mode temporarily disabled or simplified for focus mode.
- For Brief Fog specifically, Izzy prefers choice-dependent slideshow / scene stills over layered animation because it should be easier to keep consistent and less likely to break.
- Future room structure should support clickable in-scene objects, such as clicking the scroll/read prompt to open writing or quest choices, not only detached utility buttons.
- Current image references include possible visual-novel dialogue/text-box direction, but the final art style is not locked yet.
- Future characters and story scenes should be recorded as visual-novel upgrades, separate from the functional writing workflow.

Current master priority:
- Stop asking Izzy to supply a finished Brief Fog image set.
- Use the references/closest frames Izzy already sent as reference-only intake.
- Area 10 should assemble/produce the BF01–BF07 current image set using a stable background/camera and layer/composite method where possible.
- Area 1 should review/support character identity, outfit, pose, and consistency, not make sheets.
- Finish asset reference intake setup.
- Add current Brief Fog references in small labelled batches when available.
- Run the Brief Fog functional acceptance test with a two-chunk brief.
- Confirm save persistence after refresh.
- If that passes, mark Cave Base + Brief Fog simple flow as functional placeholder / visual polish later.
- Then build Source Mine v0.1 functionality.
- Do not use rejected Area 1 generated previews.
- Do not replace the approved base girl or drift art style.
- Keep repo notes updated after meaningful changes.
