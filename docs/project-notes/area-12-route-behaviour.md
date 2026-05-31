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

## Area 12 update — Cave Base panels and route update after Brief Fog clears

Status: completed

Area 12 has defined the v0.1 Cave Base panel behaviour and route state changes after Brief Fog clears.

Current flow:
Study Cave entrance
→ Quest Board
→ select Study Skills Trial
→ Task Map threshold
→ Cave Base
→ Brief Fog / Question-Unpacking Chamber
→ return to Cave Base
→ Source Mine unlocked

Required state fields:
- selectedQuestId
- activeQuestId
- currentRouteLocation
- currentChamberId
- completedChambers
- unlockedChambers
- openFlags
- missedLoot
- nextAction
- questBoardOpen
- taskMapOpen
- caveBaseOpen
- outfitChestOpen
- caveJournalOpen
- completedSummaryOpen
- flagsLootOpen

Cave Base default display before Brief Fog clears:
Active quest: Study Skills Trial
Current chamber: Brief Fog / Question-Unpacking Chamber
Progress: 0 / 7 chambers complete
Completed chambers: none yet
Open flags: 0
Missed loot: 0
Next action: Continue to Brief Fog

Cave Base buttons:
- Continue Quest
- Open Outfit Chest
- Open Cave Journal
- View Completed Chambers
- View Flags / Missed Loot
- Return to Task Map
- Return to Quest Board
- X Close

Outfit Chest placeholder:
Title: Outfit Chest
Text: Study Cave outfit changing will live here. For v0.1 this is a placeholder. It does not change route, quest progress, chamber progress, flags, missed loot, or current active chamber.
Buttons: X Close / Return to Cave Base

Cave Journal / Route Ledger:
Before Brief Fog clears, it shows Study Skills Trial, current chamber Brief Fog, progress 0 / 7, no completed chambers, unlocked Cave Base and Brief Fog, and next action Continue to Brief Fog.
After Brief Fog clears, it shows current chamber Source Mine, progress 1 / 7, completed Brief Fog, unlocked Cave Base, Brief Fog, and Source Mine, and next action Continue to Source Mine.

Completed Chamber Summary:
Before Brief Fog clears, it says no chambers completed yet.
After Brief Fog clears, it lists Brief Fog / Question-Unpacking Chamber as completed and reviewable.
Completed chambers are reviewable, not replay-forced.

Flags / Missed Loot:
Panel shows open flags and missed loot by chamber.
For v0.1 it can be read-only.
Closing returns to Cave Base and does not change route state.

Return to Task Map:
From Cave Base, Return to Task Map sets currentRouteLocation to task_map_threshold, taskMapOpen true, caveBaseOpen false, questBoardOpen false.
Before Brief Fog clears, Brief Fog is active and Source Mine is locked.
After Brief Fog clears, Brief Fog is completed and Source Mine is active.

Return to Quest Board:
From Cave Base, Return to Quest Board sets currentRouteLocation to quest_board, questBoardOpen true, taskMapOpen false, caveBaseOpen false.
After Brief Fog clears, Study Skills Trial card shows In progress, current chamber Source Mine, progress 1 / 7, and button Continue Test Quest.

Brief Fog completion behaviour:
When Complete Brief Fog is clicked:
- add "brief-fog" to completedChambers using unique append
- add "source-mine" to unlockedChambers using unique append
- set currentChamberId to "source-mine"
- set currentRouteLocation to "cave_base"
- set caveBaseOpen true
- set taskMapOpen false
- set questBoardOpen false
- set nextAction to "Continue to Source Mine"
- set quest status to "in_progress"
- set quest currentChamberId to "source-mine"
- set quest currentChamberLabel to "Source Mine"
- set progress to 1 / 7 chambers complete
- set buttonLabel to "Continue Test Quest"

Brief Fog must remain completed and reviewable.
The player must not be forced to redo Brief Fog.
If Brief Fog is reviewed later, it must not duplicate completedChambers or increase progress again.

Completion confirmation:
After Brief Fog clears, show:
Title: Brief Fog Cleared
Text: Brief Fog / Question-Unpacking Chamber is complete. Progress updated to 1 / 7 chambers complete. Source Mine is now unlocked. You can continue now or return to the Task Map.
Buttons:
- Continue to Source Mine
- View Task Map
- Stay in Cave Base
- X Close

Source Mine placeholder:
After Brief Fog clears, Source Mine is active/unlocked.
Placeholder text:
Source Mine
This chamber will hold source gathering, source notes, quote preparation, and source-to-task links. For v0.1 this is a placeholder.
Buttons:
- X Return to Cave Base
- Mark Placeholder Viewed

Mark Placeholder Viewed should not mark Source Mine complete in v0.1.

Acceptance tests:
1. Quest Board to Task Map opens Study Skills Trial route and sets Brief Fog active.
2. Task Map to Cave Base shows Brief Fog as current chamber and 0 / 7 progress.
3. Cave Base panels open and close back to Cave Base without changing progress.
4. Continue Quest opens Brief Fog.
5. Complete Brief Fog adds brief-fog to completedChambers, unlocks source-mine, sets currentChamberId to source-mine, returns to Cave Base, and updates progress to 1 / 7.
6. Cave Base after Brief Fog shows Source Mine as current and Brief Fog as completed.
7. Task Map after Brief Fog shows Brief Fog completed and Source Mine active.
8. Quest Board after Brief Fog shows Study Skills Trial in progress at 1 / 7.
9. Reviewing Brief Fog does not duplicate completion or increase progress.
