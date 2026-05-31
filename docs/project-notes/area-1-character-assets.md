# Area 1 — Character assets

Last updated: 2026-05-31

## Area role

Area 1 owns character pose planning, outfit assets, transparent PNG production, and magic/effect asset requirements.

Area 1 does not edit the repo, design cave backgrounds, or decide save/route logic.

## Locked character rules

- Use the approved base girl.
- Do not redraw in a way that changes her identity.
- No AI character replacement.
- No face/body/hair redesign.
- Keep tattoo rule consistent.
- Transparent PNGs must be clean.
- Avoid white halos/fringe.
- Keep canvas/alignment consistent for game placement.
- Organise assets by pose, outfit, and area.

## Current repo state relevant to Area 1

- Main repo currently uses `avatar_default_teal_explorer.png` as the Study Cave placeholder character.
- Character size in Cave Base is workable now.
- Character blending is CSS-based and acceptable for placeholder, but a future cave-specific lit avatar would look better.
- The Cave Base currently uses a placeholder background.
- Brief Fog currently has placeholder scene support only.

## Needed from Area 1

Cave Base assets:
- cave base idle pose
- opening outfit chest pose
- reading cave journal / route ledger pose
- study/cave outfit recommendations
- outfit override asset logic notes

Brief Fog assets:
- focused hand sparkle pose
- casting light beam pose
- casting afterglow / extended hand pose
- confident pose after imp reveal: arms crossed, hand on hip, or tucking hair behind ear
- sparkle threat pose while imp runs away

Effects:
- hand sparkle transparent overlay
- light beam transparent overlay
- afterglow overlay
- optional fog-clearing light effect

## Priority

Not blocking current repo build.

The repo can continue with placeholder character first. Area 1 assets are needed before final polish of Cave Base and Brief Fog.

## File/folder suggestion

Suggested folder:

`docs/assets/characters/academic-adventurer/study-cave/`

Suggested subfolders:

- `cave-base/`
- `brief-fog/`
- `effects/`
- `outfits/`

## Open issues

- The current avatar still depends on CSS filter blending. A cave-lit PNG would reduce pasted-on feeling.
- Final pose assets must not introduce white halos.
