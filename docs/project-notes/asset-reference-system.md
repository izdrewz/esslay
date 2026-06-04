# Asset reference system

Last updated: 2026-06-04

Status: active reference-system note / setup in progress

Purpose:
This note defines how reference images and planning assets should be stored so future area chats can find them without Izzy resending everything.

Reference files are not approved game assets by default. They are approved only if Izzy explicitly approves them.

## Runtime safety

This system is for handoff and planning. It should not affect the playable cave unless a later implementation task explicitly imports approved assets.

The current setup task should not change:
- `docs/cave.html`
- `docs/study-cave-clicks-v1.js`
- `docs/study-cave-stage-scene.css`

## Desired reference library structure

Preferred structure once files are added:

```text
project-assets/references/master/asset-registry.md
project-assets/references/area-1-character-assets/
project-assets/references/area-10-visual-scenes/
```

Area 1 folder should contain character, outfit, sprite, pose, and character-layer references.

Area 10 folder should contain scene composition, background plate, Command Imp/fog, clickable-zone, and VN layout references.

If the connector cannot create root folders in a chat, use this note as the fallback registry until files can be added by another route.

## Area access working rule

This is a project working rule, not a hard GitHub permission lock.

Master may read every reference folder and owns the full registry.

Area 1 should use only the Area 1 reference folder unless Izzy or Master points it elsewhere.

Area 10 should use only the Area 10 reference folder unless Izzy or Master points it elsewhere.

## Status labels

Use one of these for every stored image:
- reference only
- planning reference
- active candidate
- placeholder
- approved placeholder
- approved final
- locked final
- rejected / do not use

## Brief Fog composite rule

For Brief Fog visual-novel stills, prioritise consistency over novelty.

Preferred workflow:
static background plate + separate girl layer + separate Command Imp/fog layer + optional baked glow = exported slideshow still.

Keep background camera, girl placement, imp scale, and lighting language consistent. Keep text boxes and choices separate from art unless Izzy explicitly asks for baked text.

For the current static slideshow, magic glow can be baked into stills. Separate overlays are optional later.

## Initial intake status

No image files have been committed through this reference system yet.

Next safe step: upload images in small labelled batches, then update this note and the relevant area notes with exact paths and status labels.
