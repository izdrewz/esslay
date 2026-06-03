# Area 3 — Character pose-swapping

Last updated: 2026-06-03

Status: active / needs asset import before live screen wiring

## Ownership

Area 3 owns the character pose-swapping system.

Area 3 is responsible for:

- approved pose IDs
- `docs/character-poses.js`
- `docs/character-display.js`
- pose asset path mapping
- making screens request a pose ID instead of hard-coding character image paths where that is safe
- keeping pose changes data-driven so later image replacements do not require every screen to be edited

Area 3 does not own:

- generating new character art
- approving or replacing the base character identity
- outfit design decisions
- full paper-doll layering
- walking sprites or animation systems
- Study Cave route logic, save logic, Brief Fog workflow, or Source Mine behaviour

## Current source of truth

The older project plan defines Area 3 as the pose-swapping area. The active project-notes system was missing an Area 3 note, so this file now records Area 3 in the current handover system.

Approved pose IDs from `PROJECT_PLAN.md`:

- `wardrobe_neutral`
- `mirror_check`
- `wardrobe_try_on`
- `idle_house`
- `focus_book`
- `thinking_mindmap`
- `edit_room_moodboard`
- `stuck_overwhelmed`
- `tidy_reset`
- `explorer_ready`
- `challenge_ready`
- `reward_happy`

## Current implemented state

Implemented files:

- `docs/character-poses.js` contains the approved pose ID map.
- `docs/character-display.js` renders images with `data-character-pose`.
- `docs/assets/characters/academic-adventurer/poses/README.md` lists the intended approved PNG filenames and pose IDs.

Current limitation:

The approved pose PNG files are not present in the repo at the mapped paths. For example, `docs/assets/characters/academic-adventurer/poses/01_wardrobe_neutral_base.png` was checked and is not currently in the repo.

Because the pose PNGs are absent, live screens should not yet be switched fully to `data-character-pose` unless there is a safe fallback. Otherwise, the browser would show broken image icons instead of the character.

## Current screen wiring audit

Home Base:

- `docs/house.html` and `docs/house.js` use the older outfit/avatar layer system.
- The mirror and outfit chooser are currently tied to final avatar PNGs and imported avatar images.
- Do not replace this with the pose map until the relationship between pose IDs and outfit IDs is decided.

Edit Room:

- `docs/edit-room.html` uses `data-character-layer` and `character-layer.js`.
- It currently follows the outfit/avatar layer system rather than Area 3 pose IDs.
- It may later request `edit_room_moodboard`, but only once a real pose asset or fallback strategy is confirmed.

Study Cave:

- Cave Base and Brief Fog character display is currently CSS background-image based in `docs/study-cave-stage-scene.css`.
- Brief Fog uses a temporary CSS flip and hand-spark placeholder for the duel/casting moment.
- Final Brief Fog poses belong with Area 1 asset approval first, then Area 3 can map approved pose IDs or cave-specific pose IDs.

## Current Area 3 task

1. Keep Area 3 visible in the project-notes handover system.
2. Harden `docs/character-display.js` so missing pose PNGs can fall back safely when a screen uses `data-character-pose`.
3. Do not wire live screens to missing pose assets yet.
4. After approved pose PNGs are committed, wire screens to request pose IDs where appropriate.
5. Keep outfit swapping and pose swapping separate until the data relationship is deliberately designed.

## Future likely pose additions

Possible future cave-specific pose IDs may be needed after Area 1 asset approval:

- `cave_base_ready`
- `brief_fog_light_ready`
- `brief_fog_twinkle_cast`
- `brief_fog_afterglow_imp_reveal`
- `brief_fog_confident_after_reveal`
- `brief_fog_warning_sparkle`

These are not approved active pose IDs yet. Do not add them to the live pose map until Izzy approves the actual pose direction or placeholder naming plan.

## Active warning

Do not treat generated previews as approved pose assets. Do not replace the approved base girl identity. Do not make the character childlike, chibi, glossy semi-realistic, or inconsistent with the current soft illustrated academic-adventurer direction.
