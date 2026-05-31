# Area 12 — Quest Board, Task Map, route behaviour

Last updated: 2026-05-31

## Area role

Area 12 owns board/route behaviour and UI-state design.

Area 12 does not design whole cave art or edit repo code directly.

## Current priority for Area 12

Area 12 is a support owner for Priority 1 and a lead owner for Priority 2.

For Priority 1, Area 12 needs to support Brief Fog v0.1 by defining/confirming:
- Cave Base → Brief Fog entry behaviour
- Brief Fog completion behaviour
- route state after Brief Fog clears
- Source Mine placeholder unlock behaviour
- how completed Brief Fog appears on Quest Board, Task Map, and Cave Base

For Priority 2, Area 12 owns Cave Base interaction behaviour:
- outfit chest placeholder panel behaviour
- cave journal / route ledger panel behaviour
- completed chamber summary behaviour
- flags/missed loot panel behaviour
- return to Task Map behaviour
- continue route behaviour

## Locked route

Do not send the player straight from Quest Board into the working chamber.

Required flow:

Study Cave entrance
→ Quest Board
→ select The Study Skills Trial
→ Task Map threshold
→ enter cave route
→ Cave Base
→ continue to first active working chamber

First active working chamber:

Brief Fog / Question-Unpacking Chamber

## Quest Board behaviour

Study Skills Trial card should show:
- title
- type: Test Quest
- word count: 800 words
- status
- progress
- current chamber
- open flags
- missed loot
- next action
- button label

Selecting Study Skills Trial should set:
- selectedQuestId = study-skills-trial
- activeQuestId = study-skills-trial
- currentRouteLocation = task_map_threshold
- taskMapOpen = true
- currentChamberId = brief-fog

## Task Map threshold behaviour

Task Map is before cave proper.

It should show:
- active quest
- current active chamber
- route nodes
- completed chambers
- locked chambers
- flags count
- missed loot count
- Enter Cave Base
- Back to Quest Board
- X close

Task Map route nodes:
- Cave Base
- Brief Fog / Question-Unpacking Chamber
- Source Mine
- Quote Bank Vault
- Draft Route Map
- Dirty Draft Tunnel
- Boss Fight / Weaving Chamber
- Submission Gate

## Cave Base behaviour

Cave Base is safe hub, not a challenge room.

It should show:
- active quest
- current chamber
- completed cave work
- open flags
- missed loot
- outfit chest
- continue button
- return options

Continue Quest opens Brief Fog if current chamber is brief-fog.

Completed areas must stay completed.

## Current repo state

- Task Map → Cave Base transition works after robust handler fix.
- Cave Base → Brief Fog transition works as placeholder.
- Source Mine is next placeholder after Brief Fog completion.

## Next route work

- Add dynamic route node states from local save.
- Make completed Brief Fog show complete on Task Map and Cave Base.
- Add Source Mine placeholder transition after Brief Fog clears.
- Make Quest Board card reflect updated progress after Brief Fog completes.
