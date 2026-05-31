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

  function fallbackState() {
    return {
      version: "0.1",
      activeQuestId: QUEST_ID,
      quests: {
        [QUEST_ID]: {
          questId: QUEST_ID,
          questTitle: "Study Skills Trial",
          currentRouteLocation: "task_map_threshold",
          currentChamberId: "brief-fog",
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
    quest.taskMapSummary = { ...baseQuest.taskMapSummary, ...(quest.taskMapSummary || {}) };
    quest.chamberSaves = { ...baseQuest.chamberSaves, ...(quest.chamberSaves || {}) };
    quest.chamberSaves.briefFog = { ...baseQuest.chamberSaves.briefFog, ...(quest.chamberSaves.briefFog || {}) };
    quest.progressLog = Array.isArray(quest.progressLog) ? quest.progressLog : [];
    state.quests[QUEST_ID] = quest;
    state.activeQuestId = QUEST_ID;
    return state;
  }

  function getQuest(state) { return state.quests[QUEST_ID]; }
  function progressLabel(quest) { return `${quest.completedChambers.length} / 7 chambers complete`; }

  function saveState(state) {
    state.activeQuestId = QUEST_ID;
    state.lastSavedAt = now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    updateHud(state);
    migrateQuestBoard(state);
  }

  function updateHud(state) {
    const quest = getQuest(state);
    document.querySelectorAll("[data-flow-quest-title], [data-quest-title]").forEach((node) => node.textContent = quest.questTitle);
    document.querySelectorAll("[data-flow-progress], [data-quest-progress]").forEach((node) => node.textContent = `${quest.completedChambers.length} / 7`);
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
      taskSummary: "Neutral 800-word practice task for testing the StudyQuest route.",
      status: quest.completedChambers.length ? "In progress" : "Archived test quest",
      currentStageLabel: "Brief Fog / Question-Unpacking Chamber",
      progressLabel: progressLabel(quest),
      openFlagsCount: quest.flags.length,
      missedLootCount: quest.missedLoot.length
    };
    localStorage.setItem(BOARD_KEY, JSON.stringify(board));
  }

  function closeAllPanels() {
    document.querySelectorAll("details[open]").forEach((panel) => panel.open = false);
  }

  function closeStageScene() {
    const stage = document.getElementById("stage-scene");
    if (!stage) return;
    stage.hidden = true;
    stage.innerHTML = "";
  }

  function openPanel(selector) {
    closeStageScene();
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
    const html = `<section class="task-map-grid"><article class="flow-card"><p class="eyebrow">Selected task becomes the map</p><h2>${esc(quest.questTitle)}</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Current chamber:</strong> Brief Fog / Question-Unpacking Chamber</p><p><strong>Route location:</strong> ${esc(quest.currentRouteLocation)}</p><p><strong>Progress:</strong> ${esc(progressLabel(quest))}</p><p><strong>Completed chambers:</strong> ${esc(quest.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${quest.flags.length}</p><p><strong>Missed loot:</strong> ${quest.missedLoot.length}</p><div class="flow-actions"><button type="button" data-enter-cave-base>Enter Cave Base</button><button type="button" class="secondary-button" data-back-quest-board>Back to Quest Board</button></div></article><article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">${route.map(([id, label]) => routeNode(quest, id, label)).join("")}</div></article></section>`;
    document.querySelectorAll("[data-task-map]").forEach((mount) => mount.innerHTML = html);
  }

  function openStageScene(markup) {
    closeAllPanels();
    const stage = document.getElementById("stage-scene");
    if (!stage) return;
    stage.innerHTML = markup;
    stage.hidden = false;
  }

  function caveBaseMarkup(state) {
    const quest = getQuest(state);
    return `<section class="stage-room cave-base-room"><button type="button" class="stage-close" data-close-stage aria-label="Close scene">×</button><span class="scene-label">Cave Base · safe hub</span><button type="button" class="flow-hotspot hotspot-chest" data-mini="Outfit chest|Cave outfit override will link to wardrobe later.">Outfit chest</button><button type="button" class="flow-hotspot hotspot-ledger" data-mini="Cave journal|Active quest: ${esc(quest.questTitle)}. Current chamber: Brief Fog / Question-Unpacking Chamber. Progress: ${esc(progressLabel(quest))}.">Cave journal / progress ledger</button><button type="button" class="flow-hotspot hotspot-shelf" data-mini="Completed progress shelf|Completed chambers: ${esc(quest.completedChambers.join(", ") || "none yet")}.">Completed chambers</button><button type="button" class="flow-hotspot hotspot-flags" data-open-flags>Flags / missed loot</button><button type="button" class="flow-hotspot hotspot-continue" data-continue-quest>Continue quest</button><button type="button" class="flow-hotspot hotspot-return" data-open-task-map>Return to Task Map</button><article class="stage-card"><h2>Cave Base</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Current chamber:</strong> Brief Fog / Question-Unpacking Chamber</p><p><strong>Progress:</strong> ${esc(progressLabel(quest))}</p><p><strong>Completed chambers:</strong> ${esc(quest.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${quest.flags.length}</p><p><strong>Missed loot:</strong> ${quest.missedLoot.length}</p><div class="flow-actions"><button type="button" data-continue-quest>Continue Quest</button><button type="button" class="secondary-button" data-open-task-map>Return to Task Map</button></div></article></section>`;
  }

  function briefFogMarkup(state) {
    const quest = getQuest(state);
    const fog = quest.chamberSaves.briefFog;
    return `<section class="stage-room brief-fog-room"><button type="button" class="stage-close" data-close-stage aria-label="Close scene">×</button><span class="scene-label">Brief Fog · first working chamber</span><button type="button" class="flow-hotspot hotspot-parchment">Task parchment</button><button type="button" class="flow-hotspot hotspot-fog">Fog patches</button><button type="button" class="flow-hotspot hotspot-forward">Route forward</button><article class="stage-card"><h2>Brief Fog / Question-Unpacking Chamber</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Task:</strong> ${esc(fog.rawTaskText)}</p><p>Next: split the task into chunks and mark command words, keywords, scope, source requirements, flags, and missed loot.</p><div class="flow-actions"><button type="button" data-open-task-map>Return to Task Map</button></div></article></section>`;
  }

  function openTaskMap(event) {
    if (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    const state = loadState();
    const quest = getQuest(state);
    state.activeQuestId = QUEST_ID;
    quest.currentRouteLocation = "task_map_threshold";
    quest.taskMapOpen = true;
    quest.questBoardOpen = false;
    quest.caveBaseOpen = false;
    quest.currentChamberId = "brief-fog";
    quest.taskMapSummary.currentChamber = "Brief Fog / Question-Unpacking Chamber";
    quest.taskMapSummary.nextAction = "Enter Cave Base";
    saveState(state);
    renderTaskMap(state);
    closeStageScene();
    closeAllPanels();
    openPanel("#map-board-panel");
  }

  function enterCaveBase(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    const quest = getQuest(state);
    state.activeQuestId = QUEST_ID;
    state.caveBase = { ...(state.caveBase || {}), lastVisitedAt: now() };
    quest.currentRouteLocation = "cave_base";
    quest.taskMapOpen = false;
    quest.questBoardOpen = false;
    quest.caveBaseOpen = true;
    quest.currentChamberId = "brief-fog";
    quest.taskMapSummary.currentChamber = "Brief Fog / Question-Unpacking Chamber";
    quest.taskMapSummary.progress = progressLabel(quest);
    quest.taskMapSummary.nextAction = "Continue to Brief Fog / Question-Unpacking Chamber";
    quest.progressLog.unshift({ id: `log-${Date.now()}`, timestamp: now(), action: "enter-cave-base", summary: "Entered Cave Base from Task Map threshold." });
    saveState(state);
    renderTaskMap(state);
    openStageScene(caveBaseMarkup(state));
  }

  function continueQuest(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    const quest = getQuest(state);
    state.activeQuestId = QUEST_ID;
    quest.currentRouteLocation = "working_chamber";
    quest.caveBaseOpen = false;
    quest.currentChamberId = "brief-fog";
    quest.taskMapSummary.currentChamber = "Brief Fog / Question-Unpacking Chamber";
    quest.taskMapSummary.nextAction = "Work through Brief Fog chunks";
    quest.progressLog.unshift({ id: `log-${Date.now()}`, timestamp: now(), action: "continue-brief-fog", summary: "Opened Brief Fog from Cave Base." });
    saveState(state);
    openStageScene(briefFogMarkup(state));
  }

  function resetOldStudyTrialBoardIfNeeded() {
    const state = loadState();
    migrateQuestBoard(state);
  }

  function init() {
    const state = loadState();
    saveState(state);
    renderTaskMap(state);
    resetOldStudyTrialBoardIfNeeded();

    document.addEventListener("click", (event) => {
      const close = event.target.closest("[data-close-panel]");
      if (close) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const panel = close.closest("details");
        if (panel) panel.open = false;
        return;
      }

      const closeStage = event.target.closest("[data-close-stage]");
      if (closeStage) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeStageScene();
        return;
      }

      const mini = event.target.closest("[data-mini]");
      if (mini) {
        event.preventDefault();
        const [title, body] = mini.dataset.mini.split("|");
        alert(`${title}\n\n${body}`);
        return;
      }

      const target = event.target.closest("[data-open-task-map], [data-enter-cave-base], [data-continue-quest]");
      if (!target) return;
      if (target.matches("[data-open-task-map]")) return openTaskMap(event);
      if (target.matches("[data-enter-cave-base]")) return enterCaveBase(event);
      if (target.matches("[data-continue-quest]")) return continueQuest(event);
    }, true);

    setTimeout(() => renderTaskMap(loadState()), 150);
    setTimeout(() => renderTaskMap(loadState()), 700);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
