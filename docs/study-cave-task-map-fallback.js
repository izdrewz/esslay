(() => {
  const SAVE_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";
  const SAMPLE = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  const MAX_TASK_TEXT = 12000;
  const MAX_CHUNK_TEXT = 3000;
  const MAX_SAVED_CHUNKS = 80;
  const MAX_RENDERED_CHUNKS = 40;

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

  function safeText(value, fallback = "") {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return fallback;
    try { return String(value); } catch { return fallback; }
  }

  function capText(value, max) {
    const text = safeText(value);
    return text.length > max ? text.slice(0, max) : text;
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
      clearedAt: null,
      safetyWarnings: []
    };
  }

  function normaliseArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normaliseChunk(chunk, index) {
    const source = chunk && typeof chunk === "object" ? chunk : {};
    const fallbackText = `Recovered chunk ${index + 1} — original saved text was missing or unreadable.`;
    const originalText = capText(safeText(source.originalText || source.text || source.wording, fallbackText), MAX_CHUNK_TEXT) || fallbackText;
    return {
      ...source,
      id: safeText(source.id, id("chunk")),
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : index,
      originalText,
      type: safeText(source.type, "Unknown"),
      state: safeText(source.state, "Not started"),
      createdAt: safeText(source.createdAt, new Date().toISOString()),
      updatedAt: safeText(source.updatedAt, new Date().toISOString())
    };
  }

  function sanitiseBriefFog(fog) {
    const safeFog = { ...blankFog(), ...(fog && typeof fog === "object" ? fog : {}) };
    const warnings = [];

    const rawTaskText = safeText(safeFog.rawTaskText, SAMPLE);
    if (rawTaskText.length > MAX_TASK_TEXT) warnings.push(`Task text was very large and has been capped to ${MAX_TASK_TEXT} characters for safe rendering.`);
    safeFog.rawTaskText = capText(rawTaskText || SAMPLE, MAX_TASK_TEXT);
    safeFog.taskTitle = capText(safeText(safeFog.taskTitle, "Study Skills Trial"), 180) || "Study Skills Trial";
    safeFog.assessmentType = capText(safeText(safeFog.assessmentType, "practice task"), 180) || "practice task";

    const originalChunks = normaliseArray(safeFog.chunks);
    if (!Array.isArray(safeFog.chunks)) warnings.push("Saved chunks were not in the expected format, so the chunk list was reset safely.");
    if (originalChunks.length > MAX_SAVED_CHUNKS) warnings.push(`Saved chunks were capped from ${originalChunks.length} to ${MAX_SAVED_CHUNKS} for safe rendering.`);
    safeFog.chunks = originalChunks.slice(0, MAX_SAVED_CHUNKS).map(normaliseChunk);

    safeFog.highlights = normaliseArray(safeFog.highlights);
    safeFog.notes = normaliseArray(safeFog.notes);
    safeFog.dismissed = normaliseArray(safeFog.dismissed);
    safeFog.flags = normaliseArray(safeFog.flags);
    safeFog.missedLoot = normaliseArray(safeFog.missedLoot);
    safeFog.outputCards = { ...blankFog().outputCards, ...(safeFog.outputCards && typeof safeFog.outputCards === "object" ? safeFog.outputCards : {}) };
    safeFog.safetyWarnings = warnings;
    return safeFog;
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
    const q = state.quests[QUEST_ID];
    q.completedChambers = normaliseArray(q.completedChambers);
    q.unlockedChambers = normaliseArray(q.unlockedChambers).length ? q.unlockedChambers : ["cave-base", "brief-fog"];
    q.flags = normaliseArray(q.flags);
    q.missedLoot = normaliseArray(q.missedLoot);
    q.briefFog = sanitiseBriefFog(q.briefFog);
    return state;
  }

  function saveState(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      const q = quest(state);
      q.briefFog = sanitiseBriefFog(q.briefFog);
      q.briefFog.chunks = q.briefFog.chunks.slice(0, Math.min(25, MAX_RENDERED_CHUNKS));
      q.briefFog.rawTaskText = capText(q.briefFog.rawTaskText, 6000);
      q.briefFog.safetyWarnings = [...normaliseArray(q.briefFog.safetyWarnings), "The saved Brief Fog data was too large for localStorage, so it was reduced before saving."];
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        return true;
      } catch {
        return false;
      }
    }
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
    const clean = capText(text || SAMPLE, MAX_TASK_TEXT).trim();
    const units = clean.split(/\n+/).filter(Boolean).length > 1 ? clean.split(/\n+/).filter(Boolean) : clean.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).filter(Boolean);
    return units.slice(0, MAX_SAVED_CHUNKS).map((unit, index) => ({
      id: id("chunk"),
      order: index,
      originalText: capText(unit.replace(/^[-*•\d.)\s]+/, "").trim(), MAX_CHUNK_TEXT),
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

  function safetyNotice(f) {
    if (!normaliseArray(f.safetyWarnings).length) return "";
    return `<section class="warning-list"><h3>Saved-data safety warning</h3><ul>${f.safetyWarnings.map((warning) => `<li>${esc(warning)}</li>`).join("")}</ul></section>`;
  }

  function taskBriefDrawer(state, saveFailed = false) {
    const f = fog(state);
    const renderedChunks = f.chunks.slice(0, MAX_RENDERED_CHUNKS);
    const hiddenCount = Math.max(0, f.chunks.length - renderedChunks.length);
    const chunks = renderedChunks.length ? `<ol class="chunk-list">${renderedChunks.map((chunk, index) => { const text = safeText(chunk.originalText, `Recovered chunk ${index + 1}`); return `<li><button type="button" data-open-chunk="${index}">${esc(text.slice(0, 70))}${text.length > 70 ? "…" : ""}</button> <small>${esc(chunk.state || "Not started")}</small></li>`; }).join("")}</ol>${hiddenCount ? `<p>${hiddenCount} more chunks are hidden for safe rendering. Use Suggest chunks to rebuild the list from the task text.</p>` : ""}` : `<p>No chunks yet.</p>`;
    return `<aside class="scene-drawer wide-drawer emergency-task-drawer"><button type="button" class="drawer-close" data-close-emergency-task>×</button><h2>Task Brief</h2>${saveFailed ? `<section class="warning-list"><h3>Save failed</h3><p>The saved Brief Fog data is still too large or blocked by the browser. Use Reset Brief Fog save, then reopen the chamber.</p></section>` : ""}${safetyNotice(f)}<p>Paste or adjust the task, question, brief, guidance, or marking notes. Fog patches are created from this text when the quest starts.</p><form data-emergency-task-form><label>Task title<input name="taskTitle" value="${esc(f.taskTitle)}"></label><label>Assessment type<input name="assessmentType" value="${esc(f.assessmentType)}"></label><label>Paste task / question / guidance<textarea name="rawTaskText" rows="7">${esc(f.rawTaskText)}</textarea></label><div class="drawer-actions"><button data-emergency-save-task type="button">Save task brief</button><button data-emergency-suggest-chunks type="button">Suggest chunks</button><button data-reset-brief-fog-save type="button">Reset Brief Fog save</button></div></form><h3>Chunk list</h3>${chunks}</aside>`;
  }

  function openTaskBrief(event, saveFailed = false) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const room = document.querySelector("#stage-scene .brief-fog-room");
    if (!room) return;
    const state = loadState();
    room.querySelectorAll(".emergency-task-drawer").forEach((drawer) => drawer.remove());
    room.insertAdjacentHTML("beforeend", taskBriefDrawer(state, saveFailed));
  }

  function saveTaskFromEmergencyDrawer(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const form = event.target.closest("form");
    if (!form) return;
    const data = new FormData(form);
    const state = loadState();
    const f = fog(state);
    f.taskTitle = capText(data.get("taskTitle") || f.taskTitle, 180);
    f.assessmentType = capText(data.get("assessmentType") || f.assessmentType, 180);
    f.rawTaskText = capText(data.get("rawTaskText") || f.rawTaskText, MAX_TASK_TEXT);
    if (event.target.closest("[data-emergency-suggest-chunks]")) {
      f.chunks = splitText(f.rawTaskText);
      f.highlights = [];
      f.notes = [];
      f.dismissed = [];
      f.outputCards = blankFog().outputCards;
      f.safetyWarnings = [];
    }
    const saved = saveState(state);
    openTaskBrief(event, !saved);
  }

  function resetBriefFogSave(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const state = loadState();
    quest(state).briefFog = blankFog();
    const saved = saveState(state);
    openTaskBrief(event, !saved);
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
      if (event.target.closest("[data-reset-brief-fog-save]")) return resetBriefFogSave(event);
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