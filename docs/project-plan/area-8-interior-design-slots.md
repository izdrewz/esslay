# Area 8 — Interior Design Fixed-Slot Customisation

## Purpose

The edit room is also the place for interior design customisation. The system should stay fixed-slot and layered, not free-drag furniture placement.

The user can unlock, buy, loot, insert, or earn item styles. Once owned, compatible items can be reused freely across compatible rooms and slots. After placing an item, colours and patterns can be edited within that item’s editable zones. Default versions remain unchanged.

## Room flow

- the edit room is a separate room
- clicking it opens room thumbnails later
- clicking a thumbnail opens that room’s edit version
- editing only happens in edit mode
- Version 0.1 stays static, simple, and manageable

## Slot groups

### Surface slots

| Slot ID | Controls |
|---|---|
| wallpaper | Main wallpaper material/pattern for the room walls |
| paint | Wall paint colour/finish overlay |
| panelling | Lower-wall panelling or decorative trim |
| floor_main | Flooring material for the whole floor |
| rug_main | Main rug placed over the floor |

### Main wall / decor slots

| Slot ID | Controls |
|---|---|
| wall_main | Large central wall feature such as a tapestry, framed feature, or statement decor |
| wall_left_decor | Smaller left-side wall decor |
| wall_right_decor | Smaller right-side wall decor |

### Floor / furniture slots

| Slot ID | Controls |
|---|---|
| against_wall_left | Floor object or furniture against the left wall |
| against_wall_center | Floor object or furniture against the centre wall |
| against_wall_right | Floor object or furniture against the right wall |
| desk_slot | Main desk or study table |
| shelf_slot | Shelf or bookcase |
| chest_slot | Chest, trunk, reward chest, or storage item |

### Ceiling / light slots

| Slot ID | Controls |
|---|---|
| ceiling_feature | Optional roof/ceiling decorative feature |
| ceiling_light | Main hanging light, lantern, or chandelier |
| wall_light_left | Left wall light |
| wall_light_right | Right wall light |

### Window slots

| Slot ID | Controls |
|---|---|
| window_style | Frame shape/style and base window look |
| window_curtains | Curtains or drape layer |
| window_decor | Plants, ornaments, hanging decor, sill items |
| window_glow | Glow/lighting state for the window |

### Board slots

| Slot ID | Controls |
|---|---|
| wall_board | Main board frame and placement |
| board_background | Cork, parchment, fabric, wood, etc. |
| board_pin_1 to board_pin_8 | Pinned notes, swatches, inspo, command words, fix-later notes, etc. |

Use fixed pin slots for the board at first, not free pin placement.

## Version 0.1 placeholders

Version 0.1 should log the full system, but only a smaller set needs to visibly exist as placeholders.

Visible/planned placeholders:

- wallpaper
- paint
- panelling
- floor_main
- rug_main as the first test slot
- desk_slot
- chest_slot
- window_style
- window_curtains
- ceiling_light
- wall_board
- board_background
- board_pin_1 to board_pin_4

Logged only for later:

- wall_main
- wall_left_decor
- wall_right_decor
- against_wall_left
- against_wall_center
- against_wall_right
- shelf_slot
- ceiling_feature
- wall_light_left
- wall_light_right
- window_decor
- window_glow
- board_pin_5 to board_pin_8

## First test slot

First test slot: `rug_main`.

This is the best first test because it is visually obvious, simple to place, easy to swap, easy to tint, easy to pattern, and lower risk than windows or furniture.

The rug test should include:

- one plain default rug
- one alternate rug style if wanted
- one unlocked state
- one locked state if useful
- colour edit
- pattern edit
- saved chosen result for the room

## Save structure

Use four layers of save data.

### Owned content library

Tracks globally owned styles:

- furniture styles
- wallpaper styles
- rug styles
- light fixtures
- window styles
- board styles

### Custom edit libraries

Stores reusable user-created edits:

- saved colourways
- saved patterns

### Room layout save

Stores current live room state:

- selected item in each slot
- per-slot colour edits
- per-slot pattern edits
- visible board pins
- visible window/light layers

### Saved room presets

Stores whole-room design snapshots:

- preset id
- room id
- name
- slot placements
- board pins

## Suggested data shapes

```ts
type RoomSlot = {
  id: string;
  category: "surface" | "decor" | "furniture" | "light" | "window" | "board";
  label: string;
  roomTypes: string[];
  compatibleItemCategories: string[];
  placeholderVisible: boolean;
  editableZones?: string[];
};

type SlotPlacement = {
  slotId: string;
  itemId: string | null;
  edits?: {
    colourwayId?: string | null;
    patternId?: string | null;
    tintHex?: string | null;
    secondaryTintHex?: string | null;
    glowState?: string | null;
    variantId?: string | null;
  };
};

type BoardPin = {
  slotId: string;
  pinType: "note" | "swatch" | "inspo" | "command_word" | "keyword" | "fix_later" | "design_note";
  content: string;
  linkedImageId?: string | null;
  colourwayId?: string | null;
  patternId?: string | null;
};

type RoomDesignState = {
  roomId: string;
  placements: SlotPlacement[];
  boardPins: BoardPin[];
};

type OwnedContent = {
  ownedItemIds: string[];
  savedColourways: {
    id: string;
    name: string;
    colours: string[];
  }[];
  savedPatterns: {
    id: string;
    name: string;
    source: "generated" | "imported";
    assetPath?: string;
    settings?: Record<string, string | number>;
  }[];
};

type RoomPreset = {
  id: string;
  roomId: string;
  name: string;
  placements: SlotPlacement[];
  boardPins: BoardPin[];
};
```

## Ownership and reuse rule

- the player unlocks the item/style
- once unlocked, it can be used as often as wanted in compatible rooms/slots
- the same style can appear in multiple rooms
- edits happen after placing
- edits can be different in each room
- the base default version remains unchanged
- custom colourways/patterns can be saved for reuse

## First default set

Use only items visible in the furnished inspo image as the first default set:

- one soft medieval room base
- one warm wood desk
- one chest/trunk
- one main rug
- one simple wallpaper/plaster look
- one paint tone
- one panelling option
- one window style
- one curtain style
- one main board style
- one hanging light

## Wait until later

- full furniture customisation UI
- advanced board editing
- seasonal window changes
- advanced light states
- large shop systems
- many-slot testing beyond `rug_main`
- imported image handling for many board items
- free-form board placement
- multi-room preset management UI
- mass custom pattern tools
