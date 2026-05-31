# Area 10 — Visual scenes

Last updated: 2026-05-31

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
- final Brief Fog layered animation
- full fog-clearing image sequence
- animated light beam
- imp falling/running animation
- custom Cave Base chest/progress art
- final route map art
- full chamber-specific background set
