# Esslay Project Plan

## Main repo decision

`izdrewz/esslay` is the main base for the study game.

Do not replace it with `izdrewz/game`. The `game` repo is treated as a separate Face Quest/card-game prototype and is not the main study game.

`esslay` stays as a local, static, single-character visual productivity and academic quest game. It should remain static, layered, and manageable.

## Version 0.1 repair goal

Version 0.1 is a controlled repair/build pass for the existing static app. It should make the visual shell clearer without rewriting the whole project.

Version 0.1 should include:

- outside house / idle screen
- click or begin interaction to enter
- hub navigation
- inside house / home base screen
- static character layer
- clickable mirror placeholder
- clickable wardrobe / home-items placeholder
- clickable edit room / mood board placeholder
- clickable cave / work entrance placeholder
- fixed furniture slot placeholders
- simple navigation between screens
- existing XP, gold, checkpoint, reward, localStorage, export, and import ideas preserved

## Current app type

This repo currently uses a static `docs` browser app rather than a React/Vite app. Version 0.1 should work inside the existing `docs` structure instead of adding a new app framework.

Preferred Version 0.1 asset folders live under:

```text
docs/assets/
```

## Visual direction

The game direction is 2D illustrated storybook academic fantasy with a parchment academic UI, cosy medieval cottage hub, paper-doll character layering, and darker cave/dungeon screens for academic work quests.

Main identity:

- academic adventurer
- cosy fantasy
- medieval cottage
- scholar quest log
- paper-doll wardrobe
- darker cave/dungeon work mode

Use parchment panels, brown ink borders, old paper labels, wooden tags, wax seals, brass details, journal/quest-log styling, warm wood, soft gold, forest green, dusty rose, burgundy/plum, dark scholar navy, muted teal, and moss green.

Avoid:

- pixel-art final style
- modern flat UI as the main style
- neon mobile-game reward effects
- open-world movement
- heavy animation
- full Sims-style free building
- inconsistent generated assets

## Character direction

The character is a soft illustrated academic adventurer with long warm blonde hair, green eyes, gentle face, visible tattoos, layered gold necklaces, scholar/explorer styling, and medieval/renaissance fantasy clothing.

The project should support two main visual modes later:

- light/home mode for outside house, house hub, edit room, mood board, mirror, wardrobe, calm planning, and reward moments
- dark/cave mode for cave quests, monsters, source mine, quote bank work, draft tunnel, boss fight, and deeper academic work

Version 0.1 only needs static character display. Full paper-doll outfit layering is future work.

## Area 3 pose-swapping direction

Approved pose IDs:

- wardrobe_neutral
- mirror_check
- wardrobe_try_on
- idle_house
- focus_book
- thinking_mindmap
- edit_room_moodboard
- stuck_overwhelmed
- tidy_reset
- explorer_ready
- challenge_ready
- reward_happy

The pose system should be data-driven so images can be replaced later without changing every screen.

Do not build walking, sprite animation, drag-and-drop clothing, full wardrobe layering, or generated new art in Version 0.1.

## Area 7 edit room direction

The edit room is a static clickable room inside the house hub. It is the planning, editing, visual inspiration, and academic-prep room.

Version 0.1 requirements:

- add a clickable edit room entrance from hub/home
- add an edit room screen
- show a static room concept or styled placeholder scene
- show a large visible mood board wall
- add clickable hotspot placeholders
- add a back-to-house door/hotspot
- keep the character static
- do not add drag-and-drop
- do not add a full board editor
- do not add AI writing tools
- do not add source extraction

Version 0.1 hotspots:

- mood_board: future editable mood board
- desk: future writing/editing workspace
- door: back to house
- source_shelf: future source library / quote bank
- chest: future scraps, missed loot, fix-later notes

Future mood board items:

- uploaded inspiration images
- colour swatches
- custom pattern swatches
- wallpaper ideas
- carpet ideas
- furniture references
- outfit references
- command words
- essay keywords
- source quote scraps
- mind-map fragments
- fix-later notes
- missed-loot notes
- cave quest reminders

Later board editing should use a semi-free grid, not a full open-world/free-building system.

## Area 8 customisation rules

Furniture, wallpaper, carpets, clothes, decorations, colours, and patterns should connect to tasks, cave loot, gold, or rewards.

Rules:

- furniture uses fixed marked slots
- no free furniture dragging in early builds
- item/style must be owned before use
- wallpaper and carpet styles must be unlocked before use
- once an item/style is unlocked, colours and patterns can be edited freely inside allowed zones
- custom colours and imported/saved patterns should go into a reusable library later

Version 0.1 only needs marked slots and placeholder screens.

## Area 9 and 10 academic quest direction

The academic quest system turns assignment work into a static cave route.

Initial route:

```text
Cave Entrance -> Question Gate -> Command Word Chamber -> Keyword Cavern -> Source Mine -> Quote Bank Vault -> Blueprint Room -> Dirty Draft Tunnel -> Weaving Boss Room -> Exit Report Chamber
```

Monsters represent work problems:

- Fog Wraith: unclear question
- Command Imp: misunderstood command word
- Keyword Bats: scattered key terms
- Source Troll: sources not linked to task
- Loot Mimic: quote without explanation
- Structure Golem: ideas without structure
- Perfection Slime: polishing too early
- Coherence Dragon: rough draft does not flow

Version 0.1 should keep cave work simple: static map, clickable rooms/checkpoints, parchment task panels, input fields later, complete buttons, missed-loot flags later, and a basic boss checklist later.

Do not build animated combat or automatic essay writing.

## Area 11 save/export direction

Game exports are separate from official submission files.

Future process export names may include:

- QuestionBreakdown
- QuoteBank
- DirtyDraft
- FlagsAndMissedLoot
- ProgressReport

Official submission files should follow module naming rules separately.

The game should save tutor feedback as future skill reminders, such as signposting introductions, naming concepts directly, distributing evidence, developing support links, and checking references.

## Area 12 planner integration boundary

`izdrewz/Tma-workbench-local` is a future reference for planner/calendar logic.

Do not merge it into Version 0.1.

Version split:

- Version 0.1: clickable task board placeholder
- Version 0.2: simple manual task completion inside the game
- Version 0.3: import planner-style task data
- Version 0.4: connect task completion to rewards
- future: integrate or rebuild Focus Week Planner inside the game UI

## Area 13 source library and quote bank boundary

`izdrewz/tmazing` is the future reference for source storage, source searching, PDF/DOCX extraction, draft/source matching, citations, bibliography support, local export/import, and session export ideas.

Do not merge `tmazing` into Version 0.1.

Future source fields:

- source id
- module code
- unit/block/topic
- source title
- author
- year/date
- publisher/course material/website
- URL/file note/local location
- page number, paragraph, section, or timestamp
- pasted/extracted text
- user notes
- assignment/task link
- usefulness rating
- tags/keywords

Future quote bank fields:

- quote/extract text
- source id
- source title
- author/year if available
- page/paragraph/section location
- linked assignment question
- linked command word
- linked keyword
- linked module area
- paragraph or section it might support
- user note on why it matters
- whether it has been used in the draft
- whether it needs checking later

Game metaphor:

- sources become mines, scrolls, books, or geodes
- useful quotes become loot
- missing evidence becomes a monster/problem
- quote extraction becomes a cave task
- linking a quote to the question counts as opening/cleaning the geode
- evidence not properly used can become missed loot or unfinished loot

The app should not automatically shove quotes into writing. It should help collect, label, connect, and reuse evidence while keeping the user in control.

## Reference repos

Use later only:

- `esslayit`: writing checks for repeated words, long sentences, filler phrases, passive hints, list-heavy sentences
- `tmazing`: source library and quote bank reference
- `Tma-workbench-local`: calendar, weekly tasks, timers, drag-and-drop planning, ICS export
- `e104`: exam question breakdown, command words, keywords, constraints, answer scaffold
- `tma-workbench`: OU/TMA workflow rules, marking capture, voice-preserving editing, final checks
- `pdf`: PDF cleaning support later
- `comparer`: draft comparison/merge support later
- `feedback-markup`: tutor feedback library later

Not needed for current build:

- `dash`
- `dump`
- `shopping`

## Do not add yet

- full source library import
- calendar integration
- AI writing system
- complex furniture colour/pattern editor
- moving character sprite
- combat mechanics
- open-world movement
- full Sims-style building system
- user accounts
- backend
