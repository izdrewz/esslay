# Area 7 — Edit Room / Interior Design Board Placement Specification

## Area

Area 7 — Edit Room and Interior Design Board

## Art basis

Image A locks the room itself: perspective, camera angle, proportions, door, window, beams, wall planes, and floor.

Image B is only the furnishing and styling guide.

The furnishing direction should be practical interior-planning studio, not floral cottage clutter.

The wall hotspot is called **Interior Design Board**.

## Fixed-perspective rule

Every edit-room asset must match the same base-room camera angle, canvas size, proportions, and perspective exactly.

The empty base, furnished default, lighting variants, furniture layers, rugs, wall items, window items, board items, and decor must all align to the same room template.

Do not generate alternate camera angles for this room.

## Permanent architecture list

These are the only things that should stay baked into the empty base room.

### Baked into the base

- room perspective and camera angle
- ceiling plane
- exposed ceiling beams
- vertical timber support posts
- plain plaster wall surfaces
- wood skirting/base trim
- plain wood floorboards
- left arched door opening with fixed door and hardware
- right arched window opening
- structural stone/wood window surround
- window sill
- built-in architectural framing only

### Not baked into the base

- no board
- no board contents
- no wall lantern
- no desk
- no chair
- no shelf/bookcase
- no chest
- no rug
- no candles
- no desk lamp/lantern
- no books
- no papers
- no scrolls
- no plants
- no decorative wall items
- no curtains
- no sunlight patch on floor
- no dramatic baked lighting mood

The empty base should read as a plain, neutral room shell ready for layers.

## Separate editable layer list

These should all be separate transparent assets, not baked into the room.

### Wall-mounted assets

- Interior Design Board frame
- Interior Design Board backing panel
- Interior Design Board contents cluster: room sketches, swatches, material strips, pinned notes, clipped references
- wall lantern / sconce
- optional extra note/swatch overlays later

### Floor and against-wall assets

- chest
- chest-top prop pack: rolled plans, small jars, stacked items
- rug

### Right-side furniture assets

- desk
- chair
- source shelf / bookcase
- shelf contents pack: books, rolled plans, storage items
- desk props pack: papers, tools, ink, small objects
- desk light pack: lantern, candle set, small lit objects

### Window-related future layers

- window sash / glazing layer if future window-style swapping is needed
- curtain set
- window dressing / trim add-ons
- window-sill decor
- exterior glow/weather pass

### Lighting and FX layers

- morning daylight overlay
- afternoon daylight overlay
- evening warm ambient overlay
- night dark ambient overlay
- rainy cool-window overlay
- sunlight floor patch overlay
- candle/lantern glow overlay
- soft shadow mask
- optional subtle conjured-star overlay for night

## Placement / anchor map

All placements assume the perspective of Image A stays unchanged.

| Asset name | Slot / anchor ID | Approximate position | Scale notes | Depth notes | Surface / attachment |
|---|---|---|---|---|---|
| Interior Design Board frame | A7-WALL-BOARD | Main back wall, centred between the inner timber posts | Large dominant wall feature, about one-third of room width | Behind all floor furniture, in front of wall | Wall-mounted |
| Interior Design Board contents cluster | A7-WALL-BOARD-CONTENT | Same position as board frame, inset inside it | Slightly smaller than frame | Same depth as board | Wall-mounted |
| Wall lantern / sconce | A7-WALL-LIGHT-LEFT | Left side wall, between door and board, upper-mid height | Small accent object | In front of wall, behind chest | Wall-mounted |
| Chest | A7-FLOOR-CHEST | Left floor zone, just right of door, under lantern area | Medium | In front of wall, behind front edge of rug | Floor / against wall |
| Chest-top prop pack | A7-PROP-CHEST-TOP | Resting on chest lid | Small to medium | Slightly in front of chest | On furniture |
| Rug | A7-FLOOR-RUG | Centre-lower floor, extending under front of desk/chair zone | Large floor anchor piece | Sits under chair and desk front, above floor | Floor |
| Source shelf / bookcase | A7-FURN-SHELF | Back-right zone, against wall, stopping before the window opening | Tall medium-large asset | Behind desk front edge, in front of wall | Floor / against wall |
| Shelf contents pack | A7-PROP-SHELF-FILL | Inside/on the shelf | Scaled to shelf | Same depth as shelf, slightly forward | On furniture |
| Desk | A7-FURN-DESK | Right side, under and slightly left of the window area | Large working object | In front of wall and partly overlapping rug area | Floor / against wall |
| Chair | A7-FURN-CHAIR | In front of desk, slightly pulled out | Medium | In front of desk | Floor |
| Desk props pack | A7-PROP-DESK | On desk surface, mainly centre-right | Small clustered props | In front of desk top | On furniture |
| Desk light pack | A7-LIGHT-DESK | On desk surface, near window side / working side | Small but visually important | Same plane as desk props | On furniture |
| Window dressing set | A7-WINDOW-DRESSING | Around window opening | Medium | In front of window opening, behind desk edge | Attached to window |
| Window glow / weather pass | A7-LIGHT-WINDOW | Aligned to window opening and floor spill area | Scene-scale overlay | Above room/furniture layers | Lighting overlay |
| Sunlight floor patch | A7-LIGHT-FLOORPATCH | Lower-right/centre floor area from the window direction | Soft broad patch | Above floor, below character | Lighting overlay |

Position shorthand:

- board zone = centre back wall
- chest zone = left floor against wall
- desk zone = right work area
- shelf zone = back-right support furniture
- rug zone = central floor anchor
- Interior Design Board hotspot should sit over the board zone, not over the whole wall

## Furnished default composition list

These separate assets together recreate the current furnished inspiration look.

Required to recreate the furnished default:

- empty base room
- Interior Design Board frame
- Interior Design Board contents cluster
- wall lantern / sconce
- chest
- chest-top prop pack
- rug
- source shelf / bookcase
- shelf contents pack
- desk
- chair
- desk props pack
- desk light pack

Recommended furnishing style:

- Interior Design Board content should include interior sketches, room layouts, furniture ideas, pinned material swatches, clipped references, and short practical notes
- keep the room cleaner and more design-focused
- avoid heavy florals, dangling vines everywhere, overly cute scrapbook clutter, essay-only mood board styling, and soft pink cottage dressing unless deliberately chosen later

This room should feel like a working design/edit room, not a decorative greenhouse study.

## Lighting notes

### Physical light objects

These are actual placed objects and should be separate assets.

- wall lantern / sconce
- desk lantern
- desk candles / tall candle sticks if included in desk light pack

### Lighting overlays

These are not furniture objects. They should sit above the room as lighting passes.

- morning daylight wash
- afternoon warm-neutral daylight wash
- evening amber room wash
- night darker ambient wash
- rainy cool-window ambient wash
- window light spill
- sunlight patch on floor
- candle/lantern glow halos
- soft shadow masks
- optional subtle night-star effect

### Where the glow should fall

Wall lantern glow:

- around the left wall near the door
- slight warm falloff onto chest zone

Desk lantern / candle glow:

- desk surface
- chair edge
- lower edge of board nearest the desk side
- nearby shelf edge

Window daylight:

- window recess
- right wall edge
- floor patch angled inward

Night star effect:

- extremely subtle
- best near upper room space or lightly near the window
- should feel magical, not glittery

## Version 0.1 recommendation

This is the smallest sensible first asset pack to test the room without overbuilding it.

Minimum practical V0.1 asset pack:

1. empty base room
2. Interior Design Board combined asset: frame + backing + content merged for now
3. chest combined asset: chest + top props merged for now
4. rug
5. source shelf combined asset: shelf + shelf contents merged for now
6. desk
7. chair
8. desk props + desk lights combined asset
9. wall lantern / sconce
10. one neutral daylight lighting overlay
11. one evening warm lighting overlay

This proves:

- the base room perspective works
- separate furniture layering works
- the Interior Design Board hotspot works
- the furnished composition can be rebuilt from separate assets
- lighting can shift mood without repainting the room
- the character can remain a separate layer above the room

## What can wait until later

- separate board content swaps
- curtain system
- window-style swaps
- extra shelf contents variants
- rainy/night special passes
- conjured stars
- alternate rug/furniture options
- fine micro-clutter packs

## Asset naming direction

Use this style for future layer files:

```text
docs/assets/rooms/edit-room/edit-room-empty-base.png
docs/assets/rooms/edit-room/edit-room-furnished-default.png
docs/assets/rooms/edit-room/furniture-layers/a7_board_combined.png
docs/assets/rooms/edit-room/furniture-layers/a7_chest_combined.png
docs/assets/rooms/edit-room/furniture-layers/a7_rug_main.png
docs/assets/rooms/edit-room/furniture-layers/a7_source_shelf_combined.png
docs/assets/rooms/edit-room/furniture-layers/a7_desk.png
docs/assets/rooms/edit-room/furniture-layers/a7_chair.png
docs/assets/rooms/edit-room/furniture-layers/a7_desk_props_lights.png
docs/assets/rooms/edit-room/furniture-layers/a7_wall_lantern.png
docs/assets/rooms/edit-room/lighting-overlays/a7_lighting_neutral_day.png
docs/assets/rooms/edit-room/lighting-overlays/a7_lighting_evening_warm.png
```

## Final Area 7 recommendation

Room name: **Edit Room**

Main wall hotspot name: **Interior Design Board**

Best working split:

- base room = architecture only
- furnished default = rebuilt from separate assets
- lighting = mostly overlays
- character = always separate
- perspective = always locked to Image A
