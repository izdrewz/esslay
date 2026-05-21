# Idle screen plan

## Purpose

The idle screen is not a blank progress page. It should be the first game-feeling screen: a pixel-style scene showing the player character in front of their house or inside their house, with seasonal ambience. It should have a Begin button that leads to the clickable village/hub screen.

## Required idle screen elements

- Pixel-style player character visible on screen.
- House or room visible behind/around the character.
- Begin button that opens the clickable hub/village screen.
- Seasonal ambience that can change the scene without changing the core layout.
- Calm game-like feeling before the user enters combat, house, domestic quests, training, or planning.

## Seasonal ambience

### Spring

- Cherry blossom tree or pink blossom detail.
- Falling petals.
- Light green grass and soft sky.
- Gentle movement rather than busy animation.

### Summer

- Heavy sunshine.
- Lots of green.
- Brighter grass, fuller trees, and warm glow.
- Optional small summer props near the house.

### Autumn

- Brown and orange leaves.
- Leaves blowing across the screen.
- Autumn-coloured tree or ground details.
- Slightly warmer, muted sky.

### Winter

- Bare branches.
- Snow-covered roof or ground.
- Optional falling snow.
- Cooler sky and quieter scene.

## Implementation plan

1. Build an idle landing screen first, separate from the checklist/workbench UI.
2. Use CSS pixel art shapes first, so the game works immediately without needing image assets.
3. Add a season selector or automatic season mode later.
4. Make Begin open the clickable hub screen.
5. Keep the hub separate from the idle screen so the idle screen feels like an opening scene, not another menu.
6. Allow user-uploaded character and house art later, but do not require it for the first working version.

## What is needed from Izzy

- Decide whether the idle scene starts outside the house, inside the house, or lets the user choose.
- Decide the character look: hair colour, outfit colour, and general vibe.
- Decide the house look: cottage, fantasy inn, small base, academy room, or another style.
- Decide whether seasons change manually with a button or automatically by real-world date.
- Decide whether the first version should use simple CSS pixel art or whether custom image assets should be uploaded.
- Provide any character, house, or item images that should be used instead of generated CSS pixel shapes.

## Current build priority

Do this before adding more TMA workflow features. The game needs to feel like a game first: idle screen, clickable hub, cave combat, house/base, domestic board, training shrine, then the deeper TMA tools inside those areas.
