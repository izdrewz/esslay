(() => {
  const SAVE_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";
  const SAMPLE = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";

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

  function id(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function blankFog() {
    return {
      taskTitle: "Study Skills Trial",
      assessmentType: "practice task",
      rawTaskText: SAMPLE,
      chunks: [],
      highlights: [],
      notes: [],
      dismissed: [],
      flags: [],
      missedLoot: [],
      outputCards: { commandWordCards: [], keywordCards: [], scopeLimitCards: [], sourceRequirementCards: [], taskDemandSummary: null },
      status: "unlocked",
      clearedAt: null
    };
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
            missedLoot: [],
            briefFog: blankFog()
          }
        }
      };
    }
    const quest = state.quests[QUEST_ID];
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.flags = Array.isArray(quest.flags) ? quest.flags : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot : [];
    quest.briefFog = { ...blankFog(), ...(quest.briefFog || {}) };
    quest.briefFog.chunks = Array.isArray(quest.briefFog.chunks) ? quest.briefFog.chunks : [];
    quest.briefFog.highlights = Array.isArray(quest.briefFog.highlights) ? quest.briefFog.highlights : [];
    quest.briefFog.notes = Array.isArray(quest.briefFog.notes) ? quest.briefFog.notes : [];
    quest.briefFog.dismissed = Array.isArray(quest.briefFog.dismissed) ? quest.briefFog.dismissed : [];
    quest.briefFog.flags = Array.isArray(quest.briefFog.flags) ? quest.briefFog.flags : [];
    quest.briefFog.missedLoot = Array.isArray(quest.briefFog.missedLoot) ? quest.briefFog.missedLoot : [];
    quest.briefFog.outputCards = { ...blankFog().outputCards, ...(quest.briefFog.outputCards || {}) };
    return state;
  }

  function saveState(state) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function quest(state) {
    return state.quests[QUEST_ID];
  }

  function fog(state) {
    return quest(state).briefFog;
  }

  function chamberLabel(chamberId) {
    if (chamberId === "source-mine") return "Source Mine";
    if (chamberId === "brief-fog") return "Brief Fog / Question-Unpacking Chamber";
    return "Cave Base";
  }

  function progressLabel(q) {
    return `${q.completedChambers.length} / 7 chambers complete`;
  }

  function splitText(text) {
    const clean = String(text || SAMPLE).trim();
    const units = clean.split(/\n+/).filter(Boolean).length > 1 ? clean.split(/\n+/).filter(Boolean) : clean.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean);
    return units.map((unit, index) => ({
      id: id("chunk"),
      order: index,
      originalText: unit.replace(/^[-*•\d.)\s]+/, "").trim(),
      type: /source|reference|reading/i.test(unit) ? "Source requirement" : /word|deadline|due/i.test(unit) ? "Word count / deadline instruction" : /write|explain|discuss|evaluate|compare|describe|analyse|identify/i.test(unit) ? "Task instruction" : "Guidance note",
      state: "Not started",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
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
    const node = (chamberId, label) => {
      const complete = q.completedChambers.includes(chamberId);
      const unlocked = q.unlockedChambers.includes(chamberId);
      const active = chamberId === current;
      const status = complete ? "Complete" : active ? "Current" : unlocked ? "Unlocked" : "Locked";
      return `<article class="route-node-card ${complete ? "complete" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "current" : ""}"><strong>${esc(label)}</strong><p>${esc(status)}</p></article>`;
    };
    const html = `<section class="task-map-grid"><article class="flow-card"><p class="eyebrow">Selected task becomes the map</p><h2>${esc(q.questTitle || "Study Skills Trial")}</h2><p><strong>Active quest:</strong> ${esc(q.questTitle || "Study Skills Trial")}</p><p><strong>Current chamber:</strong> ${esc(chamberLabel(current))}</p><p><strong>Progress:</strong> ${esc(progressLabel(q))}</p><p><strong>Completed chambers:</strong> ${esc(q.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${q.flags.length}</p><p><strong>Missed loot:</strong> ${q.missedLoot.length}</p><div class="flow-actions"><button type="button" data-enter-cave-base>Enter Cave Base</button><button type="button" class="secondary-button" data-back-quest-board>Back to Quest Board</button></div></article><article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">${route.map(([chamberId, label]) => node(chamberId, label)).join("")}</div></article></section>`;
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

  function taskBriefDrawer(state) {
    const f = fog(state);
    const chunks = f.chunks.length ? `<ol class="chunk-list">${f.chunks.map((chunk, index) => `<li><button type="button" data-open-chunk="${index}">${esc(chunk.originalText.slice(0, 70))}${chunk.originalText.length > 70 ? "…" : ""}</button> <small>${esc(chunk.state)}</small></li>`).join("")}</ol>` : `<p>No chunks yet.</p>`;
    return `<aside class="scene-drawer wide-drawer emergency-task-drawer"><button type="button" class="drawer-close" data-close-emergency-task>×</button><h2>Task Brief</h2><p>Paste or adjust the task, question, brief, guidance, or marking notes. Fog patches are created from this text when the quest starts.</p><form data-emergency-task-form><label>Task title<input name="taskTitle" value="${esc(f.taskTitle)}"></label><label>Assessment type<input name="assessmentType" value="${esc(f.assessmentType)}"></label><label>Paste task / question / guidance<textarea name="rawTaskText" rows="7">${esc(f.rawTaskText)}</textarea></label><div class="drawer-actions"><button data-emergency-save-task type="button">Save task brief</button><button data-emergency-suggest-chunks type="button">Suggest chunks</button><button data-add-chunk type="button">Add chunk manually</button></div></form><h3>Chunk list</h3>${chunks}</aside>`;
  }

  function openTaskBrief(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const room = document.querySelector("#stage-scene .brief-fog-room");
    if (!room) return;
    const state = loadState();
    room.querySelectorAll(".emergency-task-drawer").forEach((drawer) => drawer.remove());
    room.insertAdjacentHTML("beforeend", taskBriefDrawer(state));
  }

  function saveTaskFromEmergencyDrawer(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = event.target.closest("form");
    if (!form) return;
    const data = new FormData(form);
    const state = loadState();
    const f = fog(state);
    f.taskTitle = String(data.get("taskTitle") || f.taskTitle);
    f.assessmentType = String(data.get("assessmentType") || f.assessmentType);
    f.rawTaskText = String(data.get("rawTaskText") || f.rawTaskText);
    if (event.target.closest("[data-emergency-suggest-chunks]")) {
      f.chunks = splitText(f.rawTaskText);
      f.highlights = [];
      f.notes = [];
      f.dismissed = [];
      f.outputCards = blankFog().outputCards;
    }
    saveState(state);
    openTaskBrief(event);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderTaskMap(loadState());

    window.addEventListener("click", (event) => {
      const taskButton = event.target.closest('[data-brief-panel="task"]');
      if (taskButton) return openTaskBrief(event);
      if (event.target.closest("[data-close-emergency-task]")) {
        event.preventDefault();
        event.stopImmediatePropagation();
        event.target.closest(".emergency-task-drawer")?.remove();
        return;
      }
      if (event.target.closest("[data-emergency-save-task]") || event.target.closest("[data-emergency-suggest-chunks]")) return saveTaskFromEmergencyDrawer(event);
    }, true);

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