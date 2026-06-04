# Area 10 — Visual scenes

Last updated: 2026-06-04

## Area role

Area 10 owns visual/game-screen design, room concepts, clickable zones, scene states, and art requirements.

Area 10 does not edit repo code or make save-system decisions.

## Current priority for Area 10

Area 10 is a support owner for Priority 1 and a lead owner for Priority 4.

For Priority 1, Area 10 needs to support Brief Fog v0.1 by defining:
- scene-first placement for chunk cards and compact panels
- fog patch clickable zones
- task parchment / desk clickable zone
- flag marker and missed-loot stash placement
- route-forward placement
- placeholder Command Imp / hidden-eye visual states

For Priority 4, Area 10 owns asset polish:
- sharpen Cave Base background later
- improve placeholder Cave Base background if needed
- define final Cave Base visual states
- define final Brief Fog visual states
- define Command Imp visual needs
- define fog-clearing transition states

## Current locked Study Cave opening visuals

Flow:

1. Task Map Threshold
2. Cave Base
3. Brief Fog / Question-Unpacking Chamber

## Task Map Threshold

Purpose:
- happens before entering cave proper
- uses outside cave opening/map board idea
- selected task becomes the map
- route and current chamber are visible
- no deep unpacking here

Clickable zones:
- map board
- quest board
- warning sign
- cave entrance

## Cave Base

Purpose:
- first interior safe hub
- not a challenge room
- outfit chest
- cave journal / route ledger
- saved progress display
- progress shelf / trophy wall
- visible exits to active chamber route

Current repo placeholder:

`docs/assets/study-cave/cave-base-placeholder-v01.jpg`

Current issue:
- background needs sharpening later
- this is flagged as asset polish, not urgent route logic

Clickable zones needed:
- outfit chest
- cave journal / route ledger
- progress shelf / trophy wall
- active route exit
- return path

## Brief Fog / Question-Unpacking Chamber

Purpose:
- first real working chamber
- dark misty room
- desk/work area
- task parchment/delivered brief object
- lots of little eyes hiding in fog
- character present
- fog represents unclear task wording and dispersed things to do
- character uses magic light spells to identify what the task asks

Current repo placeholder:

`docs/assets/study-cave/brief-fog-placeholder-v01.jpg`

Clickable zones needed:
- task parchment / delivered brief object
- fog patch
- character light spell
- revealed Command Imp
- flag marker
- missed loot stash
- route forward

## Brief Fog static slideshow / composite production direction

Status: active / replaces animation-heavy plan for this room

Izzy wants Brief Fog to feel like a visual-novel game scene, not a utility screen. The current working cave functionality must be preserved, but the next visual pass should restore in-world interaction.

Core direction:
- Use static choice-dependent slideshow / scene stills, not layered animation or video.
- Use the first image as the opening state where the player sees the cave, the fog, the heroine, and a readable in-world object such as the scroll/task parchment.
- The player should click the scroll/read prompt, not a detached utility rail, to enter the scene choice.
- After clicking the read prompt, swap to the second scene still and show a choice overlay.
- Choice overlay text:
  - Header: Begin Quest?
  - Clickable 1: VANQUISH THE FOG
  - Header: Scared?
  - Clickable 2: Escape…
  - Header: Confident, Bold, Perhaps Unwise?
  - Clickable 3: Venture Forth… Into The Unknown
- Route behaviour:
  - VANQUISH THE FOG begins the assisted Brief Fog task/chunk flow.
  - Escape leaves the cave.
  - Venture Forth skips the assistance chunks and progresses to the next/missed-loot path.

Consistency / asset-building rule:
- Do not regenerate whole images for every correction if that causes drift.
- Keep the background static wherever possible.
- Use a stable background plate, then place/edit the girl as a separate layer, and place/edit the Command Imp/fog as a separate layer.
- This is to prevent background drift, unwanted character movement, and inconsistent imp placement.
- If a full baked still is exported for the slideshow, it should be created from stable components: background plate + girl layer + imp/fog layer + optional baked glow/effect.
- Text boxes and choice UI should remain separate from the art unless Izzy explicitly asks for baked text.
- For the current static slideshow, spell glow can be baked into the relevant stills. Separate overlays are optional later, not required now.

Placement rules:
- Keep the same camera and background plate across the main Brief Fog slideshow frames.
- Keep the girl’s position stable unless the scene beat explicitly needs her to move.
- Keep the fog/imp on the opposite side from the girl and maintain consistent scale.
- Prioritise consistent placement over novelty.
- If editing a frame, alter only the necessary layer: girl, imp/fog, glow, or UI. Do not change the whole scene.
- The scroll/task parchment should remain an obvious clickable in-world object for the writing task.

Command Imp / fog direction:
- Command Imp should feel like a dark-fantasy goblin/fog creature, not cute and not generic smoke only.
- It can have amber/gold eyes in the fog and a shadowy silhouette before reveal.
- Revealed imp should stay in the same family as the hidden eyes/fog mass.
- It should support the scene beats: hidden in fog, revealed by sparkle magic, knocked back/fallen, retreating.
- Area 10 owns imp/fog visual requirements and should coordinate with Area 1 character staging.

Current still-sequence use:
- BF01 opening still: calm/uneasy opening, scroll readable/clickable.
- BF02 read/choice still: more tension after clicking the scroll; choice overlay appears.
- BF03 charge / vanquish start: heroine begins spell charge.
- BF04 threat manifestation: fog/imp reveal or stronger visible threat.
- BF05 aftermath / transition: glow fades, route can continue.
- BF06 escape route: new still needed, heroine retreating or turning back.
- BF07 venture forth route: new still needed, heroine going deeper / bypassing help.

Outfit / glow visual note:
- Brief Fog leading outfit direction is wizard light / stars outfit, likely darker navy/purple star cloak rather than the pale pink version.
- Bag should be removed or redesigned as a smaller magical item: spell pouch, moon/star pouch, scroll case, crystal pouch, or charm pouch.
- During spell charge/cast frames, selected cloak stars and moon/star accessories may glow softly.
- Hair may have a subtle rim glow from reflected magic light, but it should not become fully luminous.
- Do not make the outfit neon. Keep the glow magical, warm, and controlled.

## Required fog mini-scene sequence

1. character has sparkle/light in hand, fog with hidden eyes is present
2. character fires light beam at fog, eyes look shocked
3. light beam stops, character remains in casting pose, fog clears from that patch, Command Imp is revealed
4. character becomes confident; imp falls on its backside
5. character threatens with sparkle again; imp runs away

## Placeholder acceptable now

- static backgrounds
- CSS glow
- CSS fog patches
- simple eye dots
- simple Command Imp silhouette
- simple light beam effect
- simple character placeholder pose
- parchment overlays
- route overlay
- progress markers
- flag/missed-loot icons

## Must wait for custom art later

- final character pose set
- final Command Imp art
- final Brief Fog static slideshow frames
- full fog-clearing image sequence
- imp falling/running stills
- custom Cave Base chest/progress art
- final route map art
- full chamber-specific background set

## Brief Fog and Cave Base scene-first layout support

Status: completed needs further edits

This update supports the current repo priority: Brief Fog v0.1 should become a usable scene-first Question-Unpacking Chamber, not a long scrolling dashboard form.

### Brief Fog hotspot placement

Brief Fog should use the cave scene as the base screen. The user should click in-world objects to open compact panels.

Required hotspots:

- task parchment / desk hotspot: lower centre or centre-left. Opens the whole task brief overview, not every chunk at once.
- fog patch hotspots: separate mist patches across the room. Each patch represents one task/question/guidance chunk.
- flag marker: near the desk or work area, shown as a red ribbon, warning pin, cracked rune, or pinned scrap.
- missed loot stash: lower side or floor area, shown as a dim geode, satchel, small crate, or tied scroll bundle.
- route-forward: back centre or back right. Visible immediately, but fogged/locked until enough chunk progress is made.

Recommended fog patch placement:

- patch 1 near the task parchment / desk
- patch 2 mid-room, partly blocking the route
- patch 3 right side or upper-right cave wall
- patch 4 near the route-forward opening

### Compact panel / drawer layout

The chunk interaction should open from a clicked fog patch.

Flow:

Click fog patch → selected patch glows → compact drawer opens → user processes that chunk → user can Save Loot, Add Flag, Mark Missed Loot, Clear Patch, or Close → scene state updates.

Use a right-side parchment drawer or bottom drawer. Preferred v0.1 direction is a right-side parchment drawer taking roughly one third of the screen, with the cave still visible behind it.

The drawer should show only the selected chunk. It should not show the whole task as a full page.

Suggested drawer content:

- chunk number or short title
- selected task/guidance sentence
- what does this ask me to do?
- important words / command words / keywords
- plain meaning note
- action-created note
- Save Loot
- Add Flag
- Mark Missed Loot
- Clear Patch
- Close / Return to Cave

### How to avoid scrolling forms

Do not place a full Task Intake form permanently under the cave scene.

Avoid long forms by:

- showing one selected chunk at a time
- keeping the cave scene as the base screen
- opening panels only from hotspots
- using compact right-side or bottom drawers
- using short fields with expandable detail areas if needed
- using compact progress chips instead of long visible lists
- putting flags and missed loot into separate review drawers
- returning the user to the cave view after each chunk or clear action

### Visual state changes after a chunk is processed

Each chunk should visibly change the scene.

Unprocessed:
- dark fog patch with little eyes

Selected:
- fog patch glows or brightens slightly

Processing:
- light beam / sparkle effect points to the patch

Cleared:
- fog patch thins or fades
- eyes disappear
- small clue sparkle, geode, or revealed marker remains
- route-forward glow increases slightly

Flagged:
- patch remains partly cloudy
- red ribbon / warning marker appears beside the patch
- flag count updates in compact HUD or drawer

Missed loot:
- patch clears enough to continue
- dim geode / satchel marker appears beside the patch
- missed-loot count updates in compact HUD or drawer

Route-forward:
- locked/inactive = fog blocks route
- partly open = fog thinning, faint glow visible
- ready = route glow visible
- completed = clear route to next chamber

### Placeholder visual effects main repo can use now

Main repo can use placeholder effects now. Do not wait for final art.

Acceptable v0.1 placeholders:

- CSS fog blobs with opacity/blur
- small eye dots inside fog patches
- CSS glow around selected fog patch
- CSS light beam from character hand to selected fog patch
- small sparkle particles near cleared patch
- simple Command Imp silhouette or revealed blocker placeholder
- red ribbon / warning icon for flags
- dim geode / satchel icon for missed loot
- route-forward glow
- parchment side drawer
- compact HUD chips for processed / flagged / missed-loot counts

### Final art needed later

Final art/polish needed later:

- sharper Brief Fog chamber background
- custom fog patch layers
- custom eyes-in-fog art
- custom light beam and sparkle overlays if not using baked slideshow stills
- cleared-fog visual state
- final clue / geode icons
- Command Imp reveal art
- character casting pose
- character confident pose
- final flag marker prop
- final missed-loot stash prop
- final route-forward locked / partial / open states
- static background plate for Brief Fog slideshow
- girl layer aligned to the static background plate
- imp/fog layer aligned to the static background plate
- baked still exports for the approved slideshow states

### Cave Base visual guidance

Cave Base remains a safe hub, not a challenge room.

It should show:

- character in room
- outfit chest
- cave journal / route ledger
- progress shelf or trophy wall
- active route exit
- optional return path

Cave Base hotspots:

- outfit chest = outfit/change placeholder panel
- cave journal / route ledger = saved progress drawer
- progress shelf / trophy wall = completed chamber / collected loot review
- active route exit = continue to current chamber
- return path = return to Task Map Threshold if implemented

Cave Base panels should also be compact. Saved progress should open from the cave journal / route ledger as a drawer or compact panel. It should not be visible as a large dashboard form by default.

### Cave Base background sharpening decision

Cave Base background sharpening is a future asset task, not a blocker and not a reason to generate a new image now.

Reason:

- main repo already has a Cave Base placeholder background
- Cave Base opens successfully
- character is visible at a workable size
- the current implementation priority is Brief Fog scene-first chunk interaction
- sharpening/final Cave Base art belongs to Priority 4 asset polish

Status: completed needs further edits because the placeholder can support implementation now, but final sharpening and custom art are still needed later.
