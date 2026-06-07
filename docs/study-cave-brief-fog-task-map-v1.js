(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";

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

  function normaliseText(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function timeStamp() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function loadState() {
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    } catch (error) {
      saved = null;
    }
    if (!saved || typeof saved !== "object") {
      saved = {
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
          chunks: [],
          sceneState: "opening"
        },
        sourceMine: { started: false, sources: [], quotes: [] },
        routeRooms: {}
      };
    }
    saved.completed = safeArray(saved.completed);
    saved.unlocked = safeArray(saved.unlocked).length ? safeArray(saved.unlocked) : ["cave-base", "brief-fog"];
    saved.flags = safeArray(saved.flags);
    saved.missedLoot = safeArray(saved.missedLoot);
    saved.briefFog = saved.briefFog && typeof saved.briefFog === "object" ? saved.briefFog : {};
    saved.briefFog.taskTitle = String(saved.briefFog.taskTitle || saved.questTitle || "Study Skills Trial");
    saved.briefFog.assessmentType = String(saved.briefFog.assessmentType || "practice task");
    saved.briefFog.rawTaskText = String(saved.briefFog.rawTaskText || SAMPLE_TASK);
    saved.briefFog.chunks = safeArray(saved.briefFog.chunks);
    saved.briefFog.chunkTags = saved.briefFog.chunkTags && typeof saved.briefFog.chunkTags === "object" ? saved.briefFog.chunkTags : {};
    saved.sourceMine = saved.sourceMine && typeof saved.sourceMine === "object" ? saved.sourceMine : { started: false, sources: [], quotes: [] };
    saved.sourceMine.sources = safeArray(saved.sourceMine.sources);
    saved.sourceMine.quotes = safeArray(saved.sourceMine.quotes);
    return saved;
  }

  function saveState(state, message) {
    state.lastSavedAt = timeStamp();
    state.lastAction = message || "Saved locally";
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      state.lastAction = "Save failed in this browser";
    }
    document.querySelectorAll("[data-flow-quest-title]").forEach(function (node) { node.textContent = state.questTitle || "Study Skills Trial"; });
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) { node.textContent = safeArray(state.completed).length + " / 7"; });
  }

  function stage() {
    return document.getElementById("stage-scene");
  }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach(function (details) { details.open = false; });
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt || "Not saved yet") + ' · ' + esc(state.lastAction || "Ready") + '</p>';
  }

  function defaultTaskMap() {
    return {
      output: "800-word practice response",
      command: "explain",
      focus: "how",
      subject: "a student",
      process: "use planning, source notes, drafting, proofreading, and referencing habits",
      target: "academic assignment / assignment quality",
      outcome: "improve the quality of an academic assignment",
      buckets: ["planning", "source notes", "drafting", "proofreading", "referencing habits"]
    };
  }

  function inferBuckets(raw) {
    raw = String(raw || "");
    var match = raw.match(/use\s+(.+?)\s+to\s+improve/i);
    var source = match ? match[1] : "";
    if (!source) return defaultTaskMap().buckets.slice();
    source = source.replace(/\band\b/gi, ",");
    return source.split(",").map(function (part) { return normaliseText(part, 80); }).filter(Boolean).slice(0, 10);
  }

  function inferCommand(raw) {
    var found = String(raw || "").match(/\b(explain|analyse|analyze|evaluate|compare|discuss|describe|identify|argue)\b/i);
    return found ? found[1].toLowerCase().replace("analyze", "analyse") : "explain";
  }

  function inferTaskMap(state) {
    var raw = String(state && state.briefFog && state.briefFog.rawTaskText || SAMPLE_TASK);
    var map = defaultTaskMap();
    map.command = inferCommand(raw);
    map.focus = /\bhow\b/i.test(raw) ? "how" : "main focus / angle";
    map.subject = /\bstudent\b/i.test(raw) ? "a student" : "the subject / actor";
    map.output = /800-word/i.test(raw) ? "800-word practice response" : "assignment response";
    map.buckets = inferBuckets(raw);
    map.process = map.buckets.length ? "use " + map.buckets.join(", ") : map.process;
    return map;
  }

  function currentTaskMap(state) {
    state = state || loadState();
    var inferred = inferTaskMap(state);
    var saved = state.briefFog && state.briefFog.taskMap && typeof state.briefFog.taskMap === "object" ? state.briefFog.taskMap : {};
    var map = Object.assign({}, inferred, saved);
    map.buckets = safeArray(saved.buckets).length ? safeArray(saved.buckets).map(function (bucket) { return normaliseText(bucket, 80); }).filter(Boolean) : inferred.buckets;
    if (!map.buckets.length) map.buckets = defaultTaskMap().buckets.slice();
    return map;
  }

  function commandWarning(command) {
    command = normaliseText(command, 80).toLowerCase();
    if (command.indexOf("explain") >= 0) return "Explain means show how/why, not just list points. Source Mine should collect evidence/examples that help you explain each bucket.";
    if (command.indexOf("analyse") >= 0) return "Analyse means break down how parts work and why they matter.";
    if (command.indexOf("compare") >= 0) return "Compare means keep both sides visible and use similarities/differences as the route.";
    if (command.indexOf("evaluate") >= 0) return "Evaluate means judge strength, value, limits, or importance using reasons.";
    if (command.indexOf("discuss") >= 0) return "Discuss means cover more than one angle before reaching a reasoned position.";
    return "Check the command before collecting evidence.";
  }

  function bucketChips(buckets) {
    return '<div class="bf-taskmap-buckets">' + safeArray(buckets).map(function (bucket) {
      return '<span>' + esc(bucket) + '</span>';
    }).join("") + '</div>';
  }

  function mapSummary(map) {
    return '<section class="bf-taskmap-summary">' +
      '<p><strong>The question is asking me to:</strong><br>' + esc(map.command || "explain") + ' ' + esc(map.focus || "how") + ' ' + esc(map.subject || "the subject") + ' can ' + esc(map.process || "use the key process") + ' to ' + esc(map.outcome || "meet the outcome") + '.</p>' +
      '<dl>' +
      '<div><dt>Output</dt><dd>' + esc(map.output) + '</dd></div>' +
      '<div><dt>Command</dt><dd>' + esc(map.command) + '</dd></div>' +
      '<div><dt>Focus</dt><dd>' + esc(map.focus) + '</dd></div>' +
      '<div><dt>Subject</dt><dd>' + esc(map.subject) + '</dd></div>' +
      '<div><dt>Outcome</dt><dd>' + esc(map.outcome) + '</dd></div>' +
      '</dl>' +
      '<h3>Evidence / paragraph buckets</h3>' + bucketChips(map.buckets) +
      '<p class="bf-taskmap-warning"><strong>Command warning:</strong> ' + esc(commandWarning(map.command)) + '</p>' +
      '</section>';
  }

  function drawer(title, body) {
    return '<section class="simple-drawer bf-taskmap-drawer" role="dialog" aria-label="' + esc(title) + '">' +
      '<button type="button" class="simple-close" data-action="bf-taskmap-close" aria-label="Close panel">×</button>' +
      '<h2>' + esc(title) + '</h2>' + body + '</section>';
  }

  function renderTaskMap(extra) {
    var state = loadState();
    var map = currentTaskMap(state);
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    node.innerHTML = '<section class="simple-room brief-fog-room bf-taskmap-room">' +
      '<p class="scene-label">Brief Fog · Quest Compass</p>' +
      '<button type="button" class="bf-taskmap-hotspot bf-taskmap-scroll" data-action="bf-taskmap-edit" data-hotspot-label="Edit Task Map" aria-label="Edit Task Map"></button>' +
      '<button type="button" class="bf-taskmap-hotspot bf-taskmap-fog" data-action="bf-taskmap-confirm" data-hotspot-label="Clear Fog" aria-label="Confirm task map and continue"></button>' +
      '<article class="stage-card simple-card bf-taskmap-card"><h2>Brief Fog</h2>' +
      '<p>This room is now the Quest Compass: understand the assignment, confirm the buckets, then use Source Mine to gather evidence for them.</p>' +
      mapSummary(map) + saveInfo(state) +
      '<div class="simple-actions">' +
      '<button type="button" data-action="bf-taskmap-edit">Edit task map</button>' +
      '<button type="button" data-action="bf-taskmap-confirm">Confirm map → Source Mine</button>' +
      '<button type="button" data-action="bf-taskmap-flag">Flag confusion</button>' +
      '<button type="button" data-action="bf-taskmap-advanced">Advanced chunk view</button>' +
      '<button type="button" data-action="return-cave-base">Cave Base</button>' +
      '</div></article>' + (extra || "") + '</section>';
    addStyle();
  }

  function editForm() {
    var state = loadState();
    var map = currentTaskMap(state);
    var buckets = safeArray(map.buckets).join("\n");
    renderTaskMap(drawer("Edit Task Map", saveInfo(state) +
      '<p>Edit only what helps. Buckets become Source Mine evidence slots.</p>' +
      '<form data-bf-taskmap-form>' +
      '<label>Output<input name="output" value="' + esc(map.output) + '" placeholder="800-word response, presentation, report…"></label>' +
      '<label>Command<input name="command" value="' + esc(map.command) + '" placeholder="explain, analyse, compare, evaluate…"></label>' +
      '<label>Focus<input name="focus" value="' + esc(map.focus) + '" placeholder="how, why, to what extent…"></label>' +
      '<label>Subject / actor<input name="subject" value="' + esc(map.subject) + '" placeholder="student, author, policy, character…"></label>' +
      '<label>Main process<textarea name="process" rows="3" placeholder="What process or method is involved?">' + esc(map.process) + '</textarea></label>' +
      '<label>Target<input name="target" value="' + esc(map.target) + '" placeholder="What is being affected?"></label>' +
      '<label>Outcome<textarea name="outcome" rows="3" placeholder="What result should happen?">' + esc(map.outcome) + '</textarea></label>' +
      '<label>Evidence / paragraph buckets<textarea name="buckets" rows="7" placeholder="One bucket per line">' + esc(buckets) + '</textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="bf-taskmap-save">Save task map</button><button type="button" data-action="bf-taskmap-confirm">Confirm map → Source Mine</button></div>' +
      '</form>'));
  }

  function mapFromForm() {
    var form = document.querySelector("[data-bf-taskmap-form]");
    if (!form) return null;
    var data = new FormData(form);
    return {
      output: normaliseText(data.get("output"), 180),
      command: normaliseText(data.get("command"), 100),
      focus: normaliseText(data.get("focus"), 140),
      subject: normaliseText(data.get("subject"), 160),
      process: normaliseText(data.get("process"), 700),
      target: normaliseText(data.get("target"), 220),
      outcome: normaliseText(data.get("outcome"), 500),
      buckets: String(data.get("buckets") || "").split(/[\n;,]/).map(function (item) { return normaliseText(item, 90); }).filter(Boolean).slice(0, 12)
    };
  }

  function chunkTagsForBucket(map, bucket) {
    return {
      subject: map.subject || "",
      command: map.command || "",
      focus: map.focus || "",
      action: bucket || map.process || "",
      target: map.target || "",
      outcome: map.outcome || "",
      keyAreas: bucket || ""
    };
  }

  function applyTaskMapToState(state, map) {
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.taskMap = map;
    state.briefFog.sceneState = "task-map";
    state.briefFog.chunkTags = state.briefFog.chunkTags && typeof state.briefFog.chunkTags === "object" ? state.briefFog.chunkTags : {};
    state.briefFog.chunks = safeArray(map.buckets).map(function (bucket, index) {
      var id = "bucket-" + normaliseText(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid();
      var chunk = {
        id: id,
        text: bucket,
        plain: "Find evidence/examples for " + bucket + ".",
        action: "Use Source Mine to gather at least one evidence gem for " + bucket + ".",
        state: "unpacked"
      };
      state.briefFog.chunkTags[id] = chunkTagsForBucket(map, bucket);
      return chunk;
    });
    if (!state.briefFog.chunks.length) {
      var fallback = defaultTaskMap().buckets;
      map.buckets = fallback.slice();
      return applyTaskMapToState(state, map);
    }
  }

  function saveMap() {
    var state = loadState();
    var map = mapFromForm() || currentTaskMap(state);
    applyTaskMapToState(state, map);
    saveState(state, "Brief Fog task map saved");
    renderTaskMap(drawer("Task Map Saved", '<p>The fog has been organised into evidence buckets. Source Mine can now use these directly.</p>' + mapSummary(map) + saveInfo(state) + '<div class="simple-actions"><button type="button" data-action="bf-taskmap-edit">Edit again</button><button type="button" data-action="bf-taskmap-confirm">Confirm map → Source Mine</button></div>'));
  }

  function confirmMap() {
    var state = loadState();
    var map = mapFromForm() || currentTaskMap(state);
    applyTaskMapToState(state, map);
    if (state.completed.indexOf("brief-fog") === -1) state.completed.push("brief-fog");
    if (state.unlocked.indexOf("source-mine") === -1) state.unlocked.push("source-mine");
    state.current = "source-mine";
    saveState(state, "Brief Fog cleared; Source Mine unlocked");
    clickAction("open-source-mine");
  }

  function flagConfusion() {
    var state = loadState();
    var map = currentTaskMap(state);
    state.flags = safeArray(state.flags);
    state.flags.push({ id: uid(), text: "Brief Fog confusion: check task map for command " + (map.command || "unknown") + " and buckets " + safeArray(map.buckets).join(", ") });
    saveState(state, "Brief Fog confusion flagged");
    renderTaskMap(drawer("Confusion Flagged", '<p>Flag saved. You can keep the current map and come back later if needed.</p>' + mapSummary(map) + saveInfo(state)));
  }

  function openAdvancedChunks() {
    var state = loadState();
    var map = currentTaskMap(state);
    if (!safeArray(state.briefFog.chunks).length) {
      applyTaskMapToState(state, map);
      saveState(state, "Advanced chunk view opened from task map");
    }
    clickAction("open-chunk", { index: 0 });
  }

  function clickAction(action, attrs) {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) { button.dataset[key] = String(attrs[key]); });
    button.hidden = true;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function addStyle() {
    if (document.querySelector("style[data-bf-taskmap]")) return;
    var style = document.createElement("style");
    style.dataset.bfTaskmap = "true";
    style.textContent = [
      '.bf-taskmap-room .bf-taskmap-card{width:min(540px,44vw)!important;}',
      '.bf-taskmap-summary dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0;}',
      '.bf-taskmap-summary dt{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.78;}',
      '.bf-taskmap-summary dd{margin:2px 0 0;font-weight:800;}',
      '.bf-taskmap-buckets{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px;}',
      '.bf-taskmap-buckets span{display:inline-block;padding:6px 9px;border-radius:999px;background:rgba(255,231,171,.90);color:#2f2118;font-weight:900;}',
      '.bf-taskmap-warning{padding:8px;border-radius:12px;background:rgba(255,231,171,.22);border:1px solid rgba(255,231,171,.42);}',
      '.bf-taskmap-hotspot{position:absolute;z-index:92;border:2px solid rgba(255,224,145,.72);border-radius:18px;background:rgba(255,210,112,.10);box-shadow:0 0 22px rgba(255,210,112,.22),inset 0 0 18px rgba(255,210,112,.08);cursor:pointer;}',
      '.bf-taskmap-hotspot::after{content:attr(data-hotspot-label);position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:6px 9px;border-radius:999px;background:rgba(8,8,18,.78);color:#fff7df;font-weight:900;white-space:nowrap;}',
      '.bf-taskmap-hotspot:hover,.bf-taskmap-hotspot:focus-visible{outline:3px solid rgba(255,240,188,.78);background:rgba(255,210,112,.18);}',
      '.bf-taskmap-scroll{left:16%;top:42%;width:22%;height:18%;}',
      '.bf-taskmap-fog{right:18%;bottom:18%;width:22%;height:22%;}',
      '.bf-taskmap-drawer textarea{min-height:70px;}',
      '@media(max-width:820px){.bf-taskmap-room .bf-taskmap-card{width:calc(100% - 24px)!important;top:auto!important;bottom:12px!important;}.bf-taskmap-summary dl{grid-template-columns:1fr;}.bf-taskmap-scroll{left:10%;top:38%;width:34%;height:16%;}.bf-taskmap-fog{right:8%;bottom:27%;width:31%;height:16%;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function relabelBriefFogButtons() {
    document.querySelectorAll('button[data-action="open-task-brief"]').forEach(function (button) { button.textContent = "Quest Compass"; });
    document.querySelectorAll('button[data-action="work-next-chunk"]').forEach(function (button) { button.textContent = "Edit Task Map"; });
    document.querySelectorAll('button[data-action="open-summary"]').forEach(function (button) { button.textContent = "Task Map Summary"; });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";

    if (["open-task-brief", "work-next-chunk", "open-summary", "finish-brief-fog"].indexOf(action) >= 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === "finish-brief-fog") return confirmMap();
      return renderTaskMap();
    }
    if (action === "bf-taskmap-edit") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return editForm();
    }
    if (action === "bf-taskmap-save") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveMap();
    }
    if (action === "bf-taskmap-confirm") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return confirmMap();
    }
    if (action === "bf-taskmap-flag") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return flagConfusion();
    }
    if (action === "bf-taskmap-advanced") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openAdvancedChunks();
    }
    if (action === "bf-taskmap-close") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderTaskMap();
    }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    relabelBriefFogButtons();
    var observer = new MutationObserver(function () {
      addStyle();
      relabelBriefFogButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
