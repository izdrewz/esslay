# Master recovery status

Last updated: 2026-06-03

Status: active / recovered handover

Correct repo: `izdrewz/esslay`, not `izdrewz/game`.

Source of truth for continuing work:
- `docs/project-notes/README.md`
- `docs/project-notes/main-repo-status.md`
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

Clarification added for Area 1:
- Area 1 must update the active task section in `area-1-character-assets.md`.
- Area 1 must mark status clearly.
- Area 1 must tell Izzy directly whether the repo note was updated.
- Area 1 must send Izzy previews/output directly if there are images to approve.
- Area 1 must say clearly if the work is only a plan and no preview exists yet.

Task Brief stability patch:
- `docs/study-cave-enter-fix.js` was patched after Task Brief started crashing/freezing the browser.
- Likely cause: old or malformed saved Brief Fog data in browser `localStorage`, or a task/chunk list too large for the drawer to render safely.
- Patch added saved-chunk normalisation, safer output-card normalisation, safer storage writes, capped automatic chunk creation, capped visible chunk-list rendering, a Task Brief reset button, and a safe fallback if the Task Brief drawer cannot open.
- Commit: `92ec52ab0094163764c7cb8541e6689706f28554`.

Simple cave entry fix:
- The current `docs/cave.html` is now the simple click-flow rebuild with visual effects disabled while the cave workflow is stabilised.
- Entry broke after the rebuild because the page was still opening route rooms into `#stage-scene`, but the stage-scene stylesheet link had been removed.
- `docs/cave.html` now restores `study-cave-stage-scene.css` and bumps the simple click script version to `study-cave-clicks-v1.js?v=2`.
- Commit: `5c9d12fe81fe6c80bdb081d4ccfb9c7a37155d53`.
- `docs/study-cave-clicks-v1.js` was also rewritten to avoid newer regex parsing issues and to make the simple route entry more browser-safe.
- Commit: `e635fa91323cd21a5308f12affa18ebac1f84927`.
- Test next: hard refresh `docs/cave.html`, click Enter cave or Task map, click Enter Cave Base, click Continue, confirm Brief Fog opens, then open Task Brief.

Current master priority:
- First confirm the simple cave entry path works again.
- Keep Brief Fog v0.1 as active / needs Izzy review.
- Do not use rejected Area 1 generated previews.
- Do not replace the approved base girl or drift art style.
- Keep repo notes updated after meaningful changes.
