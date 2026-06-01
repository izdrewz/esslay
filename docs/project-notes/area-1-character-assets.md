# Area 1 — Character assets

Last updated: 2026-06-01

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
- Working/source images should use black backgrounds where possible for easier cutout checking.
- Final game assets should be transparent PNGs.

## Current repo state relevant to Area 1

- Main repo currently uses `avatar_default_teal_explorer.png` as the Study Cave placeholder character.
- Character size in Cave Base is workable now.
- Character blending is CSS-based and acceptable for placeholder, but a future cave-specific lit avatar would look better.
- The Cave Base currently uses a placeholder background.
- Brief Fog currently has placeholder scene support only.
- Brief Fog placeholder cutscene direction is now character on the left and smoke cloud / Command Imp on the right.
- The magic should look twinkly/sparkly, not like a hard laser beam.

## Current active Area 1 request: Brief Fog duel cutscene pose set

Status: active / needs Area 1 output

Izzy sent jester reference images for the Brief Fog cutscene direction.

Required first cutscene layout:
- character on left
- smoke cloud / Command Imp on right
- character faces the smoke/imp
- character shoots twinkle/sparkle magic from her hand toward the imp
- cutscene should feel like a short comic/Mortal-Kombat-style frame, separate from the normal room interaction if needed

Required first pose priority:
- left-to-right attack/casting pose using the jester reference style
- hand extended toward the right
- body and face aimed toward the smoke/imp
- sparkle/twinkle magic originating from the hand
- transparent PNG if possible
- black background preview acceptable for approval, but final game asset should be clean transparent PNG

Follow-up pose needs after attack pose:
- confident/smug follow-up pose after imp reveal
- hand-on-hip or tucking-hair pose
- sparkle threat pose while imp runs away
- startled/scared/defensive pose for future imp reactions if needed

Direction variants:
- left-to-right attack pose is the first priority.
- right-to-left or other direction variants can wait unless the main repo needs them later.

Important asset rule:
Do not replace the approved character with a different design. Use the references for pose/outfit direction, but preserve the approved girl’s identity and locked character rules.

## Needed from Area 1

Cave Base assets:
- cave base idle pose
- opening outfit chest pose
- reading cave journal / route ledger pose
- study/cave outfit recommendations
- outfit override asset logic notes

Brief Fog assets:
- focused hand sparkle pose
- casting light beam / twinkle attack pose
- casting afterglow / extended hand pose
- confident pose after imp reveal: arms crossed, hand on hip, or tucking hair behind ear
- sparkle threat pose while imp runs away

Effects:
- hand sparkle transparent overlay
- twinkle magic shot transparent overlay
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

Suggested Brief Fog files:

- `brief_fog_attack_left_to_right_v01.png`
- `brief_fog_confident_followup_v01.png`
- `brief_fog_sparkle_threat_v01.png`
- `brief_fog_hand_sparkle_overlay_v01.png`
- `brief_fog_twinkle_shot_overlay_v01.png`

## Open issues

- The current avatar still depends on CSS filter blending. A cave-lit PNG would reduce pasted-on feeling.
- Final pose assets must not introduce white halos.
- The current CSS cutscene can only approximate facing/casting. Final pose art is needed for the proper left-to-right Brief Fog duel sequence.
