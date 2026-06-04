# Area 1 — Character assets

Last updated: 2026-06-04

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
- Brief Fog visual direction is now interactive visual-novel / game-CG style scene states, not full animation.
- Brief Fog scene-state direction is character on one side and smoke cloud / Command Imp target on the other.
- The magic should look twinkly/sparkly, not like a hard laser beam.

## Current active Area 1 request: Brief Fog visual-novel pose states

Status: active / needs corrected preview

Izzy has decided the project is no longer pursuing an animation-heavy pipeline for this work. Brief Fog should now be treated as interactive visual-novel / game-CG style scene states.

This means Area 1 should not try to create a smooth animation or full frame-by-frame sequence. It should make clean static character pose states that can be swapped by the game.

Updated direction from Izzy, 2026-06-04:
- Brief Fog should feel like a game/visual-novel scene, not only a utility panel.
- In-scene objects should remain important; for example, the player should click the scroll/read prompt to enter the writing/quest flow.
- The preferred approach is choice-dependent slideshow / still-frame scene states rather than layered animation.
- The same Brief Fog sequence can be used during the room and later when completing the cave.
- The first image should likely be the opening state.
- Clicking the read prompt/scroll should swap to the second state and show a choice overlay:
  - Header: Begin Quest?
  - Clickable 1: VANQUISH THE FOG
  - Header: Scared?
  - Clickable 2: Escape…
  - Header: Confident, Bold, Perhaps Unwise?
  - Clickable 3: Venture Forth… Into The Unknown
- Route meaning:
  - VANQUISH THE FOG begins the assisted Brief Fog task/chunk flow.
  - Escape leaves the cave.
  - Venture Forth skips the assistance chunks and progresses into the next/missed-loot path.

Required scene-state direction:
- static character/scene state images or clean character pose PNGs, depending on final implementation choice
- consistent character identity
- consistent canvas/alignment
- black-background previews first for cutout/asset work where relevant
- final transparent PNGs after approval for reusable character assets
- if using full CG stills, keep text/UI separate from the art unless Izzy explicitly asks for baked text
- magic/effects separated as overlays where practical
- no requirement for video, GIF, or frame-by-frame animation

Required Brief Fog scene states from earlier plan:

1. `brief_fog_01_light_ready_left.png`
- Character on one side, facing the smoke/imp target.
- One hand holds small twinkle/sparkle light.
- Expression: focused, wary, investigating.
- Use: before casting magic into the fog.

2. `brief_fog_02_twinkle_cast_left_to_right.png`
- Character arm extended toward the target.
- Twinkle/sparkle magic fires from hand toward smoke/imp target.
- Expression: determined and confident.
- Magic should be starry, sparkling, and magical, not a laser.

3. `brief_fog_03_afterglow_imp_reveal.png`
- Character remains in the same casting direction with extended hand or lowered after-cast hand.
- Beam has stopped; afterglow remains near hand.
- Fog patch cleared enough to reveal Command Imp nearby.
- Expression: assessing / focused.

4. `brief_fog_04_confident_after_reveal.png`
- Character confident after revealing or knocking back the imp.
- Preferred pose: hand on hip or smug/tucking-hair pose.
- Expression: confident, slightly smug, controlled.
- Imp fallen on backside is monster/Area 10 side, but character staging should support it.

5. `brief_fog_05_warning_spark_imp_retreat.png`
- Character with sparkle/light in hand again.
- Pose: controlled threat, confident, ready to continue.
- Expression: confident, not rageful.
- Imp retreat/flee is now a static visual-novel scene-state requirement, not animation.

Additional Brief Fog route stills now needed:

6. Escape route image/state
- Same cave/lighting/outfit language.
- Character retreating, turning back, or visibly deciding to leave.
- Should read as leaving the fog encounter, not combat.

7. Venture Forth route image/state
- Same cave/lighting/outfit language.
- Character moving deeper onward or bypassing the assistance path.
- Should read as bold/confident/risky progression, not careful tutorial support.

## Brief Fog outfit direction — wizard light / stars outfit

Status: active visual direction / not locked final until Izzy approves exact outfit asset

Izzy has supplied wizard-light / stars outfit sprite references and likes this direction for Brief Fog because the room involves magic, light, and fog.

Current master recommendation:
- Use the wizard light / stars outfit as the likely locked Brief Fog room outfit for visual-novel stills.
- Keep room outfit lock separate from the broader wardrobe system.
- The outfit may be room-specific for story/CG consistency even if later gameplay supports outfit changes elsewhere.
- Remove the modern/adventurer satchel bag if it distracts, or redesign it to be more on-theme.
- Possible bag redesign: smaller spell satchel, moon/star pouch, scroll case, charm pouch, or crystal pouch.
- Do not let bag removal/redesign change the body silhouette, pose alignment, or character identity.

Relevant outfit consistency notes:
- Blonde hair identity must stay consistent.
- Keep green eyes where visible.
- Keep right-arm tattoo rule consistent; do not add tattoos to both arms.
- Keep boots/socks, skirt/cape length, star detailing, moon charms, sleeve sheerness, and corset colour consistent once a version is chosen.
- The pink/lilac star outfit and darker navy/purple star cloak outfit are both possible directions, but final Brief Fog outfit should be chosen based on consistency with the current cave stills.
- The darker navy/purple cloak reads more cave/magic/night and may fit Brief Fog better than the pale pink version, but Izzy has not locked the final outfit version yet.

## Future visual-novel/story upgrade note

Status: future direction / does not block cave functionality

Izzy has provided references for future visual-novel dialogue/text-box presentation and wants the project to eventually include:
- future characters
- story beats
- dialogue/text boxes
- choice screens
- visual-novel style scene progression

This should be treated as an upgrade layer, not the core cave function.

Important implementation/asset rule:
- The core cave writing workflow must remain functional even if story mode is temporarily disabled or simplified for focus mode.
- Do not bake dialogue/text boxes into final background art unless Izzy explicitly asks for that.
- Keep UI overlays, text boxes, and story choices separate from character/background art where practical.
- Future story/textbox style is not fully settled yet, so references should be recorded as direction, not locked final style.

## Brief Fog outfit modularity rule

Status: active rule / applies immediately

Clothing is not the main approval point for the Brief Fog duel preview because the worn outfit may change in-game depending on what outfit the player has selected.

Area 1 should focus approval on:
- approved base girl identity
- adult proportions and non-childlike read
- pose clarity
- scene-state staging
- expression
- hand position
- twinkle/sparkle magic direction
- whether the character pose can work as a reusable base for multiple outfits
- whether character, monster/smoke, and magic/effects can be separated cleanly later

The jester outfit can be used as a reference or one outfit variant, but it is not the locked required clothing for every Brief Fog pose.

Do not reject a Brief Fog preview only because the character is not wearing the jester outfit. Do reject it if the pose, character identity, proportions, art style, scene direction, or asset separation is wrong.

Preferred production direction:
- create the pose as a reusable character pose base first
- then apply outfit variants later where needed
- keep magic/effect overlays separate where practical
- keep monster/smoke assets separate from the character where practical

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

## Rejected base-pose issue — character looks too childlike

Status: active correction needed

Izzy rejected the most recent base-pose references because the character reads too childlike. This is not acceptable for the locked player character.

Reasons identified from the rejected previews:
- head/eyes read too large compared with the body
- body proportions were simplified into a doll/chibi-like shape
- shoulders/torso were too soft and narrow
- posture looked timid/passive instead of adult academic adventurer
- plain tank/shorts plus soft expression made the figure read younger
- some poses made the arms/hands look small or juvenile

Correction rule for all next Area 1 previews:
- keep the approved base girl's identity, but make her read as an adult young woman, not a child
- do not enlarge head or eyes
- keep adult proportions, longer body line, and confident posture
- avoid timid doll poses
- keep the face soft but not babyish
- outfit and pose should support academic-adventurer maturity
- do not use over-sexualised fixes; the correction is proportion, posture, styling, and expression

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
- childlike/chibi/doll proportions
- timid poses that make the character look younger than intended

## Character-only PNG needs

- full-body character pose PNGs for each of the five visual-novel states above
- same canvas/alignment across all five
- black-background previews first for approval
- final transparent PNGs after Izzy approves previews
- pose should be usable as a reusable base for multiple possible worn outfits

## Separate effect overlays needed

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
- confident pose after imp reveal
- sparkle threat pose while imp retreats
- escape route still / pose
- venture-forth route still / pose

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
- `brief_fog_05_warning_spark_imp_retreat.png`
- `brief_fog_06_escape_route.png`
- `brief_fog_07_venture_forth_route.png`
- `brief_fog_hand_sparkle_overlay_v01.png`
- `brief_fog_twinkle_shot_overlay_v01.png`
- `brief_fog_afterglow_overlay_v01.png`

## Open issues

- The current avatar still depends on CSS filter blending. A cave-lit PNG would reduce pasted-on feeling.
- Final pose assets must not introduce white halos.
- The current CSS visual response can only approximate facing/casting. Final pose art is needed for proper visual-novel scene states.
- The next image generation pass must fix art style before approval can happen.
- Izzy needs to approve the corrected pose/art-style direction before final PNG production.
- Area 1 must now explicitly tell Izzy when it updates this note and must send previews/output directly if there is anything visual to approve.
- The next preview must fix the childlike read by correcting proportions, posture, styling, and expression while preserving the approved base girl.
- Clothing is not the main approval point for the Brief Fog visual-novel states because the worn outfit can change in-game; pose, identity, adult proportions, staging, and separated effects matter more.
- The exact Brief Fog room outfit is not locked yet, but wizard light / stars outfit is the leading direction.
- Bag should be removed or redesigned to feel more magical/on-theme if it distracts from the Brief Fog outfit.
- Future visual-novel text boxes and story choices are planned, but art style and UI treatment are not locked yet.
