(() => {
  const SAVE_KEY = "esslay-study-cave-save-v01";
  const BOARD_KEY = "esslay-quest-board-v01";
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

  function now() { return new Date().toISOString(); }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  function chamberLabel(id) {
    if (id === "source-mine") return "Source Mine";
    if (id === "brief-fog") return "Brief Fog / Question-Unpacking Chamber";
    return "Cave Base";
  }

  function fallbackState() {
    return {
      version: "0.1",
      activeQuestId: QUEST_ID,
      selectedQuestId: QUEST_ID,
      quests: {
        [QUEST_ID]: {
          questId: QUEST_ID,
          questTitle: "Study Skills Trial",
          status: "not_started",
          questStatus: "task-map-started",
          currentRouteLocation: "task_map_threshold",
          currentChamberId: "brief-fog",
          currentChamberLabel: "Brief Fog / Question-Unpacking Chamber",
          completedChambers: [],
          unlockedChambers: ["cave-base", "brief-fog"],
          flags: [],
          missedLoot: [],
          collectedLoot: [],
          taskMapOpen: false,
          questBoardOpen: false,
          caveBaseOpen: false,
          taskMapSummary: {
            currentChamber: "Brief Fog / Question-Unpacking Chamber",
            progress: "0 / 7 chambers complete",
            nextAction: "Enter Cave Base"
          },
          chamberSaves: {
            briefFog: {
              wordCount: 800,
              rawTaskText: "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment."
            }
          },
          progressLog: []
        }
      },
      caveBase: { lastVisitedAt: null },
      globalProgressLog: [],
      lastSavedAt: now()
    };
  }

  function loadState() {
    let state;
    try { state = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { state = null; }
    const fallback = fallbackState();
    state = { ...fallback, ...(state || {}) };
    state.quests = { ...fallback.quests, ...(state.quests || {}) };
    const baseQuest = fallback.quests[QUEST_ID];
    const quest = { ...baseQuest, ...(state.quests[QUEST_ID] || {}) };
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) && quest.unlockedChambers.length ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.flags = Array.isArray(quest.flags) ? quest.flags : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot : [];
    quest.collectedLoot = Array.isArray(quest.collectedLoot) ? quest.collectedLoot : [];
    quest.progressLog = Array.isArray(quest.progressLog) ? quest.progressLog : [];
    quest.taskMapSummary = { ...baseQuest.taskMapSummary, ...(quest.taskMapSummary || {}) };
    quest.chamberSaves = { ...baseQuest.chamberSaves, ...(quest.chamberSaves || {}) };
    quest.chamberSaves.briefFog = { ...baseQuest.chamberSaves.briefFog, ...(quest.chamberSaves.briefFog || {}) };
    state.quests[QUEST_ID] = quest;
    state.activeQuestId = QUEST_ID;
    state.selectedQuestId = QUEST_ID;
    return state;
  }

  function getQuest(state) { return state.quests[QUEST_ID]; }
  function progressLabel(quest) { return `${quest.completedChambers.length} / 7 chambers complete`; }

  function saveState(state) {
    const quest = getQuest(state);
    state.activeQuestId = QUEST_ID;
    state.selectedQuestId = QUEST_ID;
    state.lastSavedAt = now();
    quest.updatedAt = state.lastSavedAt;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    updateHud(state);
    migrateQuestBoard(state);
  }

  function updateHud(state) {
    const quest = getQuest(state);
    document.querySelectorAll("[data-flow-quest-title], [data-quest-title]").forEach((node) => { node.textContent = quest.questTitle; });
    document.querySelectorAll("[data-flow-progress], [data-quest-progress]").forEach((node) => { node.textContent = `${quest.completedChambers.length} / 7`; });
  }

  function migrateQuestBoard(state) {
    const quest = getQuest(state);
    let board;
    try { board = JSON.parse(localStorage.getItem(BOARD_KEY)); } catch { board = null; }
    if (!Array.isArray(board)) return;
    const index = board.findIndex((card) => card.id === QUEST_ID);
    if (index === -1) return;
    board[index] = {
      ...board[index],
      title: "Study Skills Trial",
      boardCategory: "archive_test",
      questType: "test",
      taskSummary: `Neutral 800-word practice task. Current chamber: ${chamberLabel(quest.currentChamberId)}. Progress: ${progressLabel(quest)}.`,
      status: quest.completedChambers.length ? "In progress" : "Archived test quest",
      currentStageLabel: chamberLabel(quest.currentChamberId),
      progressLabel: progressLabel(quest),
      openFlagsCount: quest.flags.length,
      missedLootCount: quest.missedLoot.length
    };
    localStorage.setItem(BOARD_KEY, JSON.stringify(board));
  }

  function closeStageScene() {
    const stage = document.getElementById("stage-scene");
    if (!stage) return;
    stage.hidden = true;
    stage.innerHTML = "";
  }

  function closeAllPanels() {
    document.querySelectorAll("details[open]").forEach((panel) => { panel.open = false; });
  }

  function openPanel(selector) {
    closeStageScene();
    closeAllPanels();
    const panel = document.querySelector(selector);
    if (!panel) return;
    panel.open = true;
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function routeNode(quest, id, label) {
    const complete = quest.completedChambers.includes(id);
    const unlocked = quest.unlockedChambers.includes(id);
    const current = id === "cave-base" ? quest.currentRouteLocation === "cave_base" : quest.currentChamberId === id;
    const status = complete ? "Complete" : current ? "Current" : unlocked ? "Unlocked" : "Locked";
    return `<article class="route-node-card ${complete ? "complete" : ""} ${unlocked ? "unlocked" : "locked"} ${current ? "current" : ""}"><strong>${esc(label)}</strong><p>${esc(status)}</p></article>`;
  }

  function renderTaskMap(state = loadState()) {
    const quest = getQuest(state);
    const html = `<section class="task-map-grid"><article class="flow-card"><p class="eyebrow">Selected task becomes the map</p><h2>${esc(quest.questTitle)}</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Current chamber:</strong> ${esc(chamberLabel(quest.currentChamberId))}</p><p><strong>Route location:</strong> ${esc(quest.currentRouteLocation)}</p><p><strong>Progress:</strong> ${esc(progressLabel(quest))}</p><p><strong>Completed chambers:</strong> ${esc(quest.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${quest.flags.length}</p><p><strong>Missed loot:</strong> ${quest.missedLoot.length}</p><div class="flow-actions"><button type="button" data-enter-cave-base>Enter Cave Base</button><button type="button" class="secondary-button" data-back-quest-board>Back to Quest Board</button></div></article><article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">${route.map(([id, label]) => routeNode(quest, id, label)).join("")}</div></article></section>`;
    document.querySelectorAll("[data-task-map]").forEach((mount) => { mount.innerHTML = html; });
  }

  function openQuestBoard(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    const state = loadState();
    const quest = getQuest(state);
    quest.currentRouteLocation = "quest_board";
    quest.questBoardOpen = true;
    quest.taskMapOpen = false;
    quest.caveBaseOpen = false;
    saveState(state);
    openPanel("#quest-board-panel");
  }

  function openTaskMap(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    const state = loadState();
    const quest = getQuest(state);
    const nextChamber = quest.completedChambers.includes("brief-fog") || quest.currentChamberId === "source-mine" ? "source-mine" : "brief-fog";
    quest.currentRouteLocation = "task_map_threshold";
    quest.currentChamberId = nextChamber;
    quest.currentChamberLabel = chamberLabel(nextChamber);
    quest.taskMapOpen = true;
    quest.questBoardOpen = false;
    quest.caveBaseOpen = false;
    quest.taskMapSummary.currentChamber = chamberLabel(nextChamber);
    quest.taskMapSummary.progress = progressLabel(quest);
    quest.taskMapSummary.nextAction = "Enter Cave Base";
    saveState(state);
    renderTaskMap(state);
    openPanel("#map-board-panel");
  }

  function patchBriefFogLabels(root = document) {
    root.querySelectorAll("[data-suggest-chunks]").forEach((button) => {
      button.textContent = "Suggest chunks";
    });
  }

  function injectBriefFogClickSafety() {
    if (document.getElementById("brief-fog-click-safety")) return;
    const style = document.createElement("style");
    style.id = "brief-fog-click-safety";
    style.textContent = `
      .stage-scene .brief-fog-room.cutscene-active .stage-close,
      .stage-scene .brief-fog-room.cutscene-active .flow-hotspot {
        opacity: 1 !important;
        pointer-events: auto !important;
      }
      .stage-scene .brief-fog-room .stage-close {
        z-index: 120 !important;
        pointer-events: auto !important;
      }
      .stage-scene .brief-fog-room .flow-hotspot {
        z-index: 110 !important;
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectBriefFogClickSafety();
    const state = loadState();
    saveState(state);
    renderTaskMap(state);
    patchBriefFogLabels();

    const stage = document.getElementById("stage-scene");
    if (stage && "MutationObserver" in window) {
      new MutationObserver(() => {
        patchBriefFogLabels(stage);
        injectBriefFogClickSafety();
      }).observe(stage, { childList: true, subtree: true });
    }

    document.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-panel]");
      if (close) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const panel = close.closest("details");
        if (panel) panel.open = false;
        return;
      }

      const questBoardButton = event.target.closest("[data-open-quest-board]");
      if (questBoardButton) return openQuestBoard(event);

      const studyTrialButton = event.target.closest('[data-open-quest="study-skills-trial"]');
      if (studyTrialButton) return openTaskMap(event);

      const openMapButton = event.target.closest("[data-open-task-map]");
      if (openMapButton) return openTaskMap(event);

      const backButton = event.target.closest("[data-back-quest-board]");
      if (backButton) return openQuestBoard(event);
    }, true);

    window.setTimeout(() => renderTaskMap(loadState()), 150);
    window.setTimeout(() => {
      renderTaskMap(loadState());
      patchBriefFogLabels();
      injectBriefFogClickSafety();
    }, 700);
  }

  document.addEventListener("DOMContentLoaded", init);
})();