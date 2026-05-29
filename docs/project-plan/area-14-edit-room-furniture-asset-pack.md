# Area 14 — Edit Room Furniture / Decor Asset Pack

## Status

This is a support-chat asset planning result only. It does not take over the repo, restructure the project, or make final implementation decisions.

## Art basis

- Image A = empty base edit room. This controls the true camera angle, room architecture, floor angle, wall spacing, and alignment.
- Image B = furnished inspiration edit room. This controls the furniture choices, decor mood, and furnished composition.

## Key rule

All assets must be drawn to Image A’s exact room template, not Image B’s camera as a separate scene.

Use Image B for object choice and style, not for camera or layout changes.

## Asset list

### Core required pack

1. interior_design_board_frame
2. interior_design_board_contents
3. desk
4. desk_chair
5. bookshelf
6. chest
7. rug_main
8. wall_lantern_left
9. floor_lantern_left
10. desk_lantern
11. candle_set
12. desk_books_and_tools
13. window_sill_decor
14. shelf_books_decor

### Recommended extras visible in Image B

15. chest_top_scrolls_and_jars
16. bookshelf_top_decor
17. floor_books_right
18. desk_mug_or_pot
19. light_glow_wall_lantern_left
20. light_glow_floor_lantern_left
21. light_glow_desk_lantern
22. light_glow_candle_set

Glow assets are useful because the inspiration room has a warm lit atmosphere, but physical objects and light effects are better kept separate.

## Asset table

| Asset id | Label | Separate? | Editable later? | Likely category | Room position | Type |
|---|---|---|---|---|---|---|
| interior_design_board_frame | Interior design board frame | Yes | Yes | Wall decor / feature object | Large central wall, between door area and right-side structural post | Wall-mounted |
| interior_design_board_contents | Interior design board contents | Yes | Yes | Board content / decor | Inside board frame | Wall-mounted |
| desk | Main edit desk | Yes | Yes | Furniture | Right side of room, under window, extending leftward into room | Floor-standing |
| desk_chair | Desk chair | Yes | Yes | Furniture | In front of desk, centre-right foreground | Floor-standing |
| bookshelf | Right-side bookshelf | Yes | Yes | Furniture | Against right wall, between board area and window/desk zone | Floor-standing |
| chest | Storage chest | Yes | Yes | Furniture / storage | Left wall area below board zone, near door | Floor-standing |
| rug_main | Main room rug | Yes | Yes | Floor decor | Large central floor area | Floor |
| wall_lantern_left | Left wall lantern | Yes | Maybe | Wall lighting | Mounted just right of the door arch | Wall-mounted |
| floor_lantern_left | Left floor lantern | Yes | Maybe | Floor lighting | On floor in front of chest area | Floor-standing |
| desk_lantern | Desk lantern | Yes | Maybe | Desk lighting | On desk surface near left side of desk work area | Desk-top |
| candle_set | Candle set | Yes | Maybe | Small lighting decor | Top-of-bookshelf candle group / single candle cluster near right side | Shelf-top |
| desk_books_and_tools | Desk books, papers, tools | Yes | Yes | Desk clutter / decor | Spread across desktop | Desk-top |
| window_sill_decor | Window sill decor | Yes | Yes | Window decor | On right window sill | Window sill |
| shelf_books_decor | Shelf books and decor | Yes | Yes | Shelf decor | Inside bookshelf shelves | Shelf-top |
| chest_top_scrolls_and_jars | Scrolls and jars on chest | Yes | Yes | Surface decor | On top of chest | Surface-top |
| bookshelf_top_decor | Bookshelf top decor | Yes | Yes | Top-surface decor | On top of bookshelf | Surface-top |
| floor_books_right | Small book stack on floor | Yes | Yes | Floor decor | Bottom-right near desk pedestal | Floor |
| desk_mug_or_pot | Mug / small pot on desk | Yes | Yes | Small desk decor | Right side of desktop | Desk-top |
| light_glow_wall_lantern_left | Wall lantern glow | Yes | Maybe | Light overlay | Around wall lantern | Overlay |
| light_glow_floor_lantern_left | Floor lantern glow | Yes | Maybe | Light overlay | Around floor lantern and nearby floor | Overlay |
| light_glow_desk_lantern | Desk lantern glow | Yes | Maybe | Light overlay | Around desk lantern and nearby desk area | Overlay |
| light_glow_candle_set | Candle glow | Yes | Maybe | Light overlay | Around candle set | Overlay |

## Asset-by-asset notes

### interior_design_board_frame

- large framed board on the main wall
- key room identity asset
- drawn to the exact wall angle of Image A
- separate from board contents so board state can change later

Editable later:

- wood tone
- trim tone
- metal corner accents if used

### interior_design_board_contents

- pinned sketches, parchment sheets, swatches, notes, maps, reference scraps
- major focal object in Image B
- can later reflect customisation choices or progression

Editable later:

- paper set
- cloth swatches
- note variants
- colour references
- visible sketch set

### desk

- main desk on the right, running beneath the window
- one main furniture asset for Version 0.1
- long wooden work desk with drawers and work surface

Editable later:

- wood finish
- drawer metal handles
- trim accents

### desk_chair

- wooden chair with padded seat
- separate from desk so it can later change independently
- must match the same floor contact and perspective as the base room

Editable later:

- wood colour
- seat cushion colour
- seat material/pattern

### bookshelf

- tall shelf unit between the board zone and the window/desk zone
- visually anchors the right side of the room
- separate from shelf contents

Editable later:

- wood tone
- shelf trim
- wear amount

### chest

- wooden storage chest below the left wall area
- near wall lantern and under board zone
- one furniture base plus optional top clutter

Editable later:

- wood colour
- metal bands
- lock colour

### rug_main

- large patterned rug in the centre of the floor
- most important floor-perspective test asset
- must be shaped directly to Image A’s floor plane, not generated as a flat top-down rug

Editable later:

- base colour
- border pattern
- central pattern
- wear level

### wall_lantern_left

- wall-mounted lantern to the right of the door
- physical lantern separate from glow

Editable later:

- metal finish
- glass tint
- flame colour if needed

### floor_lantern_left

- floor-standing lantern in front of the chest
- adds warmth and depth to the left side of the room

Editable later:

- metal finish
- glass tint

### desk_lantern

- small lantern on desk surface
- gives the desk a working/study feel

Editable later:

- metal finish
- glass tint

### candle_set

- candle cluster / candle decor visible on the right-side furniture zone
- strongest read is a candle on or near the bookshelf top
- keep as one small separate decor asset first

Editable later:

- wax colour
- holder material
- flame colour

### desk_books_and_tools

- books, parchment, writing tools, papers, possibly quill pot
- grouped asset for Version 0.1
- gives the room its edit/study identity

Editable later:

- book colours
- paper tone
- tool details
- amount of clutter

### window_sill_decor

- visible sill items include books and small plant/pot elements
- keep as one grouped asset first
- can split later if needed

Editable later:

- plant pot colour
- plant style
- book colours
- small decor mix

### shelf_books_decor

- books, scrolls, small decor on bookshelf shelves
- separate from bookshelf body
- keeps the furniture slot and decor slot cleaner

Editable later:

- book spine colours
- scroll tones
- jar/decor colours
- decor density

## Layer order recommendation

Back-to-front order:

1. empty_base_edit_room
2. wall_lantern_left
3. interior_design_board_frame
4. interior_design_board_contents
5. bookshelf
6. shelf_books_decor
7. bookshelf_top_decor
8. chest
9. chest_top_scrolls_and_jars
10. rug_main
11. desk
12. desk_books_and_tools
13. desk_lantern
14. desk_mug_or_pot
15. candle_set
16. window_sill_decor
17. desk_chair
18. floor_lantern_left
19. floor_books_right
20. light_glow_wall_lantern_left
21. light_glow_floor_lantern_left
22. light_glow_desk_lantern
23. light_glow_candle_set

Practical note:

If the chair overlaps the desk front edge, the chair must be stacked in front of the desk. If floor books overlap desk feet, the floor books may need to sit above the desk or be split depending on how the overlap reads.

This list is the starting stack order, not a final engine law.

## Version 0.1 first test pack

The smallest useful first test pack should prove:

- wall-mounted objects align
- floor assets align
- desk furniture aligns
- surface clutter aligns
- the furnished room can be rebuilt over the empty base without perspective drift

Suggested subset:

1. interior_design_board_frame
2. interior_design_board_contents
3. desk
4. desk_chair
5. rug_main
6. desk_books_and_tools

Optional add-ons for a richer first test:

7. bookshelf
8. shelf_books_decor
9. wall_lantern_left
10. desk_lantern

## Optional editable zones

| Asset id | Possible later colour / pattern edits |
|---|---|
| interior_design_board_frame | wood tone, trim tone |
| interior_design_board_contents | paper set, swatches, note colour, sketch variant |
| desk | wood tone, trim, handle metal |
| desk_chair | wood tone, seat colour, seat pattern |
| bookshelf | wood tone, trim |
| chest | wood tone, metal bands, lock finish |
| rug_main | border colour, central pattern, main colourway |
| wall_lantern_left | metal finish, glass tint |
| floor_lantern_left | metal finish, glass tint |
| desk_lantern | metal finish, glass tint |
| candle_set | wax colour, holder colour |
| desk_books_and_tools | book covers, parchment tone, tool details |
| window_sill_decor | plant pot colour, book colours, decor mix |
| shelf_books_decor | book colours, scroll tones, jar colours |

## Asset creation notes

Every asset should be created on top of the full Image A room template so the perspective is locked from the start.

Recommended workflow:

- use Image A as the full working canvas
- place or paint the object directly into its correct position in that room
- match Image A’s wall angle, floor angle, object scale, and depth
- once the object is aligned, hide the room background
- export the object as a transparent PNG
- keep the same full canvas size as the room where possible

## Why full-canvas transparent exports are safest

Full-canvas transparent exports avoid:

- anchor drift
- crop confusion
- camera mismatch
- guessing how far left/right/up/down a furniture piece should sit

If the master project later wants trimmed sprites with anchor points, that can be decided later.

For now, the safest planning assumption is full-room-sized transparent asset layers aligned exactly to the base room.

## Perspective lock notes per asset type

### Wall-mounted assets

These must follow the wall plane exactly:

- interior_design_board_frame
- interior_design_board_contents
- wall_lantern_left

They should not look front-facing if the room wall is slightly angled.

### Floor assets

These must follow the room floor plane exactly:

- rug_main
- chest
- desk
- desk_chair
- floor_lantern_left
- floor_books_right

The rug must not be treated like a flat catalogue image pasted in.

### Surface-top assets

These must inherit the angle of the supporting furniture surface:

- desk_books_and_tools
- desk_lantern
- desk_mug_or_pot
- candle_set
- chest_top_scrolls_and_jars
- window_sill_decor
- shelf_books_decor
- bookshelf_top_decor

## Clean handoff summary

Build the edit room furniture/decor pack as separate transparent PNG assets aligned to the empty base edit room only. Use the furnished inspiration room for object choice and style, not for camera or layout changes.

Core assets are board frame + board contents, desk, chair, bookshelf, chest, rug, wall lantern, floor lantern, desk lantern, candle set, desk books/tools, window sill decor, and shelf books decor.

Recommended test pack first is board frame, board contents, desk, chair, rug, and desk books/tools.

All assets should be created in-place on the base room canvas so perspective, scale, and slot alignment remain exact.
