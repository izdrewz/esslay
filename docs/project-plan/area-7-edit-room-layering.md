# Area 7 — Edit Room Layering Correction

## Area

Area 7 — Edit room and mood board

## Purpose

The edit room is a static clickable room inside the house hub. It is the planning, editing, visual inspiration, and academic-prep room. It should feel like a cosy fantasy scholar/adventurer workspace that matches the cottage exterior and academic adventurer character style.

## Core design

The edit room should be a characterless static room background with layered clickable hotspots. The room should contain a large mood board wall, a desk/writing workspace, a source shelf/library area, a scraps chest/drawer area, and a door/back exit to return to the main house hub.

## Important layering rule

The edit room background must not have the character baked into it.

The game uses layered visuals so the character can change outfits, poses, accessories, and later paper-doll clothing layers.

## Final decision

Room images must be characterless backgrounds. The character is always a separate transparent PNG layer above the room. Any edit-room image with the character included is inspiration only, not final room background.

## Keep from previous Area 7 plan

- keep the route, hotspots, and navigation idea
- keep the mood board hotspot
- keep the desk/writing workspace hotspot
- keep the source shelf/library hotspot
- keep the scraps chest/drawer hotspot
- keep the door/back hotspot
- keep Version 0.1 as a static screen with placeholder interactions
- keep the future editable mood board idea
- keep the semi-free grid idea for the later board editor

## Change from previous Area 7 plan

- do not use any edit-room image with the character included as final background art
- treat character-included edit-room images as concept/reference only
- final edit-room background must be empty room art with no character
- character art must be rendered separately as a transparent PNG layer above the room
- do not build outfit layering yet
- do not change the hotspot system

## Required visual layer order

1. edit room background layer
2. character pose transparent PNG layer
3. future optional outfit/accessory layers
4. hotspot overlay layer
5. optional UI labels/testing overlay

## Version 0.1 scope

Version 0.1 should only add the static edit room screen and placeholder interactions. It should not build the full editable mood board yet.

Version 0.1 requirements:

- add a clickable edit room entrance from the main house hub
- add a new edit room screen/view
- use a static characterless edit room background image
- add a visible mood board wall
- add clickable hotspot placeholders
- add a door/back hotspot that returns to the house hub
- show placeholder click responses for mood board, desk, source shelf, and scraps chest
- keep the character static and layered separately
- do not add drag-and-drop
- do not add the full mood board editor
- do not add AI writing tools yet
- do not add source extraction yet
- do not build outfit layering yet

## Clickable hotspots for Version 0.1

### mood_board

Label: Mood Board  
Function now: placeholder click response  
Future function: opens editable mood board

### desk

Label: Desk  
Function now: placeholder click response  
Future function: opens writing/editing workspace

### door

Label: Back to House  
Function now: returns to house hub  
Future function: same

### source_shelf

Label: Sources  
Function now: placeholder click response  
Future function: opens source library / quote bank

### chest

Label: Scraps  
Function now: placeholder click response  
Future function: opens fix-later notes, missed loot, saved fragments

## Suggested hotspot ratios for the 16:9 edit-room layout

- door: x 0.00–0.16, y 0.15–0.77
- mood_board: x 0.31–0.72, y 0.07–0.50
- desk: x 0.59–0.93, y 0.54–0.93
- source_shelf: x 0.72–0.83, y 0.17–0.59
- chest: x 0.00–0.14, y 0.72–0.98

## Mood board future function

The mood board should eventually hold:

- uploaded inspiration images
- colour swatches
- custom pattern swatches
- wallpaper ideas
- carpet ideas
- furniture references
- outfit references
- command words
- essay keywords
- quote scraps
- mind-map fragments
- fix-later notes
- missed-loot notes
- cave quest reminders

## Editing model

Use fixed placeholder slots in Version 0.1. Later, use a semi-free grid for the mood board so the user can arrange items flexibly without needing a full free-drag Sims-style system.

## Visual language

Use parchment scraps, pinned notes, wax seals, ribbon tags, stitched fabric pieces, pressed flowers, brass pins, small map fragments, ink labels, and wooden labels. Avoid modern app cards, neon colours, whiteboard styling, and office-dashboard visuals.

## Asset structure

```text
docs/assets/rooms/edit-room/edit-room-background.png
docs/assets/characters/academic-adventurer/poses/[pose].png
docs/assets/outfits/
docs/assets/furniture/
docs/assets/patterns/
```

## Final note

The corrected Area 7 background-only image is the new layout reference. It should replace any character-included edit-room concept as the repo-facing direction.
