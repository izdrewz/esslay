(() => {
  const SAVE_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";

  const route = [
    ["cave-base", "Cave Base"],
    ["brief-fog", "Brief Fog"],
    ["source-mine", "Source Mine"],
    ["quote-bank", "Quote Bank"],
    ["draft-route", "Draft Route"],
    ["dirty-draft", "Dirty Draft"],
    ["coherence-boss", "Coherence Boss"]
  ];

  function esc(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function loadState() {
    let state;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { state = null; }
    if (!state || !state.quests || !state.quests[QUEST_ID]) {
      state = {
        activeQuestId: QUEST_ID,
        selectedQuestId: QUEST_ID,
        quests: {
          [QUEST_ID]: {
            questTitle: "Study Skills Trial",
            currentRouteLocation: "task_map_threshold",
            currentChamberId: "brief-fog",
            completedChambers: [],
            unlockedChambers: ["cave-base", "brief-fog"],
            flags: [],
            missedLoot: []
          }
        }
      };
    }
    const quest = state.quests[QUEST_ID];
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.flags = Array.isArray(quest.flags) ? quest.flags : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot : [];
    return state;
  }

  function saveState(state) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function quest(state) {
    return state.quests[QUEST_ID];
  }

  function chamberLabel(id) {
    if (id === "source-mine") return "Source Mine";
    if (id === "brief-fog") return "Brief Fog / Question-Unpacking Chamber";
    return "Cave Base";
  }

  function progressLabel(q) {
    return `${q.completedChambers.length} / 7 chambers complete`;
  }

  function closeStage() {
    const stage = document.getElementById("stage-scene");
    if (!stage) return;
    stage.hidden = true;
    stage.innerHTML = "";
  }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach((panel) => { panel.open = false; });
  }

  function openPanel(selector) {
    closeStage();
    closePanels();
    const panel = document.querySelector(selector);
    if (panel) panel.open = true;
  }

  function renderTaskMap(state) {
    const q = quest(state);
    const current = q.completedChambers.includes("brief-fog") ? "source-mine" : "brief-fog";
    q.currentChamberId = current;
    const node = (id, label) => {
      const complete = q.completedChambers.includes(id);
      const unlocked = q.unlockedChambers.includes(id);
      const active = id === current;
      const status = complete ? "Complete" : active ? "Current" : unlocked ? "Unlocked" : "Locked";
      return `<article class="route-node-card ${complete ? "complete" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "current" : ""}"><strong>${esc(label)}</strong><p>${esc(status)}</p></article>`;
    };
    const html = `<section class="task-map-grid"><article class="flow-card"><p class="eyebrow">Selected task becomes the map</p><h2>${esc(q.questTitle || "Study Skills Trial")}</h2><p><strong>Active quest:</strong> ${esc(q.questTitle || "Study Skills Trial")}</p><p><strong>Current chamber:</strong> ${esc(chamberLabel(current))}</p><p><strong>Progress:</strong> ${esc(progressLabel(q))}</p><p><strong>Completed chambers:</strong> ${esc(q.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${q.flags.length}</p><p><strong>Missed loot:</strong> ${q.missedLoot.length}</p><div class="flow-actions"><button type="button" data-enter-cave-base>Enter Cave Base</button><button type="button" class="secondary-button" data-back-quest-board>Back to Quest Board</button></div></article><article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">${route.map(([id, label]) => node(id, label)).join("")}</div></article></section>`;
    document.querySelectorAll("[data-task-map]").forEach((mount) => { mount.innerHTML = html; });
  }

  function openQuestBoard(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const state = loadState();
    quest(state).currentRouteLocation = "quest_board";
    saveState(state);
    openPanel("#quest-board-panel");
  }

  function openTaskMap(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const state = loadState();
    quest(state).currentRouteLocation = "task_map_threshold";
    renderTaskMap(state);
    saveState(state);
    openPanel("#map-board-panel");
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderTaskMap(loadState());
    document.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-panel]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const panel = event.target.closest("details");
        if (panel) panel.open = false;
        return;
      }
      if (event.target.closest("[data-open-quest-board]")) return openQuestBoard(event);
      if (event.target.closest('[data-open-quest="study-skills-trial"]')) return openTaskMap(event);
      if (event.target.closest("[data-open-task-map]")) return openTaskMap(event);
      if (event.target.closest("[data-back-quest-board]")) return openQuestBoard(event);
    }, true);
  });
})();
