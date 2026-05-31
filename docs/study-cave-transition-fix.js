(() => {
  const KEY = "esslay-study-cave-save-v01";
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

  function defaultQuest() {
    const createdAt = now();
    return {
      questId: QUEST_ID,
      questTitle: "Study Skills Trial",
      questStatus: "test",
      currentChamberId: "brief-fog",
      currentRouteLocation: "task_map_threshold",
      completedChambers: [],
      unlockedChambers: ["cave-base", "brief-fog"],
      collectedLoot: [],
      missedLoot: [],
      flags: [],
      taskMapOpen: false,
      questBoardOpen: false,
      caveBaseOpen: false,
      taskMapSummary: {
        activeQuest: "Study Skills Trial",
        wordCount: 800,
        currentChamber: "Brief Fog / Question-Unpacking Chamber",
        progress: "0 / 7 chambers complete",
        nextAction: "Enter Cave Base"
      },
      chamberSaves: {
        briefFog: {
          taskTitle: "Study Skills Trial",
          assessmentType: "practice task",
          moduleSubject: "Study skills",
          wordCount: 800,
          deadline: "",
          rawTaskText: "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.",
          sourceRequirementSummary: "Use the study skills guide as support material.",
          markingGuidanceSummary: "Explain clearly and stay focused.",
          chunks: [],
          commandWordCards: [],
          keywordCards: [],
          scopeLimitCards: [],
          sourceRequirementCards: [],
          taskDemandSummary: ""
        }
      },
      progressLog: [{ id: `log-${Date.now()}`, timestamp: createdAt, action: "created", summary: "Study Skills Trial save created." }],
      createdAt,
      updatedAt: createdAt
    };
  }

  function defaultState() {
    return {
      version: "0.1",
      activeQuestId: QUEST_ID,
      quests: { [QUEST_ID]: defaultQuest() },
      caveBase: { caveOutfitOverride: null, lastVisitedAt: null },
      globalProgressLog: [],
      lastSavedAt: now()
    };
  }

  function normaliseQuest(rawQuest) {
    const base = defaultQuest();
    const quest = { ...base, ...(rawQuest || {}) };
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) && quest.unlockedChambers.length ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.collectedLoot = Array.isArray(quest.collectedLoot) ? quest.collectedLoot : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot : [];
    quest.flags = Array.isArray(quest.flags) ? quest.flags : [];
    quest.taskMapSummary = { ...base.taskMapSummary, ...(quest.taskMapSummary || {}) };
    quest.chamberSaves = { ...base.chamberSaves, ...(quest.chamberSaves || {}) };
    quest.chamberSaves.briefFog = { ...base.chamberSaves.briefFog, ...(quest.chamberSaves.briefFog || {}) };
    quest.progressLog = Array.isArray(quest.progressLog) ? quest.progressLog : [];
    return quest;
  }

  function loadState() {
    try {
      const base = defaultState();
      const stored = JSON.parse(localStorage.getItem(KEY));
      const state = { ...base, ...(stored || {}) };
      state.quests = { ...base.quests, ...(state.quests || {}) };
      state.quests[QUEST_ID] = normaliseQuest(state.quests[QUEST_ID]);
      state.caveBase = { ...base.caveBase, ...(state.caveBase || {}) };
      return state;
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    state.activeQuestId = QUEST_ID;
    state.lastSavedAt = now();
    const quest = state.quests[QUEST_ID];
    quest.updatedAt = state.lastSavedAt;
    localStorage.setItem(KEY, JSON.stringify(state));
    updateHud(state);
  }

  function getQuest(state) {
    return state.quests[QUEST_ID];
  }

  function progressText(quest) {
    return quest.taskMapSummary?.progress || `${quest.completedChambers.length} / 7 chambers complete`;
  }

  function closeAllPanels() {
    document.querySelectorAll("details[open]").forEach((panel) => panel.open = false);
  }

  function openPanel(id) {
    const panel = document.querySelector(id);
    if (!panel) return;
    panel.open = true;
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function ensurePanel(id, className, title, dataAttr) {
    let panel = document.querySelector(`#${id}`);
    if (panel) return panel;
    const cave = document.querySelector(".game-cave");
    if (!cave) return null;
    cave.insertAdjacentHTML("beforeend", `<details class="${className}" id="${id}"><summary>${title}</summary><button type="button" class="panel-close" data-close-panel aria-label="Close popup">×</button><div class="flow-content" ${dataAttr}></div></details>`);
    return document.querySelector(`#${id}`);
  }

  function ensureFlowPanels() {
    ensurePanel("cave-base-panel", "cave-scene-panel", "Cave Base", "data-cave-base");
    ensurePanel("brief-fog-panel", "cave-scene-panel", "Brief Fog / Question-Unpacking Chamber", "data-brief-fog");
  }

  function updateHud(state) {
    const quest = getQuest(state);
    document.querySelectorAll("[data-flow-quest-title], [data-quest-title]").forEach((node) => node.textContent = quest.questTitle);
    document.querySelectorAll("[data-flow-progress], [data-quest-progress]").forEach((node) => node.textContent = `${quest.completedChambers.length} / 7`);
  }

  function routeNodeHtml(quest, id, label) {
    const complete = quest.completedChambers.includes(id);
    const unlocked = quest.unlockedChambers.includes(id);
    const current = id === "cave-base" ? quest.currentRouteLocation === "cave_base" : quest.currentChamberId === id;
    const status = complete ? "Complete" : current ? "Current" : unlocked ? "Unlocked" : "Locked";
    return `<article class="route-node-card ${complete ? "complete" : ""} ${unlocked ? "unlocked" : "locked"} ${current ? "current" : ""}"><strong>${esc(label)}</strong><p>${esc(status)}</p></article>`;
  }

  function renderTaskMap(state) {
    const quest = getQuest(state);
    const html = `<section class="task-map-grid"><article class="flow-card"><p class="eyebrow">Selected task becomes the map</p><h2>${esc(quest.questTitle)}</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Word count:</strong> ${esc(quest.chamberSaves.briefFog.wordCount || 800)} words</p><p><strong>Current chamber:</strong> ${esc(quest.taskMapSummary.currentChamber || "Brief Fog / Question-Unpacking Chamber")}</p><p><strong>Route location:</strong> ${esc(quest.currentRouteLocation)}</p><p><strong>Progress:</strong> ${esc(progressText(quest))}</p><p><strong>Completed chambers:</strong> ${esc(quest.completedChambers.join(", ") || "none yet")}</p><p><strong>Flags:</strong> ${quest.flags.length} · <strong>Missed loot:</strong> ${quest.missedLoot.length}</p><div class="flow-actions"><button type="button" data-enter-cave-base>Enter Cave Base</button><button type="button" class="secondary-button" data-back-quest-board>Back to Quest Board</button></div></article><article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">${route.map(([id, label]) => routeNodeHtml(quest, id, label)).join("")}</div></article></section>`;
    document.querySelectorAll("[data-task-map]").forEach((mount) => mount.innerHTML = html);
  }

  function renderCaveBase(state) {
    ensureFlowPanels();
    const quest = getQuest(state);
    const mount = document.querySelector("[data-cave-base]");
    if (!mount) return;
    mount.innerHTML = `<section class="cave-base-scene"><span class="scene-label">Cave Base · safe hub</span><button type="button" class="flow-hotspot hotspot-chest" data-mini="Outfit chest|Cave outfit override will link to wardrobe later.">Outfit chest</button><button type="button" class="flow-hotspot hotspot-ledger" data-mini="Cave journal|Active quest: ${esc(quest.questTitle)}. Current chamber: Brief Fog / Question-Unpacking Chamber. Progress: ${esc(progressText(quest))}.">Cave journal / progress ledger</button><button type="button" class="flow-hotspot hotspot-shelf" data-mini="Completed progress shelf|Completed chambers: ${esc(quest.completedChambers.join(", ") || "none yet")}.">Completed progress shelf</button><button type="button" class="flow-hotspot hotspot-flags" data-open-flags>Flags / missed loot</button><button type="button" class="flow-hotspot hotspot-continue" data-continue-quest>Continue quest</button><button type="button" class="flow-hotspot hotspot-return" data-open-task-map>Return to Task Map</button></section><article class="flow-card"><h2>Cave Base</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Current chamber:</strong> Brief Fog / Question-Unpacking Chamber</p><p><strong>Progress:</strong> ${esc(progressText(quest))}</p><p><strong>Completed chambers:</strong> ${esc(quest.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${quest.flags.length}</p><p><strong>Missed loot:</strong> ${quest.missedLoot.length}</p><div class="flow-actions"><button type="button" data-continue-quest>Continue Quest</button><button type="button" class="secondary-button" data-open-task-map>Return to Task Map</button></div></article>`;
  }

  function renderBriefFog(state) {
    ensureFlowPanels();
    const quest = getQuest(state);
    const fog = quest.chamberSaves.briefFog;
    const mount = document.querySelector("[data-brief-fog]");
    if (!mount) return;
    if (mount.innerHTML.trim()) return;
    mount.innerHTML = `<section class="brief-fog-scene"><span class="scene-label">Brief Fog · first working chamber</span><button type="button" class="flow-hotspot hotspot-parchment">Task parchment</button><button type="button" class="flow-hotspot hotspot-forward">Route forward</button></section><article class="flow-card"><h2>Brief Fog / Question-Unpacking Chamber</h2><p><strong>Active quest:</strong> ${esc(quest.questTitle)}</p><p><strong>Task:</strong> ${esc(fog.rawTaskText)}</p><p>This chamber uses the full Brief Fog chunk workflow already attached to this page.</p></article>`;
  }

  function renderFlagsLoot(state) {
    const mount = document.querySelector("[data-flags-loot-panel]") || document.querySelector(".quest-bag .log-list");
    if (!mount) return;
    const quest = getQuest(state);
    mount.innerHTML = `<div class="flow-content"><h3>Flags</h3><ul>${quest.flags.map((flag) => `<li>${esc(flag.chamberId)}: ${esc(flag.text)}</li>`).join("") || "<li>None yet.</li>"}</ul><h3>Missed loot</h3><ul>${quest.missedLoot.map((item) => `<li>${esc(item.chamberId)}: ${esc(item.text)}</li>`).join("") || "<li>None yet.</li>"}</ul></div>`;
  }

  function enterCaveBase(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    const quest = getQuest(state);
    state.activeQuestId = QUEST_ID;
    state.caveBase.lastVisitedAt = now();
    quest.currentRouteLocation = "cave_base";
    quest.taskMapOpen = false;
    quest.questBoardOpen = false;
    quest.caveBaseOpen = true;
    quest.currentChamberId = "brief-fog";
    quest.taskMapSummary.currentChamber = "Brief Fog / Question-Unpacking Chamber";
    quest.taskMapSummary.progress = quest.taskMapSummary.progress || progressText(quest);
    quest.taskMapSummary.nextAction = "Continue to Brief Fog / Question-Unpacking Chamber";
    quest.progressLog.unshift({ id: `log-${Date.now()}`, timestamp: now(), action: "enter-cave-base", summary: "Entered Cave Base from Task Map threshold." });
    saveState(state);
    renderTaskMap(state);
    renderCaveBase(state);
    renderFlagsLoot(state);
    closeAllPanels();
    openPanel("#cave-base-panel");
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
    renderBriefFog(state);
    closeAllPanels();
    openPanel("#brief-fog-panel");
  }

  function init() {
    ensureFlowPanels();
    const state = loadState();
    saveState(state);
    renderTaskMap(state);
    renderCaveBase(state);
    renderFlagsLoot(state);
    document.addEventListener("click", (event) => {
      const enterButton = event.target.closest("[data-enter-cave-base]");
      if (enterButton) enterCaveBase(event);
    }, true);
    document.addEventListener("click", (event) => {
      const continueButton = event.target.closest("[data-continue-quest]");
      if (continueButton) continueQuest(event);
    }, true);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
