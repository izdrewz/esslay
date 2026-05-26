# Current state audit

Date: 2026-05-24
Repo: izdrewz/esslay

## Purpose of this audit

This audit records what the current Esslay build actually has before borrowing patterns from open-source life-sim/productivity projects. The point is to stop building vague placeholders and to replace weak areas with deliberate systems.

## Current working structure

Esslay is currently a static browser app under `docs/`, intended for GitHub Pages.

Current main screens:

- `index.html` opens the idle camp.
- `hub.html` opens the village map.
- `house.html` opens the home/base screen.
- `cave.html` opens the Study Cave shell.
- `domestic.html` opens the Domestic Quest Board shell.
- `training.html` opens the Notebook Shrine shell.
- `credits.html` records asset-use rules.

## What is working or partly working

### Idle screen

Status: partial.

The idle screen uses an uploaded/composite reference scene as the opening image. The page is prepared to prefer `assets/idle-reference-scene.png` when a full-resolution PNG exists, with the current compressed fallback still present.

Known issue: the current fallback image is not good enough visually. It became blurry because it was embedded through a compressed route. The proper fix is to add a real full-quality PNG at `docs/assets/idle-reference-scene.png`.

### Village hub

Status: working as navigation.

The hub now links to local pages instead of GitHub branches:

- Study Cave goes to `cave.html`.
- Home Base goes to `house.html`.
- Quest Board goes to `domestic.html`.
- Notebook Shrine goes to `training.html`.

### Home/base screen

Status: partial but now has the strongest working system.

The house screen has:

- fixed room background
- avatar layer
- mirror panel
- built-in paper-doll placeholder outfits
- local avatar import
- starter gold value
- home item library
- locked/bought/placed item states
- imported item fields for name, category, licence/use status, source note, cost, and image
- built-in starter items

Known issue: item placement is still absolute-position based, not a true room grid. This should be replaced with grid/slot placement.

### Study Cave

Status: placeholder.

The Study Cave has a visual shell and checkpoint buttons, but it does not yet run the real TMA loop. It needs the actual academic quest engine.

### Domestic Quest Board

Status: placeholder.

The domestic screen exists as a local page but does not yet share a real quest/task engine.

### Notebook Shrine

Status: placeholder.

The training screen exists and can take pasted notes, but it does not yet store structured training notes, tags, source reminders, or XP.

### Asset system

Status: partial.

The app now has:

- `asset-ledger.json`
- starter cottage asset pack
- credits page
- local import controls

Known issue: imported assets live only in browser storage. That is acceptable for local testing, but public repo assets still need proper source/licence checks before being committed.

## Main weaknesses to replace using open-source references

### Weakness 1: Quest economy is scattered

The app needs a shared task/reward engine. It should not have separate ad hoc logic for Study Cave, home items, domestic quests, and real-life rewards.

Reference to inspect: Habitica for task difficulty, XP, gold, inventory, and reward state patterns.

### Weakness 2: House placement is not a real decoration system

The current home item placement uses percentage positioning. This works for a visual proof, but it is not a proper decorating mechanic.

Reference to inspect: Pydew Valley for map/object interaction, shop/menu triggers, sprite groups, and movement/interactions.

### Weakness 3: Notebook Shrine is not structured

Notebook Shrine needs training notes, tags, module/topic/source links, training XP, and source-check reminders.

Reference to inspect: Life-RPG Obsidian for journal intelligence, skill domains, quests, boss fights, and training/progression structures.

### Weakness 4: Focus/battle sessions are missing

The app needs simple timed work sessions for drafting, quote-bank building, Flow Diary, and domestic quests.

Reference to inspect: TaskRPG for one-page task and timer flow.

### Weakness 5: Reward shop needs customisation

The reward shop needs to support real-life rewards, loot boxes/geodes, categories, costs, blocking, and claiming.

Reference to inspect: LifeUp as design reference only, because the main app is closed source.

## Immediate next implementation target

The next code step should be the shared quest economy engine:

```text
task completed
→ XP gained
→ gold gained
→ checkpoint unlocked
→ reward/item becomes claimable
→ state is saved
```

This should be created before deeper Study Cave work, because Study Cave, Domestic Quest Board, Home Base, Notebook Shrine, and real-life rewards all need the same state logic.

## Do not do next

Do not continue adding decorative placeholder screens without shared state logic.

Do not copy Stardew Valley, Fields of Mistria, Animal Crossing, Pinterest, or mod assets into the public repo without a clear licence.

Do not move Esslay into another repo/codebase unless the web version fails the core TMA loop.
