# Area 11 — Brief Fog save/export structure

Task:
Brief Fog save/export structure

Area:
11 / save-export-progress logic

Status:
completed

What I checked:
Area 11 checked the current Area 11 dispatch request and existing save/export rules from the chat. Area 11 reported that it could access `izdrewz/game`, where the visible README was minimal, and that it could not find `docs/project-notes/README.md` through that GitHub fetch call. Main repo note: the active repo for this project is `izdrewz/esslay`, so this missing-file report appears to come from checking the wrong repo rather than the notes actually missing in `esslay`.

Output:

## Brief Fog v0.1 save/export rules

Brief Fog / Question-Unpacking Chamber must save the user’s task text as chunk cards, with highlights, annotations, plain-meaning notes, action-created notes, dismissed wording, flags, missed loot, output cards, and completion state.

Completed Brief Fog must stay completed unless reset or replay is deliberately chosen. Flags and missed loot do not undo completion.

## localStorage

Suggested v0.1 key:

```ts
localStorage.setItem("studyCaveSave:v0.1", JSON.stringify(studyCaveSave));
```

The active quest inside `StudyCaveSaveState` should include:

```ts
briefFog?: BriefFogSave;
```

## StudyCaveSaveState additions

```ts
type StudyCaveSaveState = {
  version: "0.1";
  activeQuestId: string | null;
  quests: Record<string, StudyQuestSave>;
  caveBase: CaveBaseSave;
  globalProgressLog: ProgressLogEntry[];
  lastSavedAt: string;
};

type StudyQuestSave = {
  questId: string;
  questTitle: string;

  questStatus:
    | "not-started"
    | "task-map-started"
    | "in-cave"
    | "paused"
    | "completed"
    | "archived-test";

  currentChamberId: string;
  currentRouteLocation: string;

  completedChambers: string[];
  unlockedChambers: string[];

  collectedLoot: LootEntry[];
  missedLoot: MissedLootEntry[];
  flags: FlagEntry[];

  taskMapSummary: TaskMapSummary;
  chamberSaves: Record<string, ChamberSave>;
  briefFog?: BriefFogSave;
  progressLog: ProgressLogEntry[];

  createdAt: string;
  updatedAt: string;
  lastEnteredCaveAt?: string;
  lastExportedAt?: string;
};
```

## BriefFogSave

```ts
type BriefFogSave = {
  chamberId: "brief-fog";
  chamberName: "Brief Fog / Question-Unpacking Chamber";

  status:
    | "locked"
    | "unlocked"
    | "not-started"
    | "in-progress"
    | "cleared"
    | "replay-available";

  rawTaskText: string;
  chunks: BriefFogChunk[];
  outputCards: BriefFogOutputCards;
  chamberFlags: FlagEntry[];
  chamberMissedLoot: MissedLootEntry[];
  completion: BriefFogCompletionState;
  exportHistory: ExportRecord[];

  enteredAt?: string;
  lastEditedAt: string;
  clearedAt?: string;
};
```

## BriefFogChunk

```ts
type BriefFogChunk = {
  chunkId: string;
  order: number;

  originalText: string;
  cleanedText?: string;

  chunkType:
    | "question"
    | "instruction"
    | "guidance"
    | "word-count"
    | "source-requirement"
    | "marking-grid"
    | "case-study"
    | "unknown";

  state:
    | "not-started"
    | "in-progress"
    | "understood"
    | "action-created"
    | "dismissed"
    | "flagged"
    | "left-for-later";

  plainMeaningNoteIds: string[];
  actionCreatedNoteIds: string[];
  annotationIds: string[];
  highlightIds: string[];
  dismissedWordingIds: string[];
  flagIds: string[];
  missedLootIds: string[];

  createdOutputCardIds: string[];
  isRequiredForCompletion: boolean;
  isOptional: boolean;

  createdAt: string;
  updatedAt: string;
};
```

Resolved chunk states for v0.1:

- understood
- action-created
- dismissed
- left-for-later

Open flags and missed loot do not stop a chunk from being resolved if the user has deliberately moved it forward.

## HighlightEntry

```ts
type HighlightEntry = {
  highlightId: string;

  questId: string;
  chamberId: "brief-fog";
  chunkId: string;

  highlightedText: string;

  highlightType:
    | "command-word"
    | "keyword"
    | "scope-limit"
    | "source-requirement"
    | "word-count"
    | "task-demand"
    | "unknown-important"
    | "dismissed";

  startOffset?: number;
  endOffset?: number;

  linkedAnnotationIds: string[];
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];
  linkedOutputCardIds: string[];

  status:
    | "active"
    | "converted-to-card"
    | "dismissed"
    | "left-for-later";

  createdAt: string;
  updatedAt: string;
};
```

v0.1 does not need perfect text offsets if the UI cannot support them yet. It can save `highlightedText`, `chunkId`, and `highlightType` first.

## BriefFogNote

Use one object for plain-meaning notes, action-created notes, and normal annotations.

```ts
type BriefFogNote = {
  noteId: string;

  questId: string;
  chamberId: "brief-fog";
  chunkId: string;

  noteType:
    | "plain-meaning"
    | "action-created"
    | "annotation"
    | "user-thought"
    | "system-prompt-response";

  noteText: string;

  linkedHighlightId?: string;
  linkedOutputCardId?: string;
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];

  status:
    | "active"
    | "edited"
    | "dismissed"
    | "left-for-later";

  createdAt: string;
  updatedAt: string;
};
```

## DismissedWordingEntry

```ts
type DismissedWordingEntry = {
  dismissedWordingId: string;

  questId: string;
  chamberId: "brief-fog";
  chunkId: string;

  dismissedText: string;

  reason:
    | "not-relevant"
    | "duplicate"
    | "too-vague"
    | "example-only"
    | "already-captured"
    | "not-needed-for-v0.1"
    | "other";

  userNote?: string;
  canRestore: boolean;

  status:
    | "dismissed"
    | "restored";

  createdAt: string;
  restoredAt?: string;
};
```

Dismissed wording should not be deleted. It should remain restorable.

## Flag attachment

Flags are attention notes. They do not undo chamber completion.

```ts
type FlagAttachment = {
  attachedToType:
    | "raw-task-text"
    | "chunk"
    | "highlight"
    | "annotation"
    | "plain-meaning-note"
    | "action-created-note"
    | "dismissed-wording"
    | "output-card"
    | "missed-loot"
    | "general-chamber";

  attachedToId: string;
};
```

Full flag object:

```ts
type FlagEntry = {
  flagId: string;

  questId: string;
  chamberId: "brief-fog" | string;

  flagType:
    | "check-guidance"
    | "unclear-meaning"
    | "needs-evidence"
    | "needs-reference"
    | "needs-smoothing"
    | "task-drift"
    | "too-long"
    | "too-thin"
    | "concept-not-named"
    | "support-link-weak"
    | "remember-this"
    | "ask-for-help";

  attachment: FlagAttachment;
  note: string;

  priority:
    | "low"
    | "medium"
    | "high";

  status:
    | "open"
    | "in-progress"
    | "resolved"
    | "left-for-later";

  createdAt: string;
  resolvedAt?: string;
};
```

## Missed loot attachment

Missed loot is not the same as a flag. It means something useful was left unfinished or uncollected so the user could continue.

```ts
type MissedLootAttachment = {
  attachedToType:
    | "chunk"
    | "highlight"
    | "annotation"
    | "plain-meaning-note"
    | "action-created-note"
    | "output-card"
    | "optional-task"
    | "general-chamber";

  attachedToId: string;
};
```

Full missed loot object:

```ts
type MissedLootEntry = {
  missedLootId: string;

  questId: string;
  chamberId: "brief-fog" | string;
  chamberName: string;

  itemMissed: string;

  missedLootType:
    | "optional-task"
    | "incomplete-answer"
    | "unfinished-highlight"
    | "unclaimed-reward"
    | "weak-note"
    | "unsmoothed-writing"
    | "missing-evidence"
    | "manual-left-for-later";

  source:
    | "automatic"
    | "manual";

  attachment: MissedLootAttachment;
  reasonLeft: string;
  linkedFlagIds: string[];
  returnLater: boolean;

  priority:
    | "low"
    | "medium"
    | "high";

  status:
    | "missed"
    | "recovered"
    | "ignored"
    | "converted-to-flag";

  createdAt: string;
  recoveredAt?: string;
};
```

## Output cards

Brief Fog produces structured output cards for the next cave areas.

```ts
type BriefFogOutputCards = {
  commandWordCards: CommandWordCard[];
  keywordCards: KeywordCard[];
  scopeLimitCards: ScopeLimitCard[];
  sourceRequirementCards: SourceRequirementCard[];
  taskDemandSummary: TaskDemandSummaryCard | null;
};
```

### CommandWordCard

```ts
type CommandWordCard = {
  cardId: string;
  questId: string;
  chamberId: "brief-fog";
  commandWord: string;
  plainMeaning: string;
  taskDemand: string;
  sourceChunkIds: string[];
  sourceHighlightIds: string[];
  sourceNoteIds: string[];
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];
  confidence: "low" | "medium" | "high" | "user-confirmed";
  status: "draft" | "confirmed" | "needs-checking" | "dismissed";
  createdAt: string;
  updatedAt: string;
};
```

### KeywordCard

```ts
type KeywordCard = {
  cardId: string;
  questId: string;
  chamberId: "brief-fog";
  keyword: string;
  plainMeaning: string;
  whyItMatters: string;
  sourceChunkIds: string[];
  sourceHighlightIds: string[];
  sourceNoteIds: string[];
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];
  status: "draft" | "confirmed" | "needs-checking" | "dismissed";
  createdAt: string;
  updatedAt: string;
};
```

### ScopeLimitCard

```ts
type ScopeLimitCard = {
  cardId: string;
  questId: string;
  chamberId: "brief-fog";
  scopeText: string;
  scopeType:
    | "word-count"
    | "case-study"
    | "module-area"
    | "time-period"
    | "required-focus"
    | "excluded-focus"
    | "format-rule"
    | "other";
  plainMeaning: string;
  sourceChunkIds: string[];
  sourceHighlightIds: string[];
  sourceNoteIds: string[];
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];
  status: "draft" | "confirmed" | "needs-checking" | "dismissed";
  createdAt: string;
  updatedAt: string;
};
```

### SourceRequirementCard

```ts
type SourceRequirementCard = {
  cardId: string;
  questId: string;
  chamberId: "brief-fog";
  requirementText: string;
  sourceRequirementType:
    | "must-use-module-material"
    | "must-use-specific-source"
    | "minimum-source-count"
    | "video-or-transcript"
    | "reader-chapter"
    | "external-source-allowed"
    | "external-source-not-needed"
    | "reference-style"
    | "other";
  plainMeaning: string;
  sourceChunkIds: string[];
  sourceHighlightIds: string[];
  sourceNoteIds: string[];
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];
  status: "draft" | "confirmed" | "needs-checking" | "dismissed";
  createdAt: string;
  updatedAt: string;
};
```

### TaskDemandSummaryCard

```ts
type TaskDemandSummaryCard = {
  cardId: string;
  questId: string;
  chamberId: "brief-fog";
  summaryText: string;
  answerMustDo: string[];
  answerShouldAvoid: string[];
  likelyNextSteps: string[];
  linkedCommandWordCardIds: string[];
  linkedKeywordCardIds: string[];
  linkedScopeLimitCardIds: string[];
  linkedSourceRequirementCardIds: string[];
  linkedFlagIds: string[];
  linkedMissedLootIds: string[];
  status: "draft" | "confirmed" | "needs-checking";
  createdAt: string;
  updatedAt: string;
};
```

## Brief Fog completion state

```ts
type BriefFogCompletionState = {
  requiredChunksResolved: boolean;

  outputCardsCreated: {
    commandWords: boolean;
    keywords: boolean;
    scopeLimits: boolean;
    sourceRequirements: boolean;
    taskDemandSummary: boolean;
  };

  hasOpenFlags: boolean;
  hasMissedLoot: boolean;

  cleared: boolean;
  clearedAt?: string;

  nextUnlockedChamberId: "source-mine" | null;
};
```

Brief Fog clears when required chunks are resolved and a task demand summary exists.

On clear:

- set Brief Fog status to cleared
- add `brief-fog` to completedChambers
- add `source-mine` to unlockedChambers
- set next chamber to `source-mine`
- keep current route location as Cave Base unless route design says otherwise
- add progress log entry saying Brief Fog cleared and Source Mine unlocked

Open flags and missed loot must not set Brief Fog back to in-progress.

## Source Mine unlock update

After Brief Fog clears:

```ts
const sourceMineUnlockUpdate = {
  completedChambersAdd: "brief-fog",
  unlockedChambersAdd: "source-mine",
  currentChamberId: "source-mine",
  currentRouteLocation: "cave-base",
  nextAction: "Enter Source Mine to connect sources, notes, and evidence to the task demand.",
  progressLogSummary: "Source Mine unlocked after Brief Fog was cleared."
};
```

The next chamber should be unlocked, not forced-open. The player should be able to return to Cave Base and choose to enter Source Mine.

## Export

v0.1 exports:

- `.md`
- `.txt`
- Word-openable `.doc`

Proper `.docx` can wait.

Brief Fog export must include:

- quest title
- export date
- current chamber
- chamber status
- current route location
- last saved timestamp
- raw task text
- chunk cards
- plain-meaning notes
- action-created notes
- annotations
- highlights
- dismissed wording
- flags
- missed loot
- command word cards
- keyword cards
- scope/limit cards
- source requirement cards
- task demand summary
- Brief Fog completion state
- progress log
- next action

For Word-openable `.doc`, v0.1 can save simple HTML content with a `.doc` extension.

## Reset rules

Reset must only target:

```ts
questId === "study-skills-trial"
```

Reset Study Skills Trial should:

- reset quest status to task-map-started
- set current chamber to brief-fog
- set current route location to cave-base
- clear completedChambers
- set unlockedChambers to `["brief-fog"]`
- clear collectedLoot
- clear missedLoot
- clear flags
- clear chamberSaves
- reset briefFog to unlocked/blank state
- add one reset progress log entry

Reset must not affect:

- wardrobe data
- house data
- edit room data
- furniture data
- unrelated quests
- source library data
- calendar data
- global settings

## What main repo should implement first

Main repo should implement:

1. Add `BriefFogSave` to the active StudyQuest save.
2. Save raw task text.
3. Split raw task text into chunk cards.
4. Save chunk state changes.
5. Save highlights against chunks.
6. Save notes against chunks and highlights.
7. Save dismissed wording as restorable data.
8. Save flags with attachments.
9. Save missed loot with attachments.
10. Save Brief Fog output cards.
11. Mark Brief Fog cleared when required chunks are resolved and task demand summary exists.
12. Add `brief-fog` to completed chambers on clear.
13. Add `source-mine` to unlocked chambers on clear.
14. Keep Brief Fog complete even when flags or missed loot remain open.
15. Export Brief Fog as `.md`, `.txt`, and Word-openable `.doc`.
16. Reset only The Study Skills Trial when reset test quest is chosen.

Dependencies:
Main repo needs Area 9/10 only for the final names of future chamber IDs after Source Mine, but this Area 11 structure is ready for v0.1 implementation now.

Repo note update:
This file is now the Area 11 Brief Fog save/export structure note.
