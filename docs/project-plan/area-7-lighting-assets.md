# Area 7 — Edit Room Lighting Asset Pack

The Area 7 branch returned a lighting-variant asset pack for the edit room.

Zip received in master chat:

```text
area7_edit_room_lighting_variants_1920x1080.zip
```

## Contents

The pack contains 12 files:

```text
area7-lighting-contact-sheet-reference.png
edit-room-furnished-base-neutral-1920x1080.png
edit-room-morning-1920x1080.png
edit-room-afternoon-1920x1080.png
edit-room-evening-1920x1080.png
edit-room-night-1920x1080.png
edit-room-rainy-1920x1080.png
overlay-morning-1920x1080.png
overlay-afternoon-1920x1080.png
overlay-evening-1920x1080.png
overlay-night-1920x1080.png
overlay-rainy-1920x1080.png
```

## Dimensions

- furnished background variants: 1920 × 1080
- overlay variants: 1920 × 1080
- contact sheet: 960 × 870

## Intended repo location

When the image assets are added to the repo, place them under:

```text
docs/assets/rooms/edit-room/lighting/
```

## Version 0.1 use

Do not switch the working edit-room screen automatically yet.

Version 0.1 should keep the current furnished edit room screen working first, then optionally add a simple lighting selector once the assets are committed and tested.

Recommended order:

1. Add the lighting PNGs to `docs/assets/rooms/edit-room/lighting/`.
2. Add a small data file listing lighting modes.
3. Add a simple manual selector first.
4. Add automatic local-time detection later.

## Lighting modes

- morning: soft warm daylight
- afternoon: warm neutral study light
- evening: amber candle/lantern glow
- night: darker candlelit study mood with optional subtle conjured stars later
- rainy: cooler dim outside light with warm interior candle contrast

## Layering rule

The character stays separate from the room. Lighting applies to the room background/furniture composition and should not bake the character into the room image.
