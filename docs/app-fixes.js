// Small compatibility layer for the static app.
// It keeps first-run quest records stable if the save file was created before IDs existed.
(function ensureStableQuestIds() {
  if (!window.localStorage) return;

  const key = "esslay-game-save-v2";
  const raw = localStorage.getItem(key);
  if (!raw) return;

  try {
    const save = JSON.parse(raw);
    let changed = false;

    if (Array.isArray(save.academicQuests)) {
      save.academicQuests = save.academicQuests.map((quest) => {
        if (quest.id) return quest;
        changed = true;
        return {
          ...quest,
          id: `quest-${quest.key || Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        };
      });
    }

    if (changed) {
      localStorage.setItem(key, JSON.stringify(save));
      window.location.reload();
    }
  } catch {
    // Leave invalid local saves untouched. Import/export can repair them manually.
  }
})();
