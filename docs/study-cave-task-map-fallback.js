(() => {
  const KEY = "esslay-study-cave-save-v02";
  const OLD_KEY = "esslay-study-cave-save-v01";
  const QUEST_ID = "study-skills-trial";
  const SAMPLE = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  const MAX_TASK_TEXT = 9000;
  const MAX_CHUNKS = 8;
  const MAX_CHUNK_TEXT = 1200;

  const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  const cap = (value, max) => String(value ?? "").slice(0, max);
  const now = () => new Date().toISOString();
  const id = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const preview = (value, max = 72) => {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    return text.length > max ? `${text.slice(0, max)}…` : text || "Untitled chunk";
  };

  function freshState() {
    return {
      version: "0.2-direct-task-brief-helper",
      activeQuestId: QUEST_ID,
      quests: {
        [QUEST_ID]: {
          questId: QUEST_ID,
          questTitle: "Study Skills Trial",
          currentRouteLocation: "working_chamber",
          currentChamberId: "brief-fog",
          completedChambers: [],
          unlockedChambers: ["cave-base", "brief-fog"],
          flags: [],
          missedLoot: [],
          briefFog: {
            taskTitle: "Study Skills Trial",
            assessmentType: "practice task",
            rawTaskText: SAMPLE,
            chunks: [],
            status: "unlocked"
          },
          updatedAt: now()
        }
      },
      lastSavedAt: now()
    };
  }

  function normaliseChunk(chunk, index) {
    const safe = chunk && typeof chunk === "object" ? chunk : {};
    return {
      id: cap(safe.id || id("chunk"), 80),
      order: Number.isFinite(Number(safe.order)) ? Number(safe.order) : index,
      originalText: cap(safe.originalText || safe.text || `Chunk ${index + 1}`, MAX_CHUNK_TEXT),
      state: cap(safe.state || "Not started", 80),
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
    quest.flags = Array.isArray(quest.flags) ? quest.flags.slice(0, 30) : [];
    quest.missedLoot = Array.isArray(quest.missedLoot) ? quest.missedLoot.slice(0, 30) : [];
    quest.completedChambers = Array.isArray(quest.completedChambers) ? quest.completedChambers : [];
    quest.unlockedChambers = Array.isArray(quest.unlockedChambers) && quest.unlockedChambers.length ? quest.unlockedChambers : ["cave-base", "brief-fog"];
    quest.briefFog = quest.briefFog && typeof quest.briefFog === "object" ? { ...base.quests[QUEST_ID].briefFog, ...quest.briefFog } : base.quests[QUEST_ID].briefFog;
    quest.briefFog.taskTitle = cap(quest.briefFog.taskTitle || "Study Skills Trial", 160);
    quest.briefFog.assessmentType = cap(quest.briefFog.assessmentType || "practice task", 160);
    quest.briefFog.rawTaskText = cap(quest.briefFog.rawTaskText || SAMPLE, MAX_TASK_TEXT);
    quest.briefFog.chunks = Array.isArray(quest.briefFog.chunks) ? quest.briefFog.chunks.slice(0, MAX_CHUNKS).map(normaliseChunk) : [];
    save.quests[QUEST_ID] = quest;
    return save;
  }

  function saveState(save) {
    save.lastSavedAt = now();
    save.quests[QUEST_ID].updatedAt = save.lastSavedAt;
    try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {}
  }

  const quest = (save) => save.quests[QUEST_ID];
  const fog = (save) => quest(save).briefFog;

  function splitText(text) {
    const clean = cap(text || SAMPLE, MAX_TASK_TEXT).trim();
    const lines = clean.split(/\n+/).map((part) => part.trim()).filter(Boolean);
    const sentences = clean.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
    const units = (lines.length > 1 ? lines : sentences).slice(0, MAX_CHUNKS);
    const useful = units.length ? units : [clean || SAMPLE];
    return useful.map((unit, index) => normaliseChunk({ id: id("chunk"), order: index, originalText: unit, state: "Not started" }, index));
  }

  function room() {
    return document.querySelector("#stage-scene .brief-fog-room");
  }

  function closeDirectDrawers() {
    room()?.querySelectorAll(".direct-task-brief-drawer, .direct-brief-controls").forEach((node) => node.remove());
  }

  function drawer(title, body) {
    return `<aside class="scene-drawer wide-drawer direct-task-brief-drawer" style="z-index:9999; right:18px; top:18px; bottom:auto; max-height:calc(100% - 36px); overflow:auto;"><button type="button" class="drawer-close" data-direct-close>×</button><h2>${esc(title)}</h2>${body}</aside>`;
  }

  function taskDrawer() {
    const save = load();
    const f = fog(save);
    const chunks = f.chunks.length ? `<ol class="chunk-list">${f.chunks.map((chunk, index) => `<li><button type="button" data-direct-open-chunk="${index}">${esc(preview(chunk.originalText))}</button> <small>${esc(chunk.state)}</small></li>`).join("")}</ol>` : `<p>No chunks yet. Paste the brief, then click Suggest chunks.</p>`;
    return drawer("Task Brief", `<p>This is the direct Task Brief drawer for the original cave page. It bypasses the broken transparent hotspot layer.</p><form data-direct-task-form><label>Task title<input name="taskTitle" value="${esc(f.taskTitle)}"></label><label>Assessment type<input name="assessmentType" value="${esc(f.assessmentType)}"></label><label>Paste task / question / guidance<textarea name="rawTaskText" rows="7">${esc(f.rawTaskText)}</textarea></label><div class="drawer-actions"><button type="button" data-direct-save-task>Save task brief</button><button type="button" data-direct-suggest-chunks>Suggest chunks</button><button type="button" data-direct-reset-save>Reset Brief Fog save</button></div></form><h3>Chunk list</h3>${chunks}`);
  }

  function chunkDrawer(index) {
    const save = load();
    const f = fog(save);
    const chunk = f.chunks[index];
    if (!chunk) return taskDrawer();
    return drawer(`Chunk ${index + 1}`, `<form data-direct-chunk-form data-index="${index}"><label>Original wording<textarea name="originalText" rows="4">${esc(chunk.originalText)}</textarea></label><label>Plain meaning<textarea name="plain" rows="3">${esc(chunk.plain || "")}</textarea></label><label>Action this creates<textarea name="action" rows="3">${esc(chunk.action || "")}</textarea></label><div class="drawer-actions"><button type="button" data-direct-save-chunk>Save chunk</button><button type="button" data-direct-mark-full>Mark unpacked</button><button type="button" data-direct-flag>Flag</button><button type="button" data-direct-missed>Park as missed loot</button><button type="button" data-direct-task-brief>Back to Task Brief</button></div></form>`);
  }

  function showDrawer(markup) {
    const currentRoom = room();
    if (!currentRoom) return;
    currentRoom.querySelectorAll(".direct-task-brief-drawer").forEach((node) => node.remove());
    currentRoom.insertAdjacentHTML("beforeend", markup);
  }

  function addControls() {
    const currentRoom = room();
    if (!currentRoom || currentRoom.querySelector(".direct-brief-controls")) return;
    currentRoom.insertAdjacentHTML("beforeend", `<div class="direct-brief-controls" style="position:absolute; right:16px; top:16px; z-index:9998; display:flex; gap:8px; flex-wrap:wrap;"><button type="button" data-direct-task-brief style="border-radius:999px; padding:10px 14px; border:2px solid rgba(255,255,255,.75); background:rgba(20,12,8,.82); color:#fff; font-weight:900;">Open Task Brief</button><button type="button" data-direct-reset-save style="border-radius:999px; padding:10px 14px; border:2px solid rgba(255,255,255,.55); background:rgba(20,12,8,.70); color:#fff; font-weight:900;">Reset Brief Save</button></div>`);
  }

  function saveTask(event, shouldSplit) {
    const form = event.target.closest("form");
    if (!form) return;
    const data = new FormData(form);
    const save = load();
    const f = fog(save);
    f.taskTitle = cap(data.get("taskTitle") || f.taskTitle, 160);
    f.assessmentType = cap(data.get("assessmentType") || f.assessmentType, 160);
    f.rawTaskText = cap(data.get("rawTaskText") || f.rawTaskText, MAX_TASK_TEXT);
    if (shouldSplit) f.chunks = splitText(f.rawTaskText);
    saveState(save);
    showDrawer(taskDrawer());
  }

  function saveChunk(event, action) {
    const form = event.target.closest("form[data-direct-chunk-form]");
    if (!form) return;
    const save = load();
    const q = quest(save);
    const f = fog(save);
    const index = Number(form.dataset.index);
    const chunk = f.chunks[index];
    if (!chunk) return showDrawer(taskDrawer());
    const data = new FormData(form);
    chunk.originalText = cap(data.get("originalText") || chunk.originalText, MAX_CHUNK_TEXT);
    chunk.plain = cap(data.get("plain") || chunk.plain || "", 1200);
    chunk.action = cap(data.get("action") || chunk.action || "", 1200);
    if (action === "full") chunk.state = "Fully unpacked";
    if (action === "flag") {
      chunk.state = "Flagged for later";
      q.flags.push({ id: id("flag"), chunkId: chunk.id, note: chunk.plain || preview(chunk.originalText), createdAt: now() });
    }
    if (action === "missed") {
      chunk.state = "Parked as missed loot";
      q.missedLoot.push({ id: id("missed"), chunkId: chunk.id, itemMissed: chunk.action || preview(chunk.originalText), createdAt: now() });
    }
    if (action === "save" && chunk.state === "Not started") chunk.state = "In progress";
    saveState(save);
    showDrawer(chunkDrawer(index));
  }

  function resetSave() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(OLD_KEY);
    const save = freshState();
    saveState(save);
    showDrawer(drawer("Brief Fog save reset", `<p>The old and v2 Brief Fog browser saves were cleared.</p><button type="button" data-direct-task-brief>Open Task Brief</button>`));
  }

  document.addEventListener("click", (event) => {
    const inBriefRoom = event.target.closest(".brief-fog-room");
    if (!inBriefRoom) return;

    if (event.target.closest('[data-brief-panel="task"]') || event.target.closest("[data-direct-task-brief]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showDrawer(taskDrawer());
      return;
    }
    const openChunkButton = event.target.closest("[data-direct-open-chunk]");
    if (openChunkButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showDrawer(chunkDrawer(Number(openChunkButton.dataset.directOpenChunk)));
      return;
    }
    if (event.target.closest("[data-direct-close]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.target.closest(".direct-task-brief-drawer")?.remove();
      return;
    }
    if (event.target.closest("[data-direct-save-task]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveTask(event, false);
      return;
    }
    if (event.target.closest("[data-direct-suggest-chunks]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveTask(event, true);
      return;
    }
    if (event.target.closest("[data-direct-reset-save]")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      resetSave();
      return;
    }
    if (event.target.closest("[data-direct-save-chunk]")) { event.preventDefault(); event.stopImmediatePropagation(); saveChunk(event, "save"); return; }
    if (event.target.closest("[data-direct-mark-full]")) { event.preventDefault(); event.stopImmediatePropagation(); saveChunk(event, "full"); return; }
    if (event.target.closest("[data-direct-flag]")) { event.preventDefault(); event.stopImmediatePropagation(); saveChunk(event, "flag"); return; }
    if (event.target.closest("[data-direct-missed]")) { event.preventDefault(); event.stopImmediatePropagation(); saveChunk(event, "missed"); }
  }, true);

  const observer = new MutationObserver(addControls);
  document.addEventListener("DOMContentLoaded", () => {
    const stage = document.getElementById("stage-scene");
    if (stage) observer.observe(stage, { childList: true, subtree: true });
    addControls();
  });
})();
