# House screen plan

## Correction from current build

The house screen should not use a CSS-built doll character. The character should be treated as artwork.

The room background should stay untouched. The avatar should be a separate layer placed on top so it can be swapped through the mirror without changing the room art.

The current tiny chibi-style placeholder sprite is not the intended final direction. The avatar should be closer to the uploaded house base model and outfit references: a taller paper-doll / illustrated game avatar with the same blonde character identity across outfits.

Layer order:

```text
house-room-background
placed-furniture-and-decor
avatar-base-model
avatar-current-outfit
avatar-bag-accessory
avatar-jewellery-or-hair-accessory
foreground-lighting-or-seasonal-effects
UI-buttons
```

## Mirror and appearance system

The room must include a clickable mirror. The mirror opens the appearance panel.

The mirror should control:

- base model / pose
- outfit
- hair variant
- accessories
- satchel
- phone accessory
- saved looks

The mirror should not change the room background.

The mirror UI should feel like character customisation rather than a plain web form. It should show the current avatar preview and outfit cards.

## Avatar art direction

The avatar should follow the uploaded base model and outfit artwork direction.

Core character traits:

- long blonde hair
- soft academic-adventurer style
- layered necklaces
- satchel
- boots
- tattoo details
- whimsical medieval/cottage-adventure clothing

Outfit direction from the uploaded references:

- neutral base model for customisation
- pink babydoll dress outfit
- teal bandeau / patterned trouser outfit
- dark bodice / adventurer outfit
- plaid skirt or scholar outfit
- dark trouser scholar outfit

The character should remain recognisably the same person across outfit changes.

## Artwork storage

The uploaded character sheets are artwork, not personal photos, so they can be used as avatar/art references or stored as game assets where appropriate.

Recommended structure:

```text
assets/avatar/reference/
assets/avatar/base/
assets/avatar/outfits/
assets/avatar/accessories/
assets/rooms/backgrounds/
assets/rooms/furniture/
```

Transparent avatar layers should be PNG or SVG when possible.

If transparent cut-outs are not available yet, the app can use temporary preview images inside the mirror panel, but the room stage should ultimately use transparent avatar layers.

## House exterior / idle art direction

The outside idle screen should use a single finished cottage scene background, not separate CSS-built pieces.

The cottage direction should follow the uploaded cottage references:

- medieval / Tudor-style cottage
- warm cream walls
- brown tiled roof
- wooden shutters and beams
- vines, plants, and small flower boxes
- cosy path and grass
- seasonal ambience layered above the background

The character should be placed as a separate avatar layer in front of the house when needed.

## House levels

### Level 1: Peasant cottage room

Starter medieval room. Plain but warm.

Should include:

- rough wooden floor
- plaster/timber walls
- small bed
- plain desk
- candle or lantern
- small mirror
- tiny shelf for first geodes
- simple chest or wardrobe

Feeling: humble, safe, beginning of the adventure.

### Level 2: Cosy scholar cottage

Unlocked after early XP.

Should add:

- warmer lighting
- better bed
- small rug
- improved writing desk
- bookshelf
- neater storage
- slightly nicer mirror frame

Feeling: study space becoming personal.

### Level 3: Adventurer study room

Unlocked after planning/drafting progress.

Should add:

- map wall
- source shelf
- geode display shelf
- larger desk
- satchel hook
- academic notes pinned up
- storage for quest items

Feeling: study and adventure combined.

### Level 4: Enchanted scholar room

Unlocked after stronger TMA progress/submissions.

Should add:

- glowing mirror
- magical shelves
- softly animated candles
- stained glass or decorative window
- better wardrobe
- more display slots

Feeling: academic magic and progress reward.

### Level 5: Scholar manor room

Unlocked after major XP/submission milestones.

Should add:

- richer wood
- fireplace
- layered curtains
- ornate study desk
- larger bed
- more wall space
- trophy/geode display area

Feeling: earned comfort and achievement.

### Prestige room skins

Later optional skins:

- spring blossom room
- summer sunlight room
- autumn candlelit room
- winter snow-window room
- exam-war-room version
- recovery/rest version

## Outfit unlock ideas

- Starter academic adventurer outfit: available from the start.
- Teal medieval trousers outfit: unlocked by starting the first TMA quest.
- Scholar outfit: unlocked by completing a plan.
- Plaid bodice outfit: unlocked by finishing a full draft.
- Striped scholar top: unlocked by completing Flow Diary.
- Babydoll dress: unlocked after confirming submission.
- Satchel charms: unlocked through quote geodes.
- Necklace/accessory variants: unlocked through training notes and Notebook Shrine work.

## Required first working version

The first house version should only prove the core system works:

1. Enter house from hub.
2. Show Level 1 room background.
3. Show avatar artwork as a separate layer.
4. Click mirror.
5. Choose between at least two outfit layers.
6. Avatar changes while the room stays the same.
7. Return to hub.

Decoration and furniture movement can come after that base layering works.

## Idle screen correction

The current idle screen does not yet match the intended solid-art approach. The correct approach is a single finished idle background image, with only petals, leaves, snow, or light particles animated on top.

The current placeholder/vector attempts should not be treated as final. The next idle fix should use an actual finished art asset as the scene background, not CSS-built pieces and not a blurry embedded placeholder.
