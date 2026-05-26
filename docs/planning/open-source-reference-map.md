# Open-source reference map

Date: 2026-05-24
Repo: izdrewz/esslay

## Purpose

This file records how Esslay should use existing open-source or publicly documented gamified productivity / life-sim projects. The aim is not to switch Esslay into another app. The aim is to inspect solved patterns and rebuild the useful parts cleanly in Esslay's static browser app.

## Rule for using external projects

Use external projects for specific weak areas only:

```text
problem in Esslay
→ inspect relevant open-source project
→ identify useful pattern
→ rebuild a simpler version in Esslay
→ document licence/source implications
```

Do not paste whole systems into Esslay without checking licence and architecture fit.

## Habitica

Source: https://github.com/HabitRPG/habitica

What the README says:

Habitica is an open-source habit-building program that treats life like an RPG. It includes levelling up, HP loss when failing, and earning gold for weapons and armour.

Use in Esslay for:

- shared quest economy
- XP and gold calculations
- task difficulty
- reward blocking
- inventory state
- achievement/checkpoint logic
- task failure or skipped-task consequences, if added later

Do not use Habitica for:

- art assets
- full app architecture
- mobile app replacement
- server/database architecture unless Esslay later becomes non-static

Reason:

Habitica is much larger than Esslay. It is useful as a reference for reward state logic, but Esslay should remain local-first and GitHub Pages friendly.

## LifeUp

Source: https://github.com/Ayagikei/LifeUp

What the README says:

LifeUp lets users customise gamified lists with attributes, EXP, coins, reward shops, achievements, Pomodoro, loot boxes, crafting, offline-first storage, backups, and custom reward systems. The README also states that the main LifeUp app is closed source now.

Use in Esslay for:

- design reference for custom rewards
- shop categories
- loot boxes / geodes
- user-defined skills
- offline-first backup/export approach
- reward balancing ideas

Do not use LifeUp for:

- direct source code from the main app
- claiming it is open-source base code

Reason:

The current LifeUp repo is mainly documentation, issues, releases, and links to related projects. It is not a direct open-source base for Esslay.

## Life-RPG Obsidian

Source: https://github.com/huyhungai/life-rpg-obsidian

What the README says:

Life-RPG is an Obsidian plugin that gamifies personal development using RPG mechanics, life domains, journal intelligence, skills, quests, boss fights, dungeons, energy tracking, a tavern/shop, achievements, and history. The repository is MIT licensed.

Use in Esslay for:

- Notebook Shrine structure
- training notes
- module/topic/source tags
- skill XP
- study domains
- journal/reflection-style entries
- boss/dungeon framing for large academic tasks
- history log ideas

Do not use Life-RPG for:

- making Esslay an Obsidian-only plugin
- AI/embedding features in the first web version

Reason:

The structure maps well onto Notebook Shrine and training XP, but Esslay's main app should stay visual and browser-based.

## TaskRPG

Source: https://github.com/jifunks/taskrpg

What the README says:

TaskRPG is a tomato-timer task management system built with Django, Bootstrap, JQuery, and AngularJS. The README says gamification was planned for future work.

Use in Esslay for:

- timer/focus-session loop
- battle timers
- drafting sprint timers
- domestic quest timers
- break/session rhythm

Do not use TaskRPG for:

- full game economy
- house decoration
- TMA builder logic

Reason:

It is useful for simple timed-work patterns, but it does not solve Esslay's main game loop.

## Pydew Valley

Source: https://github.com/tuananohut/pydew_valley

What the README says:

Pydew Valley is a Stardew Valley-style farming simulation clone built with Python/Pygame. It includes player movement, sprites, sprite groups, camera, animation, music, delta time, PyTMX, shop/menu interaction, collision-based harvesting, and a next-day interaction.

Use in Esslay for:

- map zone thinking
- interaction triggers
- shop/menu pattern
- object placement logic
- sprite/group thinking
- room grid and object state ideas
- day/season/time rhythm ideas

Do not use Pydew Valley for:

- replacing the browser app with a Python desktop app right now
- copying assets without checking the asset pack licence

Reason:

It is helpful for visual/game structure, but Esslay currently needs a web front end that runs on GitHub Pages.

## Animal Crossing PC port

Source: https://github.com/flyngmt/ACGC-PC-Port

Use in Esslay for:

- broad inspiration only: home decoration, mail/reward delivery, item collection

Do not use for:

- direct code integration
- asset use
- public web app foundation

Reason:

It requires the original game context/assets and is not a practical or safe base for Esslay.

## Godot

Use in Esslay for:

- future Phase 2 planning
- real 2D room designer
- animations
- mobile/desktop game export
- tile maps and drag placement

Do not use immediately for:

- replacing the current browser prototype before the TMA loop works

Reason:

Godot is the likely future game-engine direction if the browser prototype proves the loop, but it would slow down the current web build.

## Implementation priority

### First: shared quest economy

Reference: Habitica and LifeUp design.

Goal:

```text
task → state → XP/gold → unlock → claim/place/spend
```

### Second: home grid/inventory

Reference: Pydew Valley and general grid placement patterns.

Goal:

```text
owned item → inventory → placement slot → move/remove → save
```

### Third: Notebook Shrine

Reference: Life-RPG Obsidian.

Goal:

```text
training note → module/topic/source tags → training XP → source-check reminder
```

### Fourth: timer/battle sessions

Reference: TaskRPG.

Goal:

```text
start session → work → finish → XP/gold/checkpoint
```

## Working rule

When Esslay is weak in a feature area, check the relevant reference first instead of inventing a placeholder from scratch.
