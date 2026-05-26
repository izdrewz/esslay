# Source and licence check

Date: 2026-05-24
Repo: izdrewz/esslay

## Purpose

This file records what Esslay can safely borrow from external projects. It separates code patterns, direct code reuse, assets, and design inspiration.

## General rule

Public source is not automatically safe to paste into Esslay. Before using anything, check:

- repository licence
- asset licence
- whether the repo is actually open source
- whether copied code would require licence changes
- whether assets are original, game-ripped, or third-party

## Habitica

Source: https://github.com/HabitRPG/habitica

Observed licence:

- Code is GPL v3.
- BrowserQuest assets/content are CC-BY-SA 3.0.
- HabitRPG assets/content are CC-BY-NC-SA 3.0.

Use status:

- Safe to study architecture and patterns.
- Do not copy assets.
- Do not copy code directly unless GPL obligations are intentionally accepted.
- Best use: rebuild the task/reward economy pattern in original Esslay code.

Esslay decision:

Use as a reference for XP, gold, task difficulty, inventory, and reward blocking only.

## LifeUp

Source: https://github.com/Ayagikei/LifeUp

Observed status:

- README marks the main app as closed source.
- Repository is useful for product description, issues, releases, SDK links, and design reference.

Use status:

- Design reference only for the main app.
- Do not treat the main app as a codebase to fork.
- Check LifeUp SDK separately only if a future integration is needed.

Esslay decision:

Use as a reference for custom reward shops, coins, loot boxes, crafting, Pomodoro rewards, and offline-first backup design.

## Life-RPG Obsidian

Source: https://github.com/huyhungai/life-rpg-obsidian

Observed licence:

- MIT licence.

Use status:

- Safe to study and adapt code patterns, with copyright/licence notice if substantial code is copied.
- Best use is pattern adaptation rather than direct code copying.
- No need to make Esslay an Obsidian plugin.

Esslay decision:

Use as a reference for Notebook Shrine, training XP, note tags, skill categories, history logs, boss/dungeon framing, and study/reflection structures.

## TaskRPG

Source: https://github.com/jifunks/taskrpg

Observed status:

- README describes a Django/JQuery/AngularJS tomato-timer task system.
- Gamification is described as future work rather than fully implemented.

Use status:

- Study the timer/task pattern.
- Do not use as a main game base.
- Check licence before copying any code directly.

Esslay decision:

Use as a light reference for focus-session and battle-timer loops.

## Pydew Valley

Source: https://github.com/tuananohut/pydew_valley

Observed status:

- Python/Pygame Stardew-style farming simulation clone.
- Uses Sprout Lands asset pack according to README.
- README describes player movement, sprite groups, camera, animation, shop menu, and interaction triggers.

Use status:

- Study object interaction, sprite grouping, shop/menu, and map logic.
- Do not copy assets without checking the Sprout Lands asset pack licence.
- Do not switch Esslay to Python/Pygame unless a separate desktop experiment is intentionally created.

Esslay decision:

Use as a reference for grid/world interaction and home placement patterns.

## Animal Crossing PC port

Source: https://github.com/flyngmt/ACGC-PC-Port

Use status:

- Design inspiration only.
- Do not use as Esslay base.
- Do not use assets.

Esslay decision:

Avoid direct code integration.

## Stardew Valley, Fields of Mistria, Pinterest, and mods

Use status:

- Reference only unless an asset has a clear licence permitting reuse outside the original game or post.
- Do not put ripped game assets or unclear mod assets into the public repo.
- User-imported local assets can be used for personal testing in browser storage, but they are not public repo assets unless cleared.

## Esslay safe categories

Safe for public repo:

- own art
- commissioned art with permission
- CC0
- CC-BY with credit
- MIT-compatible code patterns or code with licence notice where required
- original app assets made for Esslay

Not safe for public repo without more checking:

- Pinterest images
- game sprites
- mod packs
- fan art
- asset packs without clear licence
- copied code from GPL projects unless GPL obligations are accepted

## Required practice going forward

Every public asset pack should have:

- manifest file
- creator/source note
- licence/use status
- credit requirement
- whether it can be committed to public repo

Every borrowed code pattern should be recorded in the planning docs before substantial implementation.
