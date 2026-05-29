# Area 14 — V0.1 Asset Upload Checklist

## Purpose

This checklist records the exact binary image files needed before the edit room can switch from one baked furnished background to a true layered room test.

## Required repo paths

Copy the image files into these exact paths:

```text
docs/assets/rooms/edit-room/edit-room-empty-base.png
docs/assets/rooms/edit-room/furniture-layers/interior_design_board_frame.png
docs/assets/rooms/edit-room/furniture-layers/interior_design_board_contents.png
docs/assets/rooms/edit-room/furniture-layers/desk.png
docs/assets/rooms/edit-room/furniture-layers/desk_chair.png
docs/assets/rooms/edit-room/furniture-layers/rug_main.png
docs/assets/rooms/edit-room/furniture-layers/desk_books_and_tools.png
docs/assets/rooms/edit-room/previews/area14_v01_preview_all_assets_on_base.png
docs/assets/rooms/edit-room/previews/area14_v01_contact_sheet_preview.png
docs/assets/rooms/edit-room/previews/area14_composite_check_on_empty_base.png
```

## Canvas requirement

The current Area 14 asset pack is 1536 × 864.

The empty base image used with these layers must also be 1536 × 864, otherwise the full-canvas transparent PNG layers will not align correctly.

## Version 0.1 layer order

Use this order for the first layered test:

1. edit-room-empty-base.png
2. interior_design_board_frame.png
3. interior_design_board_contents.png
4. rug_main.png
5. desk.png
6. desk_books_and_tools.png
7. desk_chair.png

## After upload

After these files are committed to the repo, the next safe implementation step is to add a layered edit-room test view that renders the empty base plus these six PNG layers.
