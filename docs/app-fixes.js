// Compatibility and first-run repair layer for the static app.
// This runs after app.js and repairs save/state details that a static app cannot migrate through a backend.
(function repairStaticAppState() {
  try {
    if (!document.querySelector('link[href="styles-v2.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "styles-v2.css";
      document.head.appendChild(link);
    }

    if (typeof state !== "undefined" && Array.isArray(state.academicQuests)) {
      let changed = false;
      state.academicQuests.forEach((quest) => {
        if (!quest.id) {
          quest.id = `quest-${quest.key || Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          changed = true;
        }

        if ((quest.status === "done" || quest.progress >= 100) && quest.awarded !== true) {
          quest.awarded = true;
          changed = true;
        }
      });

      if (changed) {
        saveState();
        render();
      }
    }
  } catch {
    // If the main app is not available, leave the page alone.
  }
})();
