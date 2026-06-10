(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  var TOTAL_CHAMBERS = 7;
  var RESOLVED_STATES = ["unpacked", "flagged", "missed"];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function uid() {
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  function safeArray(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function isResolved(chunk) {
    return RESOLVED_STATES.indexOf(String(chunk && chunk.state || "")) >= 0;
  }

  function textKey(value) {
    return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function timeStamp() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function hotspot(className, label, action) {
    return '<button type="button" class="flow-hotspot ' + esc(className) + '" data-action="' + esc(action) + '" data-hotspot-label="' + esc(label) + '">' + esc(label) + '</button>';
  }

  function defaultState() {
    return {
      questTitle: "Study Skills Trial",
      current: "brief-fog",
      completed: [],
      unlocked: ["cave-base", "brief-fog"],
      flags: [],
      missedLoot: [],
      lastSavedAt: "Not saved yet",
      lastAction: "Ready",
      briefFog: {
        taskTitle: "Study Skills Trial",
        assessmentType: "practice task",
        rawTaskText: SAMPLE_TASK,
        chunks: []
      }
    };
  }

  function saveInfo(state) {
    state = state || loadState();
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt || "Not saved yet") + ' · ' + esc(state.lastAction || "Ready") + '</p>';
  }

  function normaliseChunk(chunk, index) {
    var raw = chunk && typeof chunk === "object" ? chunk : {};
    var text = String(raw.text || raw.originalText || raw.wording || ("Recovered chunk " + (index + 1))).slice(0, 1200);
    var state = String(raw.state || "not started").toLowerCase();
    if (["not started", "in progress", "unpacked", "flagged", "missed"].indexOf(state) === -1) state = "not started";
    return {
      id: raw.id || uid(),
      text: text,
      plain: String(raw.plain || raw.plainMeaning || "").slice(0, 1200),
      action: String(raw.action || raw.actionCreated || "").slice(0, 1200),
      state: state
    };
  }

  function loadState() {
    var base = defaultState();
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    } catch (error) {
      saved = null;
    }

    if (!saved || typeof saved !== "object") return base;

    var next = {
      questTitle: String(saved.questTitle || base.questTitle),
      current: String(saved.current || base.current),
      completed: safeArray(saved.completed),
      unlocked: safeArray(saved.unlocked).length ? safeArray(saved.unlocked) : base.unlocked.slice(),
      flags: safeArray(saved.flags),
      missedLoot: safeArray(saved.missedLoot),
      lastSavedAt: String(saved.lastSavedAt || base.lastSavedAt),
      lastAction: String(saved.lastAction || base.lastAction),
      briefFog: Object.assign({}, base.briefFog, saved.briefFog || {}),
      sourceMine: Object.assign({ evidenceGems: [] }, saved.sourceMine || {}),
      routeRooms: saved.routeRooms && typeof saved.routeRooms === "object" ? saved.routeRooms : {}
    };

    next.briefFog.taskTitle = String(next.briefFog.taskTitle || base.briefFog.taskTitle).slice(0, 160);
    next.briefFog.assessmentType = String(next.briefFog.assessmentType || base.briefFog.assessmentType).slice(0, 160);
    next.briefFog.rawTaskText = String(next.briefFog.rawTaskText || base.briefFog.rawTaskText).slice(0, 9000);
    next.briefFog.chunks = safeArray(next.briefFog.chunks).map(normaliseChunk);
    if (next.completed.indexOf("brief-fog") >= 0 && next.unlocked.indexOf("source-mine") === -1) next.unlocked.push("source-mine");
    next.current = next.completed.indexOf("brief-fog") >= 0 ? "source-mine" : "brief-fog";
    return next;
  }

  function saveState(state, message) {
    state.lastSavedAt = timeStamp();
    state.lastAction = message || "Saved locally";
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      state.lastAction = "Save failed in this browser";
    }
    updateHud(state);
    renderTaskMap(state);
  }

  function updateHud(state) {
    state = state || loadState();
    document.querySelectorAll("[data-flow-quest-title]").forEach(function (node) { node.textContent = state.questTitle; });
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) { node.textContent = state.completed.length + " / " + TOTAL_CHAMBERS; });
  }

  function stage() {
    return document.getElementById("stage-scene");
  }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach(function (details) { details.open = false; });
  }

  function openStage(markup) {
    closePanels();
    var node = stage();
    if (!node) return;
    node.innerHTML = markup;
    node.hidden = false;
  }

  function closeStage() {
    var node = stage();
    if (!node) return;
    node.innerHTML = "";
    node.hidden = true;
  }

  function drawer(title, body, closeTarget) {
    var target = closeTarget || "brief-fog";
    return '<section class="simple-drawer" role="dialog" aria-label="' + esc(title) + '" data-drawer-context="' + esc(target) + '">' +
      '<button type="button" class="simple-close" data-action="close-drawer" data-close-target="' + esc(target) + '">×</button>' +
      '<h2>' + esc(title) + '</h2>' + body + '</section>';
  }

  function routeLabel(id) {
    if (id === "source-mine") return "Source Mine";
    if (id === "brief-fog") return "Brief Fog";
    return "Cave Base";
  }

  function chunkOverview(fog, activeIndex) {
    var chunks = safeArray(fog.chunks);
    if (!chunks.length) return '<p>No chunks yet.</p>';
    return '<ol class="chunk-list chunk-status-list">' + chunks.map(function (chunk, index) {
      var text = String(chunk.text || "Recovered chunk");
      var active = index === activeIndex ? ' <strong>current</strong>' : '';
      return '<li><button type="button" data-action="open-chunk" data-index="' + index + '">Chunk ' + (index + 1) + ': ' + esc(text.slice(0, 70)) + (text.length > 70 ? "…" : "") + '</button> <small>state: ' + esc(chunk.state || "not started") + active + '</small></li>';
    }).join("") + '</ol>';
  }

  function nextUnresolvedIndex(chunks, currentIndex) {
    var i;
    for (i = currentIndex + 1; i < chunks.length; i += 1) {
      if (!isResolved(chunks[i])) return i;
    }
    for (i = 0; i < chunks.length; i += 1) {
      if (!isResolved(chunks[i])) return i;
    }
    return -1;
  }

  function appendUniqueChunks(existing, suggested) {
    var seen = {};
    var added = 0;
    safeArray(existing).forEach(function (chunk) {
      seen[textKey(chunk.text)] = true;
    });
    safeArray(suggested).forEach(function (chunk) {
      var key = textKey(chunk.text);
      if (!key || seen[key]) return;
      existing.push(chunk);
      seen[key] = true;
      added += 1;
    });
    return added;
  }

  function renderTaskMap(state) {
    state = state || loadState();
    var mount = document.querySelector("[data-task-map]");
    if (!mount) return;
    var nodes = [
      ["cave-base", "Cave Base"],
      ["brief-fog", "Brief Fog"],
      ["source-mine", "Source Mine"],
      ["quote-bank", "Quote Bank"],
      ["draft-route", "Draft Route"],
      ["dirty-draft", "Dirty Draft"],
      ["coherence-boss", "Coherence Boss"]
    ];
    var current = state.completed.indexOf("brief-fog") >= 0 ? "source-mine" : "brief-fog";
    state.current = current;
    var nodeHtml = nodes.map(function (item) {
      var id = item[0];
      var label = item[1];
      var complete = state.completed.indexOf(id) >= 0;
      var unlocked = state.unlocked.indexOf(id) >= 0;
      var active = id === current;
      var status = complete ? "Complete" : active ? "Current" : unlocked ? "Unlocked" : "Locked";
      return '<article class="route-node-card ' + (complete ? "complete" : "") + ' ' + (unlocked ? "unlocked" : "locked") + ' ' + (active ? "current" : "") + '"><strong>' + esc(label) + '</strong><p>' + esc(status) + '</p></article>';
    }).join("");

    mount.innerHTML = '<section class="task-map-grid">' +
      '<article class="flow-card">' +
      '<p class="eyebrow">Selected task becomes the map</p>' +
      '<h2>' + esc(state.questTitle) + '</h2>' +
      '<p><strong>Current chamber:</strong> ' + esc(routeLabel(current)) + '</p>' +
      '<p><strong>Progress:</strong> ' + state.completed.length + ' / ' + TOTAL_CHAMBERS + ' chambers complete</p>' +
      saveInfo(state) +
      '<p><strong>Flags:</strong> ' + state.flags.length + ' · <strong>Missed loot:</strong> ' + state.missedLoot.length + '</p>' +
      '<div class="flow-actions">' +
      '<button type="button" data-action="enter-cave-base">Enter Cave Base</button>' +
      '<button type="button" data-action="open-brief-fog">Open Brief Fog directly</button>' +
      '<button type="button" data-action="open-source-mine">Open Source Mine</button>' +
      (state.unlocked.indexOf("draft-route") >= 0 ? '<button type="button" data-action="open-draft-route">Open Draft Route</button>' : "") +
      '<button type="button" class="secondary-button" data-action="open-quest-board">Back to Quest Board</button>' +
      '</div></article>' +
      '<article class="flow-card"><h3>Route nodes</h3><div class="route-node-grid">' + nodeHtml + '</div></article>' +
      '</section>';
  }

  function openQuestBoard() {
    closeStage();
    closePanels();
    var panel = document.getElementById("quest-board-panel");
    if (panel) panel.open = true;
  }

  function openTaskMap() {
    var state = loadState();
    renderTaskMap(state);
    closeStage();
    closePanels();
    var panel = document.getElementById("map-board-panel");
    if (panel) panel.open = true;
  }

  function caveBaseHotspots() {
    return hotspot("hotspot-continue", "Continue", "continue-quest") +
      hotspot("hotspot-shelf", "Open Brief Fog", "open-brief-fog") +
      hotspot("hotspot-return", "Task Map", "open-task-map") +
      hotspot("hotspot-flags", "Flags", "show-flags") +
      hotspot("hotspot-chest", "Outfit", "show-outfit");
  }

  function briefFogHotspots() {
    return hotspot("hotspot-parchment", "Task Brief", "open-task-brief") +
      hotspot("hotspot-brief-loot", "Work Chunk", "work-next-chunk") +
      hotspot("hotspot-forward", "Summary", "open-summary") +
      hotspot("hotspot-brief-flag", "Cave Base", "return-cave-base");
  }

  function sourceMineHotspots() {
    return hotspot("hotspot-parchment", "Source Notes", "source-placeholder") +
      hotspot("hotspot-forward", "Next later", "source-placeholder") +
      hotspot("hotspot-brief-flag", "Cave Base", "return-cave-base") +
      hotspot("hotspot-brief-loot", "Task Map", "open-task-map");
  }

  function openCaveBase(extra) {
    var state = loadState();
    openStage('<section class="simple-room cave-base-room">' +
      '<p class="scene-label">Cave Base</p>' +
      caveBaseHotspots() +
      '<article class="stage-card simple-card">' +
      '<h2>Cave Base</h2>' +
      '<p><strong>Active quest:</strong> ' + esc(state.questTitle) + '</p>' +
      '<p><strong>Current chamber:</strong> ' + esc(routeLabel(state.current)) + '</p>' +
      '<p><strong>Progress:</strong> ' + state.completed.length + ' / ' + TOTAL_CHAMBERS + '</p>' +
      saveInfo(state) +
      '<p>This is now treated as a room, not a dismissible popup. Use Task Map to leave the route.</p>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="continue-quest">Continue</button>' +
      '<button type="button" data-action="open-brief-fog">Open Brief Fog</button>' +
      '<button type="button" data-action="open-source-mine">Open Source Mine</button>' +
      (state.unlocked.indexOf("draft-route") >= 0 ? '<button type="button" data-action="open-draft-route">Open Draft Route</button>' : "") +
      '<button type="button" data-action="open-task-map">Task Map</button>' +
      '<button type="button" data-action="show-flags">Flags / Missed Loot</button>' +
      '<button type="button" data-action="show-outfit">Outfit Chest</button>' +
      '<button type="button" data-action="reset-study-cave-save">Reset save</button>' +
      '</div></article>' + (extra || "") + '</section>');
  }

  function openBriefFog(extra) {
    var state = loadState();
    var fog = state.briefFog;
    var resolved = fog.chunks.filter(function (chunk) { return isResolved(chunk); }).length;
    openStage('<section class="simple-room brief-fog-room">' +
      '<p class="scene-label">Brief Fog</p>' +
      briefFogHotspots() +
      '<article class="stage-card simple-card">' +
      '<h2>Brief Fog</h2>' +
      '<p>This version removes the visual effects and uses reliable buttons only.</p>' +
      '<p><strong>Chunks:</strong> ' + fog.chunks.length + ' · <strong>Resolved:</strong> ' + resolved + '/' + fog.chunks.length + '</p>' +
      saveInfo(state) +
      '<p>Save chunk keeps a draft. Mark unpacked, flag, or park to resolve and move the route forward.</p>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="open-task-brief">Task Brief</button>' +
      '<button type="button" data-action="work-next-chunk">Work Next Chunk</button>' +
      '<button type="button" data-action="open-summary">Summary</button>' +
      '<button type="button" data-action="return-cave-base">Cave Base</button>' +
      '<button type="button" data-action="open-task-map">Task Map</button>' +
      '</div></article>' + (extra || "") + '</section>');
  }

  function openSourceMine(extra) {
    var state = loadState();
    var unlocked = state.unlocked.indexOf("source-mine") >= 0;
    if (!unlocked) {
      return openCaveBase(drawer("Source Mine locked", '<p>Finish Brief Fog first. Source Mine unlocks after the task brief has been unpacked.</p><button type="button" data-action="open-brief-fog">Open Brief Fog</button>', "cave-base"));
    }
    openStage('<section class="simple-room source-mine-room">' +
      '<p class="scene-label">Source Mine</p>' +
      sourceMineHotspots() +
      '<article class="stage-card simple-card">' +
      '<h2>Source Mine</h2>' +
      '<p>This placeholder proves the route can progress after Brief Fog.</p>' +
      '<p><strong>Unlocked by:</strong> Brief Fog completion</p>' +
      '<p><strong>Progress:</strong> ' + state.completed.length + ' / ' + TOTAL_CHAMBERS + '</p>' +
      saveInfo(state) +
      '<p>Source gathering, quote notes, and evidence linking will be built here later.</p>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="return-cave-base">Cave Base</button>' +
      '<button type="button" data-action="open-task-map">Task Map</button>' +
      '<button type="button" data-action="source-placeholder">Source Notes placeholder</button>' +
      '</div></article>' + (extra || "") + '</section>');
  }

  function openTaskBrief() {
    var state = loadState();
    var fog = state.briefFog;
    var chunks = fog.chunks.length ? chunkOverview(fog, -1) : '<p>No chunks yet. Paste the task, then press Add suggested chunks.</p>';
    openBriefFog(drawer("Task Brief", saveInfo(state) + '<form data-task-form>' +
      '<label>Task title<input name="taskTitle" value="' + esc(fog.taskTitle) + '"></label>' +
      '<label>Assessment type<input name="assessmentType" value="' + esc(fog.assessmentType) + '"></label>' +
      '<label>Paste task / question / guidance<textarea name="rawTaskText" rows="8">' + esc(fog.rawTaskText) + '</textarea></label>' +
      '<p><strong>Add suggested chunks</strong> appends new chunks and keeps existing chunk notes/states. <strong>Replace all chunks</strong> wipes the current chunk list.</p>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="save-task">Save task brief</button>' +
      '<button type="button" data-action="suggest-chunks">Add suggested chunks</button>' +
      '<button type="button" data-action="replace-chunks">Replace all chunks</button>' +
      '<button type="button" data-action="reset-study-cave-save">Reset save</button>' +
      '</div></form><h3>Chunk list</h3>' + chunks, "brief-fog"));
  }

  function splitTask(text) {
    var clean = String(text || SAMPLE_TASK).trim().slice(0, 9000);
    var lines = clean.split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean);
    var sentences = clean.split(/[.!?]+\s+/).map(function (line) { return line.trim(); }).filter(Boolean);
    var parts = (lines.length > 1 ? lines : sentences).slice(0, 8);
    if (!parts.length) parts = [clean || SAMPLE_TASK];
    return parts.map(function (part) {
      return { id: uid(), text: part.slice(0, 1200), plain: "", action: "", state: "not started" };
    });
  }

  function saveTask(mode) {
    var form = document.querySelector("[data-task-form]");
    if (!form) return;
    var data = new FormData(form);
    var state = loadState();
    var message = "Task brief saved";
    state.briefFog.taskTitle = String(data.get("taskTitle") || "Study Skills Trial").slice(0, 160);
    state.briefFog.assessmentType = String(data.get("assessmentType") || "practice task").slice(0, 160);
    state.briefFog.rawTaskText = String(data.get("rawTaskText") || SAMPLE_TASK).slice(0, 9000);
    if (mode === "append") {
      var added = appendUniqueChunks(state.briefFog.chunks, splitTask(state.briefFog.rawTaskText));
      message = added ? "Task brief saved; " + added + " new chunk" + (added === 1 ? "" : "s") + " added" : "Task brief saved; no new chunks added";
    }
    if (mode === "replace") {
      state.briefFog.chunks = splitTask(state.briefFog.rawTaskText);
      message = "Task brief saved; chunks replaced";
    }
    saveState(state, message);
    openTaskBrief();
  }

  function openChunk(index) {
    var state = loadState();
    var fog = state.briefFog;
    var chunk = fog.chunks[index];
    if (!chunk) return openTaskBrief();
    var previousIndex = Math.max(0, index - 1);
    var nextIndex = Math.min(fog.chunks.length - 1, index + 1);
    openBriefFog(drawer("Chunk " + (index + 1), saveInfo(state) +
      '<p><strong>Current state:</strong> ' + esc(chunk.state) + '</p>' +
      '<p>Save chunk keeps this as a draft. Mark unpacked, flag, or park as missed loot when this chunk is resolved.</p>' +
      '<form data-chunk-form data-index="' + index + '">' +
      '<label>Original wording<textarea name="text" rows="5">' + esc(chunk.text) + '</textarea></label>' +
      '<label>Plain meaning<textarea name="plain" rows="4">' + esc(chunk.plain || "") + '</textarea></label>' +
      '<label>Action this creates<textarea name="action" rows="4">' + esc(chunk.action || "") + '</textarea></label>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="save-chunk">Save draft only</button>' +
      '<button type="button" data-action="save-chunk-next">Save draft + next</button>' +
      '<button type="button" data-action="mark-unpacked">Mark unpacked</button>' +
      '<button type="button" data-action="mark-unpacked-next">Mark unpacked + next</button>' +
      '<button type="button" data-action="flag-chunk-next">Flag + next</button>' +
      '<button type="button" data-action="missed-chunk-next">Park missed + next</button>' +
      '<button type="button" data-action="open-chunk" data-index="' + previousIndex + '">Previous chunk</button>' +
      '<button type="button" data-action="open-chunk" data-index="' + nextIndex + '">Next chunk</button>' +
      '<button type="button" data-action="open-task-brief">Task Brief</button>' +
      '<button type="button" data-action="open-summary">Summary</button>' +
      '</div></form><h3>All chunk states</h3>' + chunkOverview(fog, index), "brief-fog"));
  }

  function saveChunk(stateName, moveNext) {
    var form = document.querySelector("[data-chunk-form]");
    if (!form) return;
    var index = Number(form.dataset.index);
    var data = new FormData(form);
    var state = loadState();
    var fog = state.briefFog;
    var chunk = fog.chunks[index];
    if (!chunk) return openTaskBrief();
    chunk.text = String(data.get("text") || chunk.text).slice(0, 1200);
    chunk.plain = String(data.get("plain") || "").slice(0, 1200);
    chunk.action = String(data.get("action") || "").slice(0, 1200);
    chunk.state = stateName || "in progress";
    if (stateName === "flagged") state.flags.push({ id: uid(), text: chunk.plain || chunk.text.slice(0, 120) });
    if (stateName === "missed") state.missedLoot.push({ id: uid(), text: chunk.action || chunk.text.slice(0, 120) });
    saveState(state, "Chunk " + (index + 1) + " saved as " + chunk.state);

    if (moveNext) {
      var nextIndex = nextUnresolvedIndex(fog.chunks, index);
      if (nextIndex >= 0) return openChunk(nextIndex);
      return openSummary(false);
    }
    openChunk(index);
  }

  function workNextChunk() {
    var state = loadState();
    if (!state.briefFog.chunks.length) return openTaskBrief();
    var index = nextUnresolvedIndex(state.briefFog.chunks, -1);
    openChunk(index >= 0 ? index : 0);
  }

  function canFinish(state) {
    return Boolean(state.briefFog.chunks.length && state.briefFog.chunks.every(function (chunk) { return isResolved(chunk); }));
  }

  function openSummary(done) {
    var state = loadState();
    var ready = canFinish(state);
    var chunks = state.briefFog.chunks.map(function (chunk, index) {
      return '<li><strong>Chunk ' + (index + 1) + ':</strong> ' + esc(chunk.state) + ' — ' + esc(chunk.plain || chunk.text.slice(0, 90)) + '</li>';
    }).join("");
    var body = done ? '<p>Brief Fog is complete. Source Mine is now unlocked.</p>' : '<p>' + (ready ? "Ready to finish Brief Fog." : "Resolve each chunk before finishing. Draft-only chunks are saved, but they do not count as resolved.") + '</p>';
    openBriefFog(drawer(done ? "Brief Fog Cleared" : "Brief Fog Summary", body + saveInfo(state) +
      '<ul>' + (chunks || '<li>No chunks yet.</li>') + '</ul>' +
      '<div class="simple-actions">' +
      '<button type="button" data-action="finish-brief-fog" ' + (ready ? "" : "disabled") + '>Finish Brief Fog</button>' +
      '<button type="button" data-action="export-brief-fog">Export text</button>' +
      '<button type="button" data-action="return-cave-base">Cave Base</button>' +
      '</div>', "brief-fog"));
  }

  function finishBriefFog() {
    var state = loadState();
    if (!canFinish(state)) return openSummary(false);
    if (state.completed.indexOf("brief-fog") === -1) state.completed.push("brief-fog");
    if (state.unlocked.indexOf("source-mine") === -1) state.unlocked.push("source-mine");
    state.current = "source-mine";
    saveState(state, "Brief Fog completed and Source Mine unlocked");
    openSourceMine(drawer("Brief Fog Cleared", '<p>Source Mine is now unlocked. Progress has updated to ' + state.completed.length + ' / ' + TOTAL_CHAMBERS + '.</p>' + saveInfo(state) + '<button type="button" data-action="return-cave-base">Cave Base</button>', "source-mine"));
  }

  function exportBriefFog() {
    var state = loadState();
    var fog = state.briefFog;
    var content = "Brief Fog Export\n\nTask: " + fog.taskTitle + "\nAssessment: " + fog.assessmentType + "\n\nRaw task:\n" + fog.rawTaskText + "\n\nChunks:\n" + fog.chunks.map(function (chunk, index) {
      return (index + 1) + ". " + chunk.text + "\nState: " + chunk.state + "\nPlain meaning: " + chunk.plain + "\nAction: " + chunk.action;
    }).join("\n\n");
    openBriefFog(drawer("Export", '<p>Copy or download the current Brief Fog notes.</p>' + saveInfo(state) + '<a class="download-link" download="brief-fog-export.txt" href="data:text/plain;charset=utf-8,' + encodeURIComponent(content) + '">Download brief-fog-export.txt</a><textarea rows="12" readonly>' + esc(content) + '</textarea>', "brief-fog"));
  }

  function showFlags() {
    var state = loadState();
    var flags = state.flags.length ? '<ul>' + state.flags.map(function (item) { return '<li>' + esc(item.text) + '</li>'; }).join("") + '</ul>' : '<p>None yet.</p>';
    var loot = state.missedLoot.length ? '<ul>' + state.missedLoot.map(function (item) { return '<li>' + esc(item.text) + '</li>'; }).join("") + '</ul>' : '<p>None yet.</p>';
    openCaveBase(drawer("Flags / Missed Loot", saveInfo(state) + '<h3>Flags</h3>' + flags + '<h3>Missed loot</h3>' + loot, "cave-base"));
  }

  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem("esslay-study-cave-save-v01");
    localStorage.removeItem("esslay-study-cave-save-v02");
    var state = defaultState();
    saveState(state, "Study Cave save reset");
    openCaveBase(drawer("Save reset", '<p>The Study Cave save was reset. Continue to Brief Fog when ready.</p>' + saveInfo(state) + '<button type="button" data-action="open-brief-fog">Open Brief Fog</button>', "cave-base"));
  }

  function closeDrawer(button) {
    var target = button.dataset.closeTarget || "";
    if (!target) {
      var drawerNode = button.closest("[data-drawer-context]");
      target = drawerNode ? drawerNode.dataset.drawerContext : "";
    }
    if (!target) target = button.closest(".source-mine-room") ? "source-mine" : button.closest(".cave-base-room") ? "cave-base" : "brief-fog";
    if (target === "source-mine") return openSourceMine();
    return target === "cave-base" ? openCaveBase() : openBriefFog();
  }

  function sourcePlaceholder() {
    openSourceMine(drawer("Source Mine placeholder", '<p>Source notes, source gathering, quote preparation, and evidence links are not built yet. This confirms the route can reach this chamber after Brief Fog.</p>' + saveInfo(loadState()) + '<button type="button" data-action="return-cave-base">Cave Base</button>', "source-mine"));
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action;
    if (!action && button.dataset.openQuest === "study-skills-trial") {
      event.preventDefault();
      openTaskMap();
      return;
    }
    if (!action && button.dataset.closePanel !== undefined) {
      event.preventDefault();
      closePanels();
      return;
    }
    if (!action) return;
    event.preventDefault();

    if (action === "open-quest-board") return openQuestBoard();
    if (action === "open-task-map") return openTaskMap();
    if (action === "enter-cave-base") return openCaveBase();
    if (action === "continue-quest") {
      var state = loadState();
      return state.current === "source-mine" ? openSourceMine() : openBriefFog();
    }
    if (action === "open-brief-fog") return openBriefFog();
    if (action === "open-source-mine") return openSourceMine();
    if (action === "return-cave-base") return openCaveBase();
    if (action === "close-stage") return openTaskMap();
    if (action === "close-drawer") return closeDrawer(button);
    if (action === "open-task-brief") return openTaskBrief();
    if (action === "save-task") return saveTask("save");
    if (action === "suggest-chunks") return saveTask("append");
    if (action === "replace-chunks") return saveTask("replace");
    if (action === "work-next-chunk") return workNextChunk();
    if (action === "open-chunk") return openChunk(Number(button.dataset.index));
    if (action === "save-chunk") return saveChunk("in progress", false);
    if (action === "save-chunk-next") return saveChunk("in progress", true);
    if (action === "mark-unpacked") return saveChunk("unpacked", false);
    if (action === "mark-unpacked-next") return saveChunk("unpacked", true);
    if (action === "flag-chunk") return saveChunk("flagged", false);
    if (action === "flag-chunk-next") return saveChunk("flagged", true);
    if (action === "missed-chunk") return saveChunk("missed", false);
    if (action === "missed-chunk-next") return saveChunk("missed", true);
    if (action === "open-summary") return openSummary(false);
    if (action === "finish-brief-fog") return finishBriefFog();
    if (action === "export-brief-fog") return exportBriefFog();
    if (action === "show-flags") return showFlags();
    if (action === "show-outfit") return openCaveBase(drawer("Outfit Chest", '<p>Outfit changing is a placeholder here. It should connect to the wardrobe/outfit system later.</p>' + saveInfo(loadState()), "cave-base"));
    if (action === "reset-study-cave-save") return resetSave();
    if (action === "source-placeholder") return sourcePlaceholder();
  });

  document.addEventListener("DOMContentLoaded", function () {
    var state = loadState();
    updateHud(state);
    renderTaskMap(state);
  });
})();