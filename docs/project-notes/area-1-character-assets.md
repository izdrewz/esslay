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

Status: needs approval / precise asset plan returned, no approved preview yet

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

## Area 1 communication/update rule — master correction

Status: active rule / applies immediately

The previous instruction was not explicit enough about telling Izzy directly when Area 1 updates its work. This is now corrected.

When Area 1 works on this active task, Area 1 must:

- update `docs/project-notes/area-1-character-assets.md` under the active task section, not somewhere vague or hidden
- mark the task status clearly using the project status labels
- tell Izzy directly whether the repo note was updated
- send Izzy previews/output directly if there are images to approve
- say clearly if no preview exists yet
- say clearly if the work is only a plan, not an asset output
- never leave Izzy or the master repo guessing whether Area 1 updated somewhere else

If Area 1 cannot update the repo note directly, it must send Izzy the exact text to paste into this file.

For any visual/image output, the response must say whether the output is:

- placeholder
- approved placeholder
- final candidate
- approved final
- locked final

No image or pose asset should be treated as approved unless Izzy explicitly approves it.

## Local handoff check not yet reflected as approved repo asset

Status: needs confirmation / not imported as approved repo asset

A local handoff said Area 1 produced:

`area1_avatar_front_default_locked_base.png`

Reported details from that handoff:
- locked base used: front/default sprite Izzy sent
- base/default only in that pass
- canvas size: 1024 × 1536
- tattoo rule applied: right-arm tattoo kept; no tattoo added to the other arm
- rejected packs excluded
- transparency checked on dark, patterned, and room-style backgrounds
- border alpha check reported clean

Master repo search did not find `area1_avatar_front_default_locked_base` in `izdrewz/esslay` at the time this note was updated. Do not treat this as an imported or approved repo asset unless the file is actually added to the repo and Izzy confirms its approval status.

If Area 1 has this output, Area 1 must tell Izzy directly, provide the preview/output, and update this note with the actual status.

## Rejected visual output — do not use

Status: rejected / active reset

Izzy rejected the latest generated outfit and pose previews because the art style was incorrect. The outputs drifted into a glossy semi-realistic / rendered fantasy style and did not match the approved soft illustrated academic-adventurer base.

Do not use the latest generated wizard, sorcerer, jester, bard, princess, knight, scribe, ranger, druid, or Brief Fog magic-preview images as game assets. They are rejected visual tests only.

The rejected images must not be imported, cleaned, zipped as final files, or treated as approved references.

## Correct art-style direction for next Area 1 work

The next Area 1 output must match the approved base sprite style:
- soft illustrated character art
- academic-adventurer / cosy medieval / renaissance explorer feel
- delicate linework and painterly texture
- same blonde hair identity, face softness, body proportions, and recognisable base-girl silhouette
- black background for working previews
- final transparent PNG only after approval

Avoid:
- glossy 3D render look
- hyper-realistic fashion-doll look
- generic fantasy replacement girl
- over-sexualised armour/costume direction
- changing the face, body, or hair identity
- adding tattoos to both arms
- making outfits bland default clothing
- hard laser-beam magic

## Precise Brief Fog asset plan returned

Status: needs approval

Area 1 should produce the Brief Fog duel as a consistent left-to-right mini sequence. The character must stay on the left side of the frame and the smoke/Command Imp target stays on the right. The sequence should feel cinematic without teleporting the character: camera distance/angle can change, but character placement and direction should remain coherent.

Required preview sequence:

1. `brief_fog_01_light_ready_left.png`
- Character on left, facing right.
- One hand holds small twinkle/sparkle light.
- Expression: focused, wary, investigating.
- Use: before firing magic into the fog.

2. `brief_fog_02_twinkle_cast_left_to_right.png`
- Character on left, arm extended right.
- Twinkle/sparkle magic fires from hand toward smoke/imp on right.
- Expression: determined and confident.
- Magic should be starry, sparkling, and magical, not a laser.

3. `brief_fog_03_afterglow_imp_reveal.png`
- Character remains in the same casting direction with extended hand or lowered after-cast hand.
- Beam has stopped; afterglow remains near hand.
- Fog patch cleared enough to reveal Command Imp nearby on the right.
- Expression: assessing / focused.

4. `brief_fog_04_confident_after_reveal.png`
- Character on left, confident after revealing or knocking back the imp.
- Preferred pose: hand on hip or smug/tucking-hair pose.
- Expression: confident, slightly smug, controlled.
- Imp fallen on backside is monster/Area 10 side, but character staging should support it.

5. `brief_fog_05_warning_spark_imp_flee.png`
- Character on left with sparkle/light in hand again.
- Pose: controlled threat, confident, ready to continue.
- Expression: confident, not rageful.
- Imp flee/runaway remains Area 10/monster work, but the character pose should point the eye toward the right.

Character-only PNG needs:
- full-body character pose PNGs for each of the five poses above
- same canvas/alignment across all five
- black-background previews first for approval
- final transparent PNGs after Izzy approves previews

Separate effect overlays needed:
- `brief_fog_hand_sparkle_overlay_v01.png`
- `brief_fog_twinkle_shot_overlay_v01.png`
- `brief_fog_afterglow_overlay_v01.png`
- optional `brief_fog_reveal_flash_overlay_v01.png`

Overlay rule:
Sparkle/twinkle effects should stay separate from the character PNG where possible so the repo can fade, aim, or reuse them. Character preview can show the effect for approval, but final export should include clean separated overlays when practical.

## Cave Base / outfit assets still needed

Cave Base assets:
- cave base idle pose
- opening outfit chest pose
- reading cave journal / route ledger pose
- study/cave outfit recommendations
- outfit override asset logic notes

Brief Fog assets:
- focused hand sparkle pose
- casting twinkle attack pose
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

- `brief_fog_01_light_ready_left.png`
- `brief_fog_02_twinkle_cast_left_to_right.png`
- `brief_fog_03_afterglow_imp_reveal.png`
- `brief_fog_04_confident_after_reveal.png`
- `brief_fog_05_warning_spark_imp_flee.png`
- `brief_fog_hand_sparkle_overlay_v01.png`
- `brief_fog_twinkle_shot_overlay_v01.png`
- `brief_fog_afterglow_overlay_v01.png`

## Open issues

- The current avatar still depends on CSS filter blending. A cave-lit PNG would reduce pasted-on feeling.
- Final pose assets must not introduce white halos.
- The current CSS cutscene can only approximate facing/casting. Final pose art is needed for the proper left-to-right Brief Fog duel sequence.
- The next image generation pass must fix art style before approval can happen.
- Izzy needs to approve the corrected pose/art-style direction before final PNG production.
- Area 1 must now explicitly tell Izzy when it updates this note and must send previews/output directly if there is anything visual to approve.
