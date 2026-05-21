# Esslay

Esslay is a laptop-first, game-style TMA builder with a lighter phone companion workflow.

The main app is designed for building assignments on a laptop, where it is easier to paste guidance, organise sources, write drafts, and work sentence by sentence. The phone use is mainly for checking progress, viewing rewards, looking at deadlines, and importing/exporting save data.

## What it does now

- Turns a TMA into a quest chain with checkpoints.
- Gives XP, gold, and loot when work is completed.
- Stores assignment details, task question, guidance, source rules, and command words.
- Builds a quote bank where sources act like geodes.
- Includes a note-building section as training rather than combat.
- Includes domestic quests for life tasks such as cleaning, admin, food, health, and resets.
- Lets you add real-life rewards with links, descriptions, costs, and reward categories.
- Lets you add home items, buy them with gold, and display them in a simple room.
- Includes a flow diary for checking a draft one sentence at a time.
- Exports and imports save data so laptop work can be moved to phone.

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

- paste the task question and guidance
- build the quote bank
- draft paragraphs
- use the sentence diary
- export the save data

Use the phone for lighter access:

- check XP, gold, rewards, and deadlines
- view domestic quests
- import exported save data
- copy the TMA summary if needed

## Important limits in this first version

This is a static browser app. It stores work in browser storage and can export/import JSON. It does not yet directly read private GitHub repos, calendar tasks, uploaded files, or the other TMA-builder repos by itself.

Those can be added later with a connected backend or GitHub authentication, but they should not be faked in the first version.
