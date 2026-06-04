(() => {
  const SAVE_KEY = "esslay-study-cave-simple-v1";
  const SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  const TOTAL_CHAMBERS = 7;

  const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[char]));

  const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  function defaultState() {
    return {
      questTitle: "Study Skills Trial",
      current: "brief-fog",
      completed: [],
      unlocked: ["cave-base", "brief-fog"],
      flags: [],
      missedLoot: [],
      briefFog: {
        taskTitle: "Study Skills Trial",
        assessmentType: "practice task",
        rawTaskText: SAMPLE_TASK,
        chunks: []
      }
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved && typeof saved === "object") {
        const base = defaultState();
        const next = { ...base, ...saved };
        next.completed = Array.isArray(next.completed) ? next.completed : [];
        next.unlocked = Array.isArray(next.unlocked) ? next.unlocked : ["cave-base", "brief-fog"];
        next.flags = Array.isArray(next.flags) ? next.flags : [];
        next.missedLoot = Array.isArray(next.missedLoot) ? next.missedLoot : [];
        next.briefFog = { ...base.briefFog, ...(next.briefFog || {}) };
        next.briefFog.chunks = Array.isArray(next.briefFog.chunks) ? next.briefFog.chunks : [];
        return next;
      }
    } catch {}
    return defaultState();
  }

  function saveState(state) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch {}
    updateHud(state);
    renderTaskMap(state);
  }

  function updateHud(state = loadState()) {
    document.querySelectorAll("[data-flow-quest-title]").forEach((node) => { node.textContent = state.questTitle; });
    document.querySelectorAll("[data-flow-progress]").forEach((node) => { node.textContent = `${state.completed.length} / ${TOTAL_CHAMBERS}`; });
  }

  function stage() {
    return document.getElementById("stage-scene");
  }

  function openStage(markup) {
    document.querySelectorAll("details[open]").forEach((details) => { details.open = false; });
    const node = stage();
    node.innerHTML = markup;
    node.hidden = false;
  }

  function closeStage() {
    const node = stage();
    node.innerHTML = "";
    node.hidden = true;
  }

  function drawer(title, body) {
    return `<section class="simple-drawer" role="dialog" aria-label="${esc(title)}">
      <button type="button" class="simple-close" data-action="close-drawer">×</button>
      <h2>${esc(title)}</h2>
      ${body}
    </section>`;
  }

  function routeLabel(id) {
    if (id === "source-mine") return "Source Mine";
    if (id === "brief-fog") return "Brief Fog";
    return "Cave Base";
  }

  function renderTaskMap(state = loadState()) {
    const mount = document.querySelector("[data-task-map]");
    if (!mount) return;
    const nodes = [
      ["cave-base", "Cave Base"],
      ["brief-fog", "Brief Fog"],
      ["source-mine", "Source Mine"],
      ["quote-bank", "Quote Bank"],
      ["draft-route", "Draft Route"],
      ["dirty-draft", "Dirty Draft"],
      ["coherence-boss", "Coherence Boss"]
    ];
    const current = state.completed.includes("brief-fog") ? "source-mine" : "brief-fog";
    state.current = current;
    mount.innerHTML = `<section class="task-map-grid">
      <article class="flow-card">
        <p class="eyebrow">Selected task becomes the map</p>
        <h2>${esc(state.questTitle)}</h2>
        <p><strong>Current chamber:</strong> ${esc(routeLabel(current))}</p>
        <p><strong>Progress:</strong> ${state.completed.length} / ${TOTAL_CHAMBERS} chambers complete</p>
        <p><strong>Flags:</strong> ${state.flags.length} · <strong>Missed loot:</strong> ${state.missedLoot.length}</p>
        <div class="flow-actions">
          <button type="button" data-action="enter-cave-base">Enter Cave Base</button>
          <button type="button" class="secondary-button" data-action="open-quest-board">Back to Quest Board</button>
        </div>
      </article>
      <article class="flow-card">
        <h3>Route nodes</h3>
        <div class="route-node-grid">
          ${nodes.map(([id, label]) => {
            const complete = state.completed.includes(id);
            const unlocked = state.unlocked.includes(id);
            const active = id === current;
            const status = complete ? "Complete" : active ? "Current" : unlocked ? "Unlocked" : "Locked";
            return `<article class="route-node-card ${complete ? "complete" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "current" : ""}"><strong>${esc(label)}</strong><p>${status}</p></article>`;
          }).join("")}
        </div>
      </article>
    </section>`;
  }

  function openQuestBoard() {
    closeStage();
    document.querySelectorAll("details[open]").forEach((details) => { details.open = false; });
    const panel = document.getElementById("quest-board-panel");
    if (panel) panel.open = true;
  }

  function openTaskMap() {
    const state = loadState();
    renderTaskMap(state);
    closeStage();
    document.querySelectorAll("details[open]").forEach((details) => { details.open = false; });
    const panel = document.getElementById("map-board-panel");
    if (panel) panel.open = true;
  }

  function openCaveBase(extra = "") {
    const state = loadState();
    openStage(`<section class="simple-room cave-base-room">
      <button type="button" class="stage-close" data-action="close-stage">×</button>
      <p class="scene-label">Cave Base</p>
      <article class="stage-card simple-card">
        <h2>Cave Base</h2>
        <p><strong>Active quest:</strong> ${esc(state.questTitle)}</p>
        <p><strong>Current chamber:</strong> ${esc(routeLabel(state.current))}</p>
        <p><strong>Progress:</strong> ${state.completed.length} / ${TOTAL_CHAMBERS}</p>
        <div class="simple-actions">
          <button type="button" data-action="continue-quest">Continue</button>
          <button type="button" data-action="open-task-map">Task Map</button>
          <button type="button" data-action="show-flags">Flags / Missed Loot</button>
          <button type="button" data-action="show-outfit">Outfit Chest</button>
        </div>
      </article>
      ${extra}
    </section>`);
  }

  function openBriefFog(extra = "") {
    const state = loadState();
    const fog = state.briefFog;
    const resolved = fog.chunks.filter((chunk) => chunk.state === "unpacked" || chunk.state === "flagged" || chunk.state === "missed").length;
    openStage(`<section class="simple-room brief-fog-room">
      <button type="button" class="stage-close" data-action="return-cave-base">×</button>
      <p class="scene-label">Brief Fog</p>
      <article class="stage-card simple-card">
        <h2>Brief Fog</h2>
        <p>This version removes the visual effects and uses reliable buttons only.</p>
        <p><strong>Chunks:</strong> ${fog.chunks.length} · <strong>Resolved:</strong> ${resolved}/${fog.chunks.length}</p>
        <div class="simple-actions">
          <button type="button" data-action="open-task-brief">Task Brief</button>
          <button type="button" data-action="work-next-chunk">Work Next Chunk</button>
          <button type="button" data-action="open-summary">Summary</button>
          <button type="button" data-action="return-cave-base">Cave Base</button>
        </div>
      </article>
      ${extra}
    </section>`);
  }

  function openTaskBrief() {
    const state = loadState();
    const fog = state.briefFog;
    const chunks = fog.chunks.length ? `<ol class="chunk-list">${fog.chunks.map((chunk, index) => `<li><button type="button" data-action="open-chunk" data-index="${index}">${esc(chunk.text.slice(0, 90))}${chunk.text.length > 90 ? "…" : ""}</button> <small>${esc(chunk.state || "not started")}</small></li>`).join("")}</ol>` : `<p>No chunks yet. Paste the task, then press Suggest chunks.</p>`;
    openBriefFog(drawer("Task Brief", `<form data-task-form>
      <label>Task title<input name="taskTitle" value="${esc(fog.taskTitle)}"></label>
      <label>Assessment type<input name="assessmentType" value="${esc(fog.assessmentType)}"></label>
      <label>Paste task / question / guidance<textarea name="rawTaskText" rows="8">${esc(fog.rawTaskText)}</textarea></label>
      <div class="simple-actions">
        <button type="button" data-action="save-task">Save task brief</button>
        <button type="button" data-action="suggest-chunks">Suggest chunks</button>
        <button type="button" data-action="reset-study-cave-save">Reset save</button>
      </div>
    </form>
    <h3>Chunk list</h3>
    ${chunks}`));
  }

  function splitTask(text) {
    const clean = String(text || SAMPLE_TASK).trim().slice(0, 9000);
    const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const sentences = clean.split(/(?<=[.!?])\s+/).map((line) => line.trim()).filter(Boolean);
    const parts = (lines.length > 1 ? lines : sentences).slice(0, 8);
    return (parts.length ? parts : [clean]).map((part) => ({
      id: uid(),
      text: part.slice(0, 1200),
      plain: "",
      action: "",
      state: "not started"
    }));
  }

  function saveTask(split = false) {
    const form = document.querySelector("[data-task-form]");
    if (!form) return;
    const data = new FormData(form);
    const state = loadState();
    state.briefFog.taskTitle = String(data.get("taskTitle") || "Study Skills Trial").slice(0, 160);
    state.briefFog.assessmentType = String(data.get("assessmentType") || "practice task").slice(0, 160);
    state.briefFog.rawTaskText = String(data.get("rawTaskText") || SAMPLE_TASK).slice(0, 9000);
    if (split) state.briefFog.chunks = splitTask(state.briefFog.rawTaskText);
    saveState(state);
    openTaskBrief();
  }

  function openChunk(index) {
    const state = loadState();
    const chunk = state.briefFog.chunks[index];
    if (!chunk) return openTaskBrief();
    openBriefFog(drawer(`Chunk ${index + 1}`, `<form data-chunk-form data-index="${index}">
      <label>Original wording<textarea name="text" rows="5">${esc(chunk.text)}</textarea></label>
      <label>Plain meaning<textarea name="plain" rows="4">${esc(chunk.plain || "")}</textarea></label>
      <label>Action this creates<textarea name="action" rows="4">${esc(chunk.action || "")}</textarea></label>
      <div class="simple-actions">
        <button type="button" data-action="save-chunk">Save chunk</button>
        <button type="button" data-action="mark-unpacked">Mark unpacked</button>
        <button type="button" data-action="flag-chunk">Flag</button>
        <button type="button" data-action="missed-chunk">Park as missed loot</button>
        <button type="button" data-action="open-task-brief">Task Brief</button>
      </div>
    </form>`));
  }

  function saveChunk(stateName = "in progress") {
    const form = document.querySelector("[data-chunk-form]");
    if (!form) return;
    const index = Number(form.dataset.index);
    const data = new FormData(form);
    const state = loadState();
    const chunk = state.briefFog.chunks[index];
    if (!chunk) return openTaskBrief();
    chunk.text = String(data.get("text") || chunk.text).slice(0, 1200);
    chunk.plain = String(data.get("plain") || "").slice(0, 1200);
    chunk.action = String(data.get("action") || "").slice(0, 1200);
    chunk.state = stateName;
    if (stateName === "flagged") state.flags.push({ id: uid(), text: chunk.plain || chunk.text.slice(0, 120) });
    if (stateName === "missed") state.missedLoot.push({ id: uid(), text: chunk.action || chunk.text.slice(0, 120) });
    saveState(state);
    openChunk(index);
  }

  function workNextChunk() {
    const state = loadState();
    if (!state.briefFog.chunks.length) return openTaskBrief();
    const index = state.briefFog.chunks.findIndex((chunk) => !["unpacked", "flagged", "missed"].includes(chunk.state));
    openChunk(index >= 0 ? index : 0);
  }

  function canFinish(state) {
    return state.briefFog.chunks.length && state.briefFog.chunks.every((chunk) => ["unpacked", "flagged", "missed"].includes(chunk.state));
  }

  function openSummary(done = false) {
    const state = loadState();
    const ready = canFinish(state);
    const chunks = state.briefFog.chunks.map((chunk, index) => `<li><strong>Chunk ${index + 1}:</strong> ${esc(chunk.state)} — ${esc(chunk.plain || chunk.text.slice(0, 90))}</li>`).join("");
    const body = done ? `<p>Brief Fog is complete. Source Mine is now unlocked.</p>` : `<p>${ready ? "Ready to finish Brief Fog." : "Resolve each chunk before finishing."}</p>`;
    openBriefFog(drawer(done ? "Brief Fog Cleared" : "Brief Fog Summary", `${body}
      <ul>${chunks || "<li>No chunks yet.</li>"}</ul>
      <div class="simple-actions">
        <button type="button" data-action="finish-brief-fog" ${ready ? "" : "disabled"}>Finish Brief Fog</button>
        <button type="button" data-action="export-brief-fog">Export text</button>
        <button type="button" data-action="return-cave-base">Cave Base</button>
      </div>`));
  }

  function finishBriefFog() {
    const state = loadState();
    if (!canFinish(state)) return openSummary(false);
    state.completed = Array.from(new Set([...state.completed, "brief-fog"]));
    state.unlocked = Array.from(new Set([...state.unlocked, "source-mine"]));
    state.current = "source-mine";
    saveState(state);
    openCaveBase(drawer("Brief Fog Cleared", `<p>Source Mine is unlocked. The next chamber can stay as a placeholder for now.</p><button type="button" data-action="continue-quest">Continue</button>`));
  }

  function exportBriefFog() {
    const state = loadState();
    const fog = state.briefFog;
    const content = `Brief Fog Export\n\nTask: ${fog.taskTitle}\nAssessment: ${fog.assessmentType}\n\nRaw task:\n${fog.rawTaskText}\n\nChunks:\n${fog.chunks.map((chunk, index) => `${index + 1}. ${chunk.text}\nState: ${chunk.state}\nPlain meaning: ${chunk.plain}\nAction: ${chunk.action}`).join("\n\n")}`;
    openBriefFog(drawer("Export", `<p>Copy or download the current Brief Fog notes.</p><a class="download-link" download="brief-fog-export.txt" href="data:text/plain;charset=utf-8,${encodeURIComponent(content)}">Download brief-fog-export.txt</a><textarea rows="12" readonly>${esc(content)}</textarea>`));
  }

  function showFlags() {
    const state = loadState();
    openCaveBase(drawer("Flags / Missed Loot", `<h3>Flags</h3>${state.flags.length ? `<ul>${state.flags.map((item) => `<li>${esc(item.text)}</li>`).join("")}</ul>` : `<p>None yet.</p>`}<h3>Missed loot</h3>${state.missedLoot.length ? `<ul>${state.missedLoot.map((item) => `<li>${esc(item.text)}</li>`).join("")}</ul>` : `<p>None yet.</p>`}`));
  }

  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem("esslay-study-cave-save-v01");
    localStorage.removeItem("esslay-study-cave-save-v02");
    saveState(defaultState());
    openTaskBrief();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button, a");
    if (!button) return;
    const action = button.dataset.action;
    if (!action && button.dataset.openQuest === "study-skills-trial") {
      event.preventDefault();
      openTaskMap();
      return;
    }
    if (!action) return;
    event.preventDefault();

    if (action === "open-quest-board") return openQuestBoard();
    if (action === "open-task-map") return openTaskMap();
    if (action === "enter-cave-base") return openCaveBase();
    if (action === "continue-quest") {
      const state = loadState();
      return state.current === "source-mine"
        ? openCaveBase(drawer("Source Mine", `<p>Source Mine is a placeholder for now.</p><button type="button" data-action="return-cave-base">Cave Base</button>`))
        : openBriefFog();
    }
    if (action === "return-cave-base") return openCaveBase();
    if (action === "close-stage") return closeStage();
    if (action === "close-drawer") return openBriefFog();
    if (action === "open-task-brief") return openTaskBrief();
    if (action === "save-task") return saveTask(false);
    if (action === "suggest-chunks") return saveTask(true);
    if (action === "work-next-chunk") return workNextChunk();
    if (action === "open-chunk") return openChunk(Number(button.dataset.index));
    if (action === "save-chunk") return saveChunk("in progress");
    if (action === "mark-unpacked") return saveChunk("unpacked");
    if (action === "flag-chunk") return saveChunk("flagged");
    if (action === "missed-chunk") return saveChunk("missed");
    if (action === "open-summary") return openSummary(false);
    if (action === "finish-brief-fog") return finishBriefFog();
    if (action === "export-brief-fog") return exportBriefFog();
    if (action === "show-flags") return showFlags();
    if (action === "show-outfit") return openCaveBase(drawer("Outfit Chest", `<p>Outfit changing is a placeholder here. It should connect to the wardrobe/outfit system later.</p>`));
    if (action === "reset-study-cave-save") return resetSave();
  });

  document.addEventListener("DOMContentLoaded", () => {
    const state = loadState();
    updateHud(state);
    renderTaskMap(state);
  });
})();
