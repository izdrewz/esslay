(() => {
  const SAVE_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";

  function now() {
    return new Date().toISOString();
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;"
    }[char]));
  }

  function defaultState() {
    const t = now();
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
          progressLog: [],
          createdAt: t,
          updatedAt: t
        }
      },
      caveBase: { lastVisitedAt: null },
      lastSavedAt: t
    };
  }

  function loadState() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { raw = null; }
    const base = defaultState();
    const state = { ...base, ...(raw || {}) };
    state.quests = { ...base.quests, ...(state.quests || {}) };
    state.quests[QUEST_ID] = { ...base.quests[QUEST_ID], ...(state.quests[QUEST_ID] || {}) };
    const quest = state.quests[QUEST_ID];
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) && quest.unlockedChambers.length ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.flags = Array.isArray(quest.flags) ? quest.flags : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot : [];
    quest.collectedLoot = Array.isArray(quest.collectedLoot) ? quest.collectedLoot : [];
    quest.progressLog = Array.isArray(quest.progressLog) ? quest.progressLog : [];
    quest.taskMapSummary = { ...base.quests[QUEST_ID].taskMapSummary, ...(quest.taskMapSummary || {}) };
    state.caveBase = { ...(base.caveBase || {}), ...(state.caveBase || {}) };
    state.activeQuestId = QUEST_ID;
    return state;
  }

  function saveState(state) {
    state.activeQuestId = QUEST_ID;
    state.lastSavedAt = now();
    state.quests[QUEST_ID].updatedAt = state.lastSavedAt;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    updateHud(state);
  }

  function quest(state) {
    return state.quests[QUEST_ID];
  }

  function progressLabel(q) {
    return `${q.completedChambers.length} / 7 chambers complete`;
  }

  function updateHud(state) {
    const q = quest(state);
    document.querySelectorAll("[data-flow-quest-title], [data-quest-title]").forEach((node) => node.textContent = q.questTitle);
    document.querySelectorAll("[data-flow-progress], [data-quest-progress]").forEach((node) => node.textContent = `${q.completedChambers.length} / 7`);
  }

  function ensureStage() {
    let stage = document.getElementById("stage-scene");
    if (stage) return stage;
    const cave = document.querySelector(".game-cave");
    if (!cave) return null;
    stage = document.createElement("div");
    stage.className = "stage-scene";
    stage.id = "stage-scene";
    stage.hidden = true;
    stage.setAttribute("aria-live", "polite");
    cave.appendChild(stage);
    return stage;
  }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach((panel) => { panel.open = false; });
  }

  function closeStage() {
    const stage = ensureStage();
    if (!stage) return;
    stage.hidden = true;
    stage.innerHTML = "";
  }

  function openMapPanel() {
    closeStage();
    const panel = document.getElementById("map-board-panel") || document.getElementById("task-map-threshold-panel");
    if (panel) panel.open = true;
  }

  function openStage(markup) {
    closePanels();
    const stage = ensureStage();
    if (!stage) return;
    stage.innerHTML = markup;
    stage.hidden = false;
  }

  function caveBaseMarkup(state) {
    const q = quest(state);
    return `<section class="stage-room cave-base-room">
      <button type="button" class="stage-close" data-close-stage aria-label="Close Cave Base">×</button>
      <span class="scene-label">Cave Base · safe hub</span>
      <div class="stage-character stage-character-base" aria-label="Player character" role="img"></div>
      <button type="button" class="flow-hotspot hotspot-chest" data-hotspot-label="Outfit chest" data-mini="Outfit chest|Cave outfit override will connect to wardrobe later.">Outfit chest</button>
      <button type="button" class="flow-hotspot hotspot-ledger" data-hotspot-label="Journal" data-mini="Cave journal|Current chamber: Brief Fog / Question-Unpacking Chamber. Progress: ${esc(progressLabel(q))}.">Cave journal</button>
      <button type="button" class="flow-hotspot hotspot-shelf" data-hotspot-label="Completed" data-mini="Completed chambers|${esc(q.completedChambers.join(", ") || "none yet")}">Completed chambers</button>
      <button type="button" class="flow-hotspot hotspot-flags" data-hotspot-label="Flags" data-open-flags>Flags / missed loot</button>
      <button type="button" class="flow-hotspot hotspot-continue" data-hotspot-label="Continue" data-continue-quest>Continue quest</button>
      <button type="button" class="flow-hotspot hotspot-return" data-hotspot-label="Task map" data-open-task-map>Return to Task Map</button>
      <article class="stage-card">
        <h2>Cave Base</h2>
        <p><strong>Active quest:</strong> ${esc(q.questTitle)}</p>
        <p><strong>Current chamber:</strong> Brief Fog / Question-Unpacking Chamber</p>
        <p><strong>Progress:</strong> ${esc(progressLabel(q))}</p>
        <p><strong>Completed:</strong> ${esc(q.completedChambers.join(", ") || "none yet")}</p>
        <p><strong>Flags:</strong> ${q.flags.length} · <strong>Missed loot:</strong> ${q.missedLoot.length}</p>
      </article>
    </section>`;
  }

  function briefFogMarkup(state) {
    const q = quest(state);
    const fog = q.chamberSaves?.briefFog || {};
    return `<section class="stage-room brief-fog-room">
      <button type="button" class="stage-close" data-close-stage aria-label="Close Brief Fog">×</button>
      <span class="scene-label">Brief Fog · Question-Unpacking Chamber</span>
      <div class="stage-character stage-character-brief" aria-label="Player character" role="img"></div>
      <button type="button" class="flow-hotspot hotspot-parchment" data-hotspot-label="Parchment">Task parchment</button>
      <button type="button" class="flow-hotspot hotspot-fog" data-hotspot-label="Fog" data-mini="Brief Fog|Split the task into chunks and decide what each part does.">Fog patches</button>
      <button type="button" class="flow-hotspot hotspot-eyes" data-hotspot-label="Hidden wording" data-mini="Hidden wording|Watch for command words, keywords, scope, limits, source rules, and marking clues.">Hidden wording</button>
      <button type="button" class="flow-hotspot hotspot-brief-flag" data-hotspot-label="Flags" data-open-flags>Flags</button>
      <button type="button" class="flow-hotspot hotspot-brief-loot" data-hotspot-label="Missed loot" data-open-flags>Missed loot</button>
      <button type="button" class="flow-hotspot hotspot-forward" data-hotspot-label="Forward" data-mini="Route forward|Clear Brief Fog after the chunk workflow is complete.">Route forward</button>
      <article class="stage-card">
        <h2>Brief Fog</h2>
        <p><strong>Task:</strong> ${esc(fog.rawTaskText || "Study Skills Trial practice task")}</p>
        <p>Use the task parchment/chunk workflow to unpack the question.</p>
        <p><strong>Progress:</strong> ${esc(progressLabel(q))}</p>
      </article>
    </section>`;
  }

  function enterCaveBase(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    const q = quest(state);
    state.caveBase.lastVisitedAt = now();
    q.currentRouteLocation = "cave_base";
    q.taskMapOpen = false;
    q.questBoardOpen = false;
    q.caveBaseOpen = true;
    q.currentChamberId = "brief-fog";
    q.taskMapSummary.currentChamber = "Brief Fog / Question-Unpacking Chamber";
    q.taskMapSummary.progress = progressLabel(q);
    q.taskMapSummary.nextAction = "Continue to Brief Fog / Question-Unpacking Chamber";
    q.progressLog.unshift({ id: `log-${Date.now()}`, timestamp: now(), action: "enter-cave-base", summary: "Entered Cave Base from Task Map threshold." });
    saveState(state);
    openStage(caveBaseMarkup(state));
  }

  function continueQuest(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    const q = quest(state);
    q.currentRouteLocation = "working_chamber";
    q.caveBaseOpen = false;
    q.currentChamberId = "brief-fog";
    q.taskMapSummary.currentChamber = "Brief Fog / Question-Unpacking Chamber";
    q.taskMapSummary.nextAction = "Unpack the task and guidance";
    q.progressLog.unshift({ id: `log-${Date.now()}`, timestamp: now(), action: "continue-brief-fog", summary: "Opened Brief Fog from Cave Base." });
    saveState(state);
    openStage(briefFogMarkup(state));
  }

  document.addEventListener("click", (event) => {
    const enter = event.target.closest("[data-enter-cave-base]");
    if (enter) return enterCaveBase(event);

    const cont = event.target.closest("[data-continue-quest]");
    if (cont) return continueQuest(event);

    const close = event.target.closest("[data-close-stage]");
    if (close) {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeStage();
      return;
    }

    const map = event.target.closest("[data-open-task-map]");
    if (map && document.getElementById("stage-scene")?.hidden === false) {
      event.preventDefault();
      event.stopImmediatePropagation();
      openMapPanel();
    }
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    updateHud(loadState());
  });
})();
