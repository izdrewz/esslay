# Area 11 — Save, progress, missed loot, flags, export

Last updated: 2026-05-31

## Area role

Area 11 owns save/export/progress logic only.

Area 11 does not design room art or edit repo code directly.

## Current priority for Area 11

Area 11 is a support owner for Priority 1 and the lead owner for Priority 3.

For Priority 1, Area 11 needs to support Brief Fog v0.1 by defining/confirming save behaviour for:
- chunks
- highlights
- annotations
- flags attached to chunks/highlights
- missed loot attached to chunks/highlights
- dismissed wording
- chunk completion states
- Brief Fog completion
- output cards saved from Brief Fog

For Priority 3, Area 11 owns the clean persistence/export layer:
- localStorage StudyCaveSaveState
- completed chambers persist
- flags and missed loot persist
- reset Study Skills Trial only
- export updated route as `.md`, `.txt`, and Word-openable `.doc`

## Current flow supported

Study Cave entrance → Quest Board → Task Map threshold → Cave Base → Brief Fog / Question-Unpacking Chamber

## Core rule

Cave Base is the persistent save hub.

It should save:
- active quest
- current chamber
- route location
- completed chambers
- unlocked chambers
- collected loot
- missed loot
- flags
- progress log
- chamber notes
- cave outfit override
- last saved timestamp

Completed chambers must stay complete unless the user resets or deliberately replays.

Flags and missed loot do not undo completion.

## Suggested save object

Use localStorage v0.1 with:

- StudyCaveSaveState
- StudyQuestSave
- CaveBaseSave
- ChamberSave
- TaskMapSummary
- LootEntry
- MissedLootEntry
- FlagEntry
- ProgressLogEntry

## Missed loot

Missed loot means the player noticed something useful but chose not to finish it now.

Automatic missed loot should trigger when:
- leaving a chamber with optional tasks incomplete
- clearing a chamber but leaving loot-linked work unfinished
- leaving highlighted phrases without explanation notes
- leaving available loot uncollected
- moving on from known rough draft sections later

Manual missed loot is created when user clicks:
- Mark as missed loot
- Leave this for later

Missed loot should show in:
- Cave Base summary
- chamber summary
- export
- progress report
- next action suggestions if high priority

## Flags

Flags are not missed loot.

A flag means something needs attention, checking, clarification, improvement, or remembering.

Flags can attach to:
- task sentence
- highlighted phrase
- chamber task
- missed loot item
- source/note later
- draft section later

## Reset rule

Reset Study Skills Trial only.

Do not reset:
- wardrobe data
- house data
- edit room data
- unrelated quests
- global settings
- unlocked cosmetics outside the test quest
- furniture data
- calendar data
- source library data

## Exports

v0.1 export formats:
- `.md`
- `.txt`
- Word-openable `.doc`

Proper `.docx` can wait.

Exports should include:
- quest title
- current chamber
- current route location
- completed chambers
- unlocked chambers
- task map summary
- chamber answers
- highlights and annotations if available
- flags
- missed loot
- collected loot
- progress log
- next action
- export timestamp

## Repo implementation next

Main repo needs:
- complete local save shell
- test quest save object
- Cave Base persistence
- chamber completion persistence
- missed loot creation
- flag creation/resolution
- reset Study Skills Trial only
- updated exports for new Brief Fog flow
