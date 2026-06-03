(() => {
  const KEY = "esslay-study-cave-save-v02";
  const OLD_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";
  const TOTAL = 7;
  const SAMPLE = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  const MAX_TASK_TEXT = 9000;
  const MAX_CHUNKS = 8;
  const MAX_CHUNK_TEXT = 1200;
  const resolvedStates = ["Fully unpacked", "Flagged for later", "Parked as missed loot"];

  const now = () => new Date().toISOString();
  const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const cap = (value, max) => String(value ?? "").slice(0, max);
  const preview = (value, max = 72) => {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max)}…` : text || "Untitled chunk";
  };
  const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  function freshState() {
    return {
      version: "0.2-stable-brief-fog",
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
          nextAction: "Enter Cave Base",
          briefFog: {
            taskTitle: "Study Skills Trial",
            assessmentType: "practice task",
            rawTaskText: SAMPLE,
            chunks: [],
            notes: [],
            status: "unlocked"
          },
          updatedAt: now()
        }
      },
      lastSavedAt: now()
    };
  }

  function cleanChunk(chunk, index) {
    const safe = chunk && typeof chunk === "object" ? chunk : {};
    return {
      id: cap(safe.id || id("chunk"), 80),
      order: Number.isFinite(Number(safe.order)) ? Number(safe.order) : index,
      originalText: cap(safe.originalText || safe.text || `Chunk ${index + 1}`, MAX_CHUNK_TEXT),
      state: resolvedStates.includes(safe.state) || safe.state === "In progress" ? safe.state : "Not started",
      plain: cap(safe.plain || "", 1200),
      action: cap(safe.action || "", 1200),
      updatedAt: safe.updatedAt || now()
    };
  }

  function load() {
    let stored = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw && raw.length < 80000) stored = JSON.parse(raw);
    } catch {
      stored = null;
    }

    const base = freshState();
    const save = stored && typeof stored === "object" ? { ...base, ...stored } : base;
    save.quests = save.quests && typeof save.quests === "object" ? save.quests : base.quests;
    const quest = save.quests[QUEST_ID] && typeof save.quests[QUEST_ID] === "object" ? { ...base.quests[QUEST_ID], ...save.quests[QUEST_ID] } : base.quests[QUEST_ID];
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) && quest.unlockedChambers.length ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.flags = Array.isArray(quest.flags) ? quest.flags.slice(0, 30) : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot.slice(0, 30) : [];
    quest.briefFog = quest.briefFog && typeof quest.briefFog === "object" ? { ...base.quests[QUEST_ID].briefFog, ...quest.briefFog } : base.quests[QUEST_ID].briefFog;
    quest.briefFog.taskTitle = cap(quest.briefFog.taskTitle || "Study Skills Trial", 160);
    quest.briefFog.assessmentType = cap(quest.briefFog.assessmentType || "practice task", 160);
    quest.briefFog.rawTaskText = cap(quest.briefFog.rawTaskText || SAMPLE, MAX_TASK_TEXT);
    quest.briefFog.chunks = Array.isArray(quest.briefFog.chunks) ? quest.briefFog.chunks.slice(0, MAX_CHUNKS).map(cleanChunk) : [];
    quest.briefFog.notes = Array.isArray(quest.briefFog.notes) ? quest.briefFog.notes.slice(0, 30) : [];
    save.quests[QUEST_ID] = quest;
    return save;
  }

  function saveState(save) {
    const quest = save.quests[QUEST_ID];
    save.lastSavedAt = now();
    quest.updatedAt = save.lastSavedAt;
    try {
      localStorage.setItem(KEY, JSON.stringify(save));
      window.__esslayStorageWarning = "";
    } catch {
      window.__esslayStorageWarning = "This browser could not save Study Cave progress. Reset the Brief Fog save if this keeps happening.";
    }
    updateStaticQuestCard(save);
  }

  const quest = (save) => save.quests[QUEST_ID];
  const fog = (save) => quest(save).briefFog;
  const progressLabel = (q) => `${q.completedChambers.length} / ${TOTAL} chambers complete`;
  const chamberLabel = (idValue) => idValue === "source-mine" ? "Source Mine" : idValue === "brief-fog" ? "Brief Fog / Question-Unpacking Chamber" : "Cave Base";

  function updateStaticQuestCard(save) {
    const q = quest(save);
    document.querySelectorAll("[data-flow-progress]").forEach((node) => { node.textContent = `${q.completedChambers.length} / ${TOTAL}`; });
    const card = document.querySelector('[data-open-quest="study-skills-trial"]')?.closest(".quest-board-card");
    if (!card) return;
    const task = card.querySelector(".quest-card-task");
    const status = card.querySelector(".quest-card-status");
    const button = card.querySelector('[data-open-quest="study-skills-trial"]');
    if (task) task.textContent = `Neutral practice task. Current chamber: ${chamberLabel(q.currentChamberId)}. Progress: ${progressLabel(q)}.`;
    if (status) status.innerHTML = `<strong>Status:</strong> ${q.completedChambers.includes("brief-fog") ? "In progress" : "Not started"} · <strong>Flags:</strong> ${q.flags.length} · <strong>Missed loot:</strong> ${q.missedLoot.length}`;
    if (button) button.textContent = q.completedChambers.includes("brief-fog") ? "Continue Test Quest" : "Open Test Quest";
  }

  function stage() { return document.getElementById("stage-scene"); }
  function openStage(markup) {
    document.querySelectorAll("details[open]").forEach((details) => { details.open = false; });
    const node = stage();
    if (!node) return;
    node.innerHTML = markup;
    node.hidden = false;
  }
  function closeStage() {
    const node = stage();
    if (!node) return;
    node.innerHTML = "";
    node.hidden = true;
  }
  function drawer(title, body, wide = false, extraClass = "") {
    return `<aside class="scene-drawer ${wide ? "wide-drawer" : "compact-drawer"} ${extraClass}"><button type="button" class="drawer-close" data-close-drawer>×</button><h2>${esc(title)}</h2>${body}</aside>`;
  }
  function storageWarning() {
    return window.__esslayStorageWarning ? `<p class="warning-list"><strong>Save warning:</strong> ${esc(window.__esslayStorageWarning)}</p>` : "";
  }

  function routeCards(q) {
    const current = q.completedChambers.includes("brief-fog") ? "source-mine" : "brief-fog";
    const nodes = [
      ["cave-base", "Cave Base"],
      ["brief-fog", "Brief Fog"],
      ["source-mine", "Source Mine"],
      ["quote-bank", "Quote Bank"],
      ["draft-route", "Draft Route"],
      ["dirty-draft", "Dirty Draft"],
      ["coherence-boss", "Coherence Boss"]
    ];
    return nodes.map(([idValue, label]) => {
      const complete = q.completedChambers.includes(idValue);
      const unlocked = q.unlockedChambers.includes(idValue);
      const active = idValue === current;
      const status = complete ? "Complete" : active ? "Current" : unlocked ? "Unlocked" : "Locked";
      return `<article class="route-node-card ${complete ? "complete" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "current" : ""}"><strong>${esc(label)}</strong><p>${esc(status)}</p></article>`;
    }).join("");
  }

  function renderTaskMap(save) {
    const q = quest(save);
    const current = q.completedChambers.includes("brief-fog") ? "source-mine" : "brief-fog";
    q.currentChamberId = current;
    const html = `<section class="task-map-grid"><article class="flow-card"><p class="eyebrow">Selected task becomes the map</p><h2>${esc(q.questTitle)}</h2><p><strong>Current chamber:</strong> ${esc(chamberLabel(current))}</p><p><strong>Progress:</strong> ${esc(progressLabel(q))}</p><p><strong>Completed chambers:</strong> ${esc(q.completedChambers.join(", ") || "none yet")}</p><p><strong>Open flags:</strong> ${q.flags.length}</p><p><strong>Missed loot:</strong> ${q.missedLoot.length}</p><div class="flow-actions"><button type="button" data-enter-cave-base>Enter Cave Base</button><button type="button" class="secondary-button" data-back-quest-board>Back to Quest Board</button></div></article><article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">${routeCards(q)}</div></article></section>`;
    document.querySelectorAll("[data-task-map]").forEach((mount) => { mount.innerHTML = html; });
  }

  function caveBase(save, activeDrawer = "") {
    const q = quest(save);
    return `<section class="stage-room cave-base-room"><button class="stage-close" data-close-stage>×</button><span class="scene-label">Cave Base · safe hub</span><div class="stage-character stage-character-base"></div><button class="flow-hotspot hotspot-chest" data-hotspot-label="Outfit chest" data-base-panel="outfit">Outfit chest</button><button class="flow-hotspot hotspot-ledger" data-hotspot-label="Journal" data-base-panel="ledger">Journal</button><button class="flow-hotspot hotspot-shelf" data-hotspot-label="Completed" data-base-panel="completed">Completed</button><button class="flow-hotspot hotspot-flags" data-hotspot-label="Flags" data-base-panel="flags">Flags</button><button class="flow-hotspot hotspot-continue" data-hotspot-label="Continue" data-continue-quest>Continue</button><button class="flow-hotspot hotspot-return" data-hotspot-label="Task map" data-open-task-map>Task map</button><article class="stage-card"><h2>Cave Base</h2><p><strong>Active quest:</strong> ${esc(q.questTitle)}</p><p><strong>Current chamber:</strong> ${esc(chamberLabel(q.currentChamberId))}</p><p><strong>Progress:</strong> ${esc(progressLabel(q))}</p><p><strong>Completed:</strong> ${esc(q.completedChambers.join(", ") || "none yet")}</p><p><strong>Flags:</strong> ${q.flags.length} · <strong>Missed loot:</strong> ${q.missedLoot.length}</p>${storageWarning()}</article>${activeDrawer}</section>`;
  }

  function basePanel(save, type) {
    const q = quest(save);
    if (type === "outfit") return drawer("Outfit Chest", `<p>Study Cave outfit changing will live here. For v0.1 this is a placeholder and does not change progress.</p>`);
    if (type === "ledger") return drawer("Cave Journal / Route Ledger", `<p><strong>Current:</strong> ${esc(chamberLabel(q.currentChamberId))}</p><p><strong>Progress:</strong> ${esc(progressLabel(q))}</p><p><strong>Unlocked:</strong> ${esc(q.unlockedChambers.join(", "))}</p>`);
    if (type === "completed") return drawer("Completed Chamber Summary", q.completedChambers.includes("brief-fog") ? `<p>Brief Fog is completed and Source Mine is unlocked.</p><button type="button" data-review-brief-fog>Review Brief Fog</button>` : `<p>No chambers completed yet.</p>`);
    return drawer("Flags / Missed Loot", `<h3>Flags</h3>${q.flags.length ? `<ul>${q.flags.map((flag) => `<li>${esc(flag.note)}</li>`).join("")}</ul>` : `<p>None yet.</p>`}<h3>Missed loot</h3>${q.missedLoot.length ? `<ul>${q.missedLoot.map((item) => `<li>${esc(item.itemMissed)}</li>`).join("")}</ul>` : `<p>None yet.</p>`}`);
  }

  function patchClass(f, index) {
    const chunk = f.chunks[index];
    if (!chunk) return "empty";
    if (chunk.state === "Fully unpacked") return "cleared";
    if (chunk.state === "Flagged for later") return "flagged";
    if (chunk.state === "Parked as missed loot") return "missed";
    if (chunk.state === "In progress") return "processing";
    return "unprocessed";
  }

  function briefFog(save, activeDrawer = "", activeIndex = null) {
    const f = fog(save);
    const done = f.chunks.filter((chunk) => resolvedStates.includes(chunk.state)).length;
    const activeClass = activeIndex !== null ? "cutscene-active" : "";
    const patch = (index) => `<span class="fog-patch visual-fog-patch fog-patch-${index + 1} ${patchClass(f, index)} ${activeIndex === index ? "cutscene-target" : ""}" aria-hidden="true"></span>`;
    return `<section class="stage-room brief-fog-room ${activeClass}"><button class="stage-close" data-return-cave-base>×</button><span class="scene-label">Brief Fog · visual-novel task unpacking</span><div class="stage-character stage-character-brief"></div><span class="light-beam ${activeIndex !== null ? "active" : ""}"></span><button class="flow-hotspot hotspot-parchment" data-hotspot-label="Task Brief" data-brief-panel="task">Task</button>${patch(0)}${patch(1)}${patch(2)}${patch(3)}<button class="flow-hotspot hotspot-brief-flag" data-hotspot-label="Flags" data-brief-panel="flags">Flags</button><button class="flow-hotspot hotspot-brief-loot" data-hotspot-label="Missed loot" data-brief-panel="flags">Loot</button><button class="flow-hotspot hotspot-forward ${canFinish(f) ? "ready" : "locked"}" data-hotspot-label="Route forward" data-brief-panel="summary">Route</button><article class="stage-card"><h2>Brief Fog</h2><p><strong>Chunks:</strong> ${f.chunks.length} · <strong>Resolved:</strong> ${done}/${f.chunks.length}</p><p>This chamber is for understanding the task, not writing the answer.</p><div class="stage-card-actions"><button type="button" data-brief-panel="task">Task Brief</button><button type="button" data-next-chunk>${f.chunks.length ? "Work next chunk" : "Start task"}</button><button type="button" data-brief-panel="summary">Summary</button></div>${storageWarning()}</article>${activeDrawer}</section>`;
  }

  function taskPanel(save) {
    const f = fog(save);
    const chunks = f.chunks.length ? `<ol class="chunk-list">${f.chunks.map((chunk, index) => `<li><button type="button" data-open-chunk="${index}">${esc(preview(chunk.originalText))}</button> <small>${esc(chunk.state)}</small></li>`).join("")}</ol>` : `<p>No fog chunks yet. Paste the task, then click Suggest chunks.</p>`;
    return drawer("Task Brief", `<p>This is the stable v0.1 Task Brief drawer. It uses a fresh safe save key and does not load the old broken Brief Fog save.</p><form data-task-form><label>Task title<input name="taskTitle" value="${esc(f.taskTitle)}"></label><label>Assessment type<input name="assessmentType" value="${esc(f.assessmentType)}"></label><label>Paste task / question / guidance<textarea name="rawTaskText" rows="7">${esc(f.rawTaskText)}</textarea></label><div class="drawer-actions"><button data-save-task type="button">Save task brief</button><button data-suggest-chunks type="button">Suggest chunks</button><button data-reset-brief-fog type="button">Reset stable Brief Fog save</button></div></form><h3>Chunk list</h3>${chunks}`, true);
  }

  function chunkPanel(save, index) {
    const f = fog(save);
    const chunk = f.chunks[index];
    if (!chunk) return taskPanel(save);
    return drawer(`Chunk ${index + 1}`, `<form data-chunk-form data-index="${index}" class="chunk-drawer"><p class="drawer-kicker">Visual-novel state target: fog patch ${index + 1}</p><label>Original wording<textarea name="originalText" rows="4">${esc(chunk.originalText)}</textarea></label><label>Plain meaning<textarea name="plain" rows="3">${esc(chunk.plain || "")}</textarea></label><label>Action this creates<textarea name="action" rows="3">${esc(chunk.action || "")}</textarea></label><div class="drawer-actions sticky-actions"><button data-save-chunk type="button">Save chunk</button><button data-mark-full type="button">Mark unpacked</button><button data-add-flag type="button">Flag</button><button data-add-missed type="button">Park as missed loot</button><button data-open-chunk="${Math.max(0, index - 1)}" type="button">Previous</button><button data-open-chunk="${Math.min(f.chunks.length - 1, index + 1)}" type="button">Next</button></div></form>`, true, "chunk-action-drawer");
  }

  function summaryPanel(save, cleared = false) {
    const q = quest(save);
    const f = fog(save);
    const done = f.chunks.filter((chunk) => resolvedStates.includes(chunk.state)).length;
    const ready = canFinish(f);
    return drawer(cleared ? "Brief Fog Cleared" : "Brief Fog Summary", `${cleared ? `<p>Source Mine is now unlocked. Progress updated to ${esc(progressLabel(q))}.</p>` : `<p>Resolved chunks: ${done}/${f.chunks.length}</p>`}<dl class="summary-grid"><div><dt>Task title</dt><dd>${esc(f.taskTitle)}</dd></div><div><dt>Assessment type</dt><dd>${esc(f.assessmentType)}</dd></div><div><dt>Chunks</dt><dd>${f.chunks.length}</dd></div><div><dt>Flags</dt><dd>${q.flags.length}</dd></div><div><dt>Missed loot</dt><dd>${q.missedLoot.length}</dd></div></dl>${ready ? `<p class="success-note">Ready to clear Brief Fog.</p>` : `<section class="warning-list"><p>Create chunks and mark each one unpacked, flagged, or parked before finishing.</p></section>`}<div class="drawer-actions"><button data-finish-brief-fog type="button" ${ready ? "" : "disabled"}>Finish Brief Fog</button><button data-export="txt" type="button">Export .txt</button><button data-return-cave-base type="button">Stay in Cave Base</button></div>`, true);
  }

  function flagsPanel(save) {
    return basePanel(save, "flags");
  }

  function sourceMine(save) {
    const q = quest(save);
    return `<section class="stage-room source-mine-room brief-fog-room"><button class="stage-close" data-return-cave-base>×</button><span class="scene-label">Source Mine · placeholder</span><article class="stage-card"><h2>Source Mine</h2><p>This chamber will hold source gathering, source notes, quote preparation, and source-to-task links. For v0.1 this is a placeholder.</p><p><strong>Progress:</strong> ${esc(progressLabel(q))}</p><button data-return-cave-base>Return to Cave Base</button></article></section>`;
  }

  function splitText(text) {
    const clean = cap(text || SAMPLE, MAX_TASK_TEXT).trim();
    const lines = clean.split(/\n+/).map((part) => part.trim()).filter(Boolean);
    const sentences = clean.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
    const units = (lines.length > 1 ? lines : sentences).slice(0, MAX_CHUNKS);
    const useful = units.length ? units : [clean || SAMPLE];
    return useful.map((unit, index) => cleanChunk({ id: id("chunk"), order: index, originalText: unit, state: "Not started" }, index));
  }

  function canFinish(f) {
    return Boolean(f.chunks.length && f.chunks.every((chunk) => resolvedStates.includes(chunk.state)));
  }

  function enterBase(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const save = load();
    const q = quest(save);
    q.currentRouteLocation = "cave_base";
    q.currentChamberId = q.completedChambers.includes("brief-fog") ? "source-mine" : "brief-fog";
    q.nextAction = q.currentChamberId === "source-mine" ? "Continue to Source Mine" : "Continue to Brief Fog";
    saveState(save);
    openStage(caveBase(save));
  }

  function continueRoute(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const save = load();
    const q = quest(save);
    q.currentRouteLocation = "working_chamber";
    saveState(save);
    openStage(q.currentChamberId === "source-mine" ? sourceMine(save) : briefFog(save));
  }

  function openTaskMap(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    const save = load();
    quest(save).currentRouteLocation = "task_map_threshold";
    renderTaskMap(save);
    saveState(save);
    closeStage();
    const panel = document.getElementById("map-board-panel");
    if (panel) panel.open = true;
  }

  function openQuestBoard(event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    closeStage();
    const panel = document.getElementById("quest-board-panel");
    if (panel) panel.open = true;
  }

  function resetBriefFog() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(OLD_KEY);
    window.__esslayStorageWarning = "";
    const save = freshState();
    saveState(save);
    openStage(caveBase(save, drawer("Brief Fog save reset", `<p>The old and stable browser Brief Fog saves were cleared. Continue to Brief Fog and open Task Brief again.</p><button type="button" data-continue-quest>Continue to Brief Fog</button>`, true)));
  }

  function saveTask(event) {
    const form = event.target.closest("form");
    if (!form) return;
    const data = new FormData(form);
    const save = load();
    const f = fog(save);
    f.taskTitle = cap(data.get("taskTitle") || f.taskTitle, 160);
    f.assessmentType = cap(data.get("assessmentType") || f.assessmentType, 160);
    f.rawTaskText = cap(data.get("rawTaskText") || f.rawTaskText, MAX_TASK_TEXT);
    if (event.target.closest("[data-suggest-chunks]")) f.chunks = splitText(f.rawTaskText);
    saveState(save);
    openStage(briefFog(save, taskPanel(save)));
  }

  function saveChunk(event, action) {
    const form = event.target.closest("form[data-chunk-form]");
    if (!form) return;
    const save = load();
    const f = fog(save);
    const q = quest(save);
    const index = Number(form.dataset.index);
    const chunk = f.chunks[index];
    if (!chunk) return openStage(briefFog(save, taskPanel(save)));
    const data = new FormData(form);
    chunk.originalText = cap(data.get("originalText") || chunk.originalText, MAX_CHUNK_TEXT);
    chunk.plain = cap(data.get("plain") || chunk.plain || "", 1200);
    chunk.action = cap(data.get("action") || chunk.action || "", 1200);
    if (action === "full") chunk.state = "Fully unpacked";
    else if (action === "flag") {
      chunk.state = "Flagged for later";
      q.flags.push({ id: id("flag"), chunkId: chunk.id, note: chunk.plain || preview(chunk.originalText), createdAt: now() });
    } else if (action === "missed") {
      chunk.state = "Parked as missed loot";
      q.missedLoot.push({ id: id("missed"), chunkId: chunk.id, itemMissed: chunk.action || preview(chunk.originalText), createdAt: now() });
    } else if (chunk.state === "Not started") chunk.state = "In progress";
    chunk.updatedAt = now();
    saveState(save);
    openStage(briefFog(save, drawer("Chunk saved", `<p>Chunk ${index + 1} saved as <strong>${esc(chunk.state)}</strong>.</p><div class="drawer-actions"><button type="button" data-open-chunk="${index}">Reopen</button><button type="button" data-next-chunk>Next chunk</button><button type="button" data-brief-panel="summary">Summary</button></div>`, true, "chunk-result-drawer"), index));
  }

  function finishBriefFog() {
    const save = load();
    const q = quest(save);
    if (!canFinish(fog(save))) return openStage(briefFog(save, summaryPanel(save)));
    q.completedChambers = Array.from(new Set([...q.completedChambers, "brief-fog"]));
    q.unlockedChambers = Array.from(new Set([...q.unlockedChambers, "source-mine"]));
    q.currentChamberId = "source-mine";
    q.currentRouteLocation = "cave_base";
    q.nextAction = "Continue to Source Mine";
    fog(save).status = "cleared";
    saveState(save);
    openStage(caveBase(save, summaryPanel(save, true)));
  }

  function exportText() {
    const save = load();
    const q = quest(save);
    const f = fog(save);
    const content = `Brief Fog Export\n\nQuest: ${q.questTitle}\nTask: ${f.taskTitle}\nAssessment: ${f.assessmentType}\n\nRaw task\n${f.rawTaskText}\n\nChunks\n${f.chunks.map((chunk, index) => `${index + 1}. ${chunk.originalText}\nState: ${chunk.state}\nPlain meaning: ${chunk.plain || ""}\nAction: ${chunk.action || ""}`).join("\n\n")}`;
    return drawer("Export .txt", `<p>Copy or download the current Brief Fog notes.</p><a class="download-link" download="brief-fog-export.txt" href="data:text/plain;charset=utf-8,${encodeURIComponent(content)}">Download brief-fog-export.txt</a><textarea rows="12" readonly>${esc(content)}</textarea>`, true);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-quest-board]")) return openQuestBoard(event);
    if (event.target.closest('[data-open-quest="study-skills-trial"]')) return openTaskMap(event);
    if (event.target.closest("[data-open-task-map]")) return openTaskMap(event);
    if (event.target.closest("[data-back-quest-board]")) return openQuestBoard(event);
    if (event.target.closest("[data-enter-cave-base]")) return enterBase(event);
    if (event.target.closest("[data-continue-quest]")) return continueRoute(event);
    if (event.target.closest("[data-close-stage]")) { event.preventDefault(); event.stopImmediatePropagation(); return closeStage(); }
    if (event.target.closest("[data-return-cave-base]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); quest(save).currentRouteLocation = "cave_base"; saveState(save); return openStage(caveBase(save)); }

    const baseButton = event.target.closest("[data-base-panel]");
    if (baseButton) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(caveBase(save, basePanel(save, baseButton.dataset.basePanel))); }

    const briefButton = event.target.closest("[data-brief-panel]");
    if (briefButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const save = load();
      const type = briefButton.dataset.briefPanel;
      return openStage(briefFog(save, type === "task" ? taskPanel(save) : type === "flags" ? flagsPanel(save) : summaryPanel(save)));
    }

    if (event.target.closest("[data-next-chunk]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const save = load();
      const f = fog(save);
      if (!f.chunks.length) return openStage(briefFog(save, taskPanel(save)));
      const index = Math.max(0, f.chunks.findIndex((chunk) => !resolvedStates.includes(chunk.state)));
      return openStage(briefFog(save, chunkPanel(save, index), index));
    }

    const openChunkButton = event.target.closest("[data-open-chunk]");
    if (openChunkButton) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); const index = Number(openChunkButton.dataset.openChunk); return openStage(briefFog(save, chunkPanel(save, index), index)); }

    if (event.target.closest("[data-close-drawer]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(quest(save).currentRouteLocation === "working_chamber" ? briefFog(save) : caveBase(save)); }
    if (event.target.closest("[data-reset-brief-fog]")) { event.preventDefault(); event.stopImmediatePropagation(); return resetBriefFog(); }
    if (event.target.closest("[data-save-task]") || event.target.closest("[data-suggest-chunks]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveTask(event); }
    if (event.target.closest("[data-save-chunk]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(event, "save"); }
    if (event.target.closest("[data-mark-full]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(event, "full"); }
    if (event.target.closest("[data-add-flag]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(event, "flag"); }
    if (event.target.closest("[data-add-missed]")) { event.preventDefault(); event.stopImmediatePropagation(); return saveChunk(event, "missed"); }
    if (event.target.closest("[data-finish-brief-fog]")) { event.preventDefault(); event.stopImmediatePropagation(); return finishBriefFog(); }
    if (event.target.closest("[data-export]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(briefFog(save, exportText())); }
    if (event.target.closest("[data-open-source-mine]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(sourceMine(save)); }
    if (event.target.closest("[data-review-brief-fog]")) { event.preventDefault(); event.stopImmediatePropagation(); const save = load(); return openStage(briefFog(save, summaryPanel(save))); }
  }, true);

  document.addEventListener("DOMContentLoaded", () => {
    const save = load();
    renderTaskMap(save);
    updateStaticQuestCard(save);
  });
})();
