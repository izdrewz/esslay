# Esslay

Esslay is a laptop-first, game-style TMA builder with a lighter phone companion workflow.

The main app is designed for building assignments on a laptop, where it is easier to upload or paste task material, organise sources, write drafts, and work sentence by sentence. The phone use is mainly for checking progress, viewing rewards, looking at deadlines, and importing/exporting save data.

## Main TMA quest loop

The intended workflow is:

1. Add or select the TMA/task file.
2. Capture the task question and guidance.
3. Highlight key task words, guidance, learning outcomes, marking criteria, word count, and source requirements.
4. Build a quote bank using geodes.
5. Create the mind map and template plan.
6. Draft the answer.
7. Add and check citations.
8. Use the Flow Diary for sentence-by-sentence flow and relevance checking.
9. Complete the final review.
10. Confirm submitted.

A draft is not treated as finished when the writing is complete. It is only complete when the submitted checkpoint is confirmed.

## Test checklist for the current version

Use one tiny fake TMA and tick these off manually in the browser. This is a testing checklist, not proof that every item has been verified on every browser.

Suggested fake task text:

```text
TMA task: Discuss one challenge students face when managing study time and explain one form of support that could help. Use one source from the module material. Word count: 150 words. Learning outcome: explain how support can reduce barriers to study. Marking criteria: answer the question directly, use evidence, and keep the paragraph relevant.

Source extract: Study planning can reduce pressure because it breaks a larger task into smaller steps. Citation note: Open University study skills material.
```

| Test step | Expected result | Status |
| --- | --- | --- |
| 1. Add/select task file or paste copied task text. | Pasted text or file appears in the Documents list and the active document viewer. | Untested |
| 2. Capture task question. | Highlight saved under Task question and the task checkpoint can complete. | Untested |
| 3. Highlight command words. | Words such as discuss and explain save under Key task words. | Untested |
| 4. Highlight guidance, learning outcome, marking criteria, word count, and source requirements. | Each highlight saves into its own section. Word count should fill the target word field when possible. | Partial: automatic word-count capture is basic and looks for a number. |
| 5. Add a useful quote/source area. | Quote/source text can be sent to Quote Geodes or added manually. | Untested |
| 6. Link the quote geode to a task/guidance target. | The geode shows the selected linked target in its card. | Untested |
| 7. Create a plan checkpoint. | Mind map or template plan text saves, and its checkpoint can be marked complete. | Untested |
| 8. Draft a short paragraph. | Draft text saves in Plan + Draft. | Untested |
| 9. Add/check citation-style notes. | Citation note appears on the geode card and in the exported summary. | Partial: this is a citation note field, not full bibliography support yet. |
| 10. Use Flow Diary sentence by sentence. | Draft loads as separate sentences, edits save, relevance notes save, and checks appear. | Untested |
| 11. Add wording to personal dictionary chapters. | Manual dictionary entries save under the selected chapter. Submitted drafts also add finished wording. | Untested |
| 12. Unlock XP/gold/checkpoint rewards. | Completing a checkpoint awards XP, gold, and loot once. | Untested after latest repair. |
| 13. Try a blocked reward before it is earned. | Reward button should stay blocked until the linked requirement is complete and enough gold is available. | Untested |
| 14. Buy/unlock/place a home item. | Built-in shop item can be bought with gold, displayed, moved, and removed from display. | Untested |
| 15. Import a home item link or uploaded item. | Imported item appears in the shop but is not usable until bought/unlocked. | Untested |
| 16. Export save JSON. | Export output contains saved app data and can be copied. | Untested |
| 17. Export TMA summary `.txt`. | A text file downloads with task sections, quote bank, plan, draft, and quest status. | Untested |
| 18. Export draft `.txt`. | A draft text file downloads. | Untested |
| 19. Re-import the save. | Pasted JSON restores documents, sections, quests, quotes, rewards, home items, draft, and dictionary data. | Untested |

Known current limits for testing:

- PDF and DOCX extraction depends on browser-loaded libraries. If extraction fails, paste copied text instead.
- Highlighting is text-selection based inside the extracted/pasted text box, not a visual PDF highlighter yet.
- Citation support is a local note field and exported summary support, not full tmazing bibliography support yet.
- Direct tmazing and Tma-workbench-local integration is not active in this static version.

## What it does now

- Turns a TMA into an academic quest chain with editable XP, progress percentages, and task statuses.
- Uses the default XP pattern of 10 XP for minimal/prep/checkpoint tasks and 100 XP for submitted drafts.
- Stores assignment details, task question, guidance, source rules, word count, and command words.
- Accepts uploaded PDF, DOCX, Markdown, TXT/plain text files, and copied/pasted text.
- Lets you highlight extracted or pasted text into saved sections.
- Lets you link useful quotes/source areas to task, guidance, plan, or quest targets.
- Builds a quote bank where sources act like geodes that can be opened, sold, or displayed.
- Includes a note-building mode as training rather than combat.
- Includes domestic quests with statuses such as not started, scheduled, in progress, done, skipped, and unplanned.
- Blocks real-life rewards until their linked requirement has been completed.
- Uses the reward categories: Pat on the back, Little treat, Reward, and Bounty.
- Includes a home/base system with built-in starter items, imported items, buying/unlocking, display, and movement.
- Includes a Flow Diary for one-sentence-at-a-time drafting, relevance notes, and Esslayit-style checks.
- Stores personal dictionary entries in chapters, including approved wording, useful phrases, sentence patterns, source-linked terms, avoided wording, ignore words, module vocabulary, and finished-draft wording.
- Exports and imports save data so laptop work can be moved to phone.
- Exports summaries and drafts as `.txt` files and can export the deadline as `.ics`.

## How to open it

Open the app file in the `docs` folder:

```text
docs/index.html
```

For GitHub Pages, publish the `docs` folder from the `main` branch. The expected Pages address would be:

```text
https://izdrewz.github.io/esslay/
```

Because this repository is private, GitHub Pages availability may depend on your GitHub settings and plan.

## Laptop and phone workflow

Use the laptop for the main work:

- upload or paste the task file
- highlight the task question and guidance
- build the quote bank
- create the mind map and template plan
- draft paragraphs
- use the sentence diary
- export the save data

Use the phone for lighter access:

- check XP, gold, rewards, and deadlines
- view domestic quests
- import exported save data
- copy or download the TMA summary if needed

## Current browser limits

This is still a static browser app. It stores work in browser storage and can export/import JSON. It does not yet directly read private GitHub repos, calendar tasks, uploaded files stored in other repos, tmazing, Tma-workbench-local, or other TMA-builder repos by itself.

PDF and DOCX extraction is attempted in the browser using external browser libraries. If those libraries do not load, or if a document cannot be extracted cleanly, paste the relevant copied text into the pasted-text box.

## Future integration boundaries

tmazing should remain the source-library authority. A proper connected version should reuse tmazing source storage, source search, PDF/DOCX extraction, draft-source matching, citation support, bibliography support, ignore dictionary, and export/import where useful.

Tma-workbench-local should remain the planner/calendar authority. A proper connected version should use it for academic quests and planner tasks, while domestic tasks remain usable inside Esslay.

Until that connected version exists, export/import is the bridge. The static app should not pretend that direct repo or calendar sync already exists.
