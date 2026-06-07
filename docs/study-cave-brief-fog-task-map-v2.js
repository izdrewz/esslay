(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";

  var COMMANDS = {
    explain: "show how or why something works; do not just list points",
    analyse: "break the topic into parts and show how the parts work or matter",
    evaluate: "judge value, strength, limits, or importance using reasons",
    compare: "show similarities and differences using the same points of comparison",
    discuss: "cover more than one angle before reaching a reasoned position",
    describe: "give the key features clearly",
    identify: "name the relevant features, causes, examples, or issues",
    argue: "make a clear position and support it with reasons"
  };

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

  function clean(value, limit) {
    return String(value || "").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim().slice(0, limit || 600);
  }

  function lower(value) {
    return clean(value, 10000).toLowerCase();
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
    try { saved = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (error) { saved = null; }
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
    saved.briefFog.taskTitle = clean(saved.briefFog.taskTitle || saved.questTitle || "Study Skills Trial", 160);
    saved.briefFog.assessmentType = clean(saved.briefFog.assessmentType || "practice task", 160);
    saved.briefFog.rawTaskText = String(saved.briefFog.rawTaskText || SAMPLE_TASK).slice(0, 9000);
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
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (error) { state.lastAction = "Save failed in this browser"; }
    document.querySelectorAll("[data-flow-quest-title]").forEach(function (node) { node.textContent = state.questTitle || "Study Skills Trial"; });
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) { node.textContent = safeArray(state.completed).length + " / 7"; });
  }

  function stage() { return document.getElementById("stage-scene"); }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach(function (details) { details.open = false; });
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt || "Not saved yet") + ' · ' + esc(state.lastAction || "Ready") + '</p>';
  }

  function defaultMap() {
    return {
      output: "800-word practice response",
      command: "explain",
      focus: "how",
      subject: "a student",
      process: "use planning, source notes, drafting, proofreading, and referencing habits",
      target: "academic assignment / assignment quality",
      outcome: "improve the quality of an academic assignment",
      buckets: ["planning", "source notes", "drafting", "proofreading", "referencing habits"],
      confidence: 92,
      confidenceLabel: "high",
      reasons: [
        "Found the command/focus phrase: explaining how.",
        "Found subject/process pattern: a student can use.",
        "Used the list before to improve as evidence buckets.",
        "Used the phrase after to improve as the outcome."
      ],
      warnings: [],
      answerShape: [
        "Use one clear section or paragraph route for each bucket.",
        "For each bucket, show how it improves assignment quality.",
        "Gather an example, quote, or reason for each bucket in Source Mine."
      ]
    };
  }

  function splitList(value) {
    value = clean(value, 1000);
    value = value.replace(/\b(such as|including|for example|e\.g\.)\b/gi, "");
    value = value.replace(/\band\b/gi, ",");
    return value.split(/[,;\/]+/).map(function (part) {
      return clean(part.replace(/^or\s+/i, "").replace(/^and\s+/i, ""), 90);
    }).filter(function (part) {
      return part && !/^(how|why|whether|what|which|the|a|an|can|could|should|would)$/i.test(part);
    }).slice(0, 12);
  }

  function firstMatch(raw, patterns) {
    var i;
    for (i = 0; i < patterns.length; i += 1) {
      var match = raw.match(patterns[i]);
      if (match) return match;
    }
    return null;
  }

  function findCommand(raw, reasons) {
    var text = lower(raw);
    var keys = Object.keys(COMMANDS);
    var i;
    for (i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var pattern = new RegExp("\\b" + (key === "analyse" ? "analyse|analyze" : key) + "(?:ing|s|d)?\\b", "i");
      if (pattern.test(text)) {
        reasons.push("Found command word: " + key + ".");
        return key;
      }
    }
    reasons.push("No clear command word found, so I defaulted to explain.");
    return "explain";
  }

  function findFocus(raw, reasons) {
    var text = lower(raw);
    var options = ["to what extent", "in what ways", "how far", "how", "why", "whether", "the extent to which"];
    var i;
    for (i = 0; i < options.length; i += 1) {
      if (text.indexOf(options[i]) >= 0) {
        reasons.push("Found focus phrase: " + options[i] + ".");
        return options[i];
      }
    }
    reasons.push("No obvious focus phrase found; set focus to main angle.");
    return "main angle";
  }

  function findOutput(raw, reasons) {
    var text = clean(raw, 9000);
    var wordCount = text.match(/\b(\d{2,5})\s*(?:-|\s)?word\b/i);
    var product = text.match(/\b(essay|response|report|reflection|presentation|review|case study|portfolio|proposal|poster)\b/i);
    if (wordCount && product) {
      reasons.push("Found output: " + wordCount[1] + "-word " + product[1].toLowerCase() + ".");
      return wordCount[1] + "-word " + product[1].toLowerCase();
    }
    if (wordCount) {
      reasons.push("Found word count: " + wordCount[1] + " words.");
      return wordCount[1] + "-word assignment response";
    }
    if (product) {
      reasons.push("Found output type: " + product[1].toLowerCase() + ".");
      return product[1].toLowerCase();
    }
    reasons.push("No output type found; using assignment response.");
    return "assignment response";
  }

  function findSubject(raw, reasons) {
    var text = clean(raw, 9000);
    var match = firstMatch(text, [
      /how\s+(.+?)\s+can\s+(?:use|apply|develop|improve|create|build)\b/i,
      /why\s+(.+?)\s+(?:can|should|might|must)\b/i,
      /(?:explain|analyse|analyze|evaluate|discuss|describe)\s+(?:how|why)?\s*(.+?)\s+can\s+(?:use|apply|develop|improve|create|build)\b/i,
      /(?:impact|effect|role)\s+of\s+(.+?)\s+(?:on|in|for)\b/i
    ]);
    if (match && clean(match[1], 180)) {
      reasons.push("Found subject/actor pattern: " + clean(match[1], 180) + ".");
      return clean(match[1], 180);
    }
    if (/\bstudents?\b/i.test(text)) {
      reasons.push("Found likely subject: student.");
      return "a student";
    }
    reasons.push("No clear subject found; user should check this field.");
    return "subject / actor to check";
  }

  function findProcess(raw, reasons) {
    var text = clean(raw, 9000);
    var match = firstMatch(text, [
      /can\s+use\s+(.+?)\s+to\s+(?:improve|develop|support|create|build|achieve)\b/i,
      /use\s+(.+?)\s+to\s+(?:improve|develop|support|create|build|achieve)\b/i,
      /using\s+(.+?)\s+to\s+(?:improve|develop|support|create|build|achieve)\b/i,
      /(?:including|such as)\s+(.+?)(?:\.|\?|$)/i
    ]);
    if (match && clean(match[1], 700)) {
      reasons.push("Found process/list before the outcome: " + clean(match[1], 180) + ".");
      return clean(match[1], 700);
    }
    reasons.push("No clear process list found; buckets may need editing.");
    return "main process / method to check";
  }

  function findOutcome(raw, reasons) {
    var text = clean(raw, 9000);
    var match = firstMatch(text, [
      /\bto\s+(improve\s+.+?)(?:\.|\?|$)/i,
      /\bto\s+(develop\s+.+?)(?:\.|\?|$)/i,
      /\bto\s+(support\s+.+?)(?:\.|\?|$)/i,
      /\bso\s+that\s+(.+?)(?:\.|\?|$)/i,
      /\bin\s+order\s+to\s+(.+?)(?:\.|\?|$)/i
    ]);
    if (match && clean(match[1], 500)) {
      reasons.push("Found outcome phrase: " + clean(match[1], 180) + ".");
      return clean(match[1], 500);
    }
    reasons.push("No clear outcome found; user should check this field.");
    return "outcome to check";
  }

  function findTarget(outcome, raw, reasons) {
    var match = clean(outcome, 500).match(/\b(?:of|for|in|on)\s+(.+)$/i);
    if (match && clean(match[1], 220)) {
      reasons.push("Found target inside the outcome: " + clean(match[1], 160) + ".");
      return clean(match[1], 220);
    }
    if (/assignment/i.test(raw)) return "academic assignment / assignment quality";
    return "target to check";
  }

  function findBuckets(process, raw, reasons) {
    var buckets = splitList(process);
    if (buckets.length > 1) {
      reasons.push("Split the process list into " + buckets.length + " evidence buckets.");
      return buckets;
    }
    var includeMatch = clean(raw, 9000).match(/(?:including|such as)\s+(.+?)(?:\.|\?|$)/i);
    if (includeMatch) {
      buckets = splitList(includeMatch[1]);
      if (buckets.length) {
        reasons.push("Used the including/such as list as evidence buckets.");
        return buckets;
      }
    }
    if (buckets.length === 1 && buckets[0] !== "main process / method to check") {
      reasons.push("Only one bucket found; user may want to split it further.");
      return buckets;
    }
    reasons.push("Could not extract buckets confidently; used editable starter buckets.");
    return ["main point 1", "main point 2", "main point 3"];
  }

  function answerShape(command, buckets, outcome) {
    var base = [];
    if (command === "explain") base.push("For each bucket, show how it helps with " + clean(outcome, 120) + ".");
    else if (command === "analyse") base.push("For each bucket, break down how it works and why it matters.");
    else if (command === "evaluate") base.push("For each bucket, judge how strong or useful it is, not just what it is.");
    else if (command === "compare") base.push("Use the same comparison point across each side, not separate unrelated paragraphs.");
    else base.push("Use each bucket as a section, source target, or paragraph route marker.");
    base.push("Source Mine should gather at least one example, quote, paraphrase, or reason for each bucket.");
    base.push("Draft Route should arrange the buckets into the clearest answer order.");
    if (safeArray(buckets).length > 5) base.push("There are more than five buckets; consider combining smaller ones for an 800-word response.");
    return base;
  }

  function confidenceLabel(score) {
    if (score >= 80) return "high";
    if (score >= 55) return "medium";
    return "needs check";
  }

  function parseTask(raw) {
    raw = clean(raw || SAMPLE_TASK, 9000);
    var reasons = [];
    var warnings = [];
    var command = findCommand(raw, reasons);
    var focus = findFocus(raw, reasons);
    var output = findOutput(raw, reasons);
    var subject = findSubject(raw, reasons);
    var process = findProcess(raw, reasons);
    var outcome = findOutcome(raw, reasons);
    var target = findTarget(outcome, raw, reasons);
    var buckets = findBuckets(process, raw, reasons);
    var score = 35;
    if (command !== "explain" || /explain|explaining/i.test(raw)) score += 12;
    if (focus !== "main angle") score += 10;
    if (output !== "assignment response") score += 10;
    if (subject.indexOf("check") === -1) score += 10;
    if (process.indexOf("check") === -1) score += 10;
    if (outcome.indexOf("check") === -1) score += 10;
    if (buckets.length >= 2 && !/^main point/.test(buckets[0])) score += 13;
    if (buckets.length > 6) warnings.push("Many buckets detected; the answer may need grouping.");
    if (subject.indexOf("check") >= 0 || outcome.indexOf("check") >= 0) warnings.push("Some fields are uncertain. Check the map before continuing.");
    if (score > 96) score = 96;
    return {
      output: output,
      command: command,
      focus: focus,
      subject: subject,
      process: process,
      target: target,
      outcome: outcome,
      buckets: buckets,
      confidence: score,
      confidenceLabel: confidenceLabel(score),
      reasons: reasons,
      warnings: warnings,
      answerShape: answerShape(command, buckets, outcome)
    };
  }

  function currentMap(state) {
    state = state || loadState();
    var inferred = parseTask(state.briefFog && state.briefFog.rawTaskText || SAMPLE_TASK);
    var saved = state.briefFog && state.briefFog.taskMap && typeof state.briefFog.taskMap === "object" ? state.briefFog.taskMap : {};
    var map = Object.assign({}, inferred, saved);
    map.buckets = safeArray(saved.buckets).length ? safeArray(saved.buckets).map(function (bucket) { return clean(bucket, 90); }).filter(Boolean) : inferred.buckets;
    map.reasons = safeArray(saved.reasons).length ? safeArray(saved.reasons) : inferred.reasons;
    map.warnings = safeArray(saved.warnings).length ? safeArray(saved.warnings) : inferred.warnings;
    map.answerShape = safeArray(saved.answerShape).length ? safeArray(saved.answerShape) : inferred.answerShape;
    map.confidence = Number(saved.confidence || inferred.confidence || 50);
    map.confidenceLabel = saved.confidenceLabel || confidenceLabel(map.confidence);
    return map;
  }

  function commandWarning(command) {
    command = clean(command, 80).toLowerCase();
    return COMMANDS[command] || "check what this command asks you to do before collecting evidence";
  }

  function bucketChips(buckets) {
    return '<div class="bf-taskmap-buckets">' + safeArray(buckets).map(function (bucket) { return '<span>' + esc(bucket) + '</span>'; }).join("") + '</div>';
  }

  function list(items) {
    return '<ul>' + safeArray(items).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join("") + '</ul>';
  }

  function mapSummary(map) {
    return '<section class="bf-taskmap-summary">' +
      '<div class="bf-confidence bf-confidence-' + esc(map.confidenceLabel || "medium") + '"><strong>Parser confidence:</strong> ' + esc(map.confidenceLabel || "medium") + ' · ' + esc(map.confidence || 0) + '%</div>' +
      '<p><strong>The question is asking me to:</strong><br>' + esc(map.command || "explain") + ' ' + esc(map.focus || "how") + ' ' + esc(map.subject || "the subject") + ' can ' + esc(map.process || "use the key process") + ' to ' + esc(map.outcome || "meet the outcome") + '.</p>' +
      '<dl>' +
      '<div><dt>Output</dt><dd>' + esc(map.output) + '</dd></div>' +
      '<div><dt>Command</dt><dd>' + esc(map.command) + '</dd></div>' +
      '<div><dt>Focus</dt><dd>' + esc(map.focus) + '</dd></div>' +
      '<div><dt>Subject</dt><dd>' + esc(map.subject) + '</dd></div>' +
      '<div><dt>Process</dt><dd>' + esc(map.process) + '</dd></div>' +
      '<div><dt>Outcome</dt><dd>' + esc(map.outcome) + '</dd></div>' +
      '</dl>' +
      '<h3>Evidence / paragraph buckets</h3>' + bucketChips(map.buckets) +
      '<details class="bf-taskmap-details"><summary>Why the parser chose this</summary>' + list(map.reasons) + '</details>' +
      '<details class="bf-taskmap-details"><summary>What this means for the essay</summary>' + list(map.answerShape) + '</details>' +
      (safeArray(map.warnings).length ? '<div class="bf-taskmap-warning"><strong>Check:</strong>' + list(map.warnings) + '</div>' : '') +
      '<p class="bf-taskmap-warning"><strong>Command rule:</strong> ' + esc(commandWarning(map.command)) + '</p>' +
      '</section>';
  }

  function drawer(title, body) {
    return '<section class="simple-drawer bf-taskmap-drawer" role="dialog" aria-label="' + esc(title) + '"><button type="button" class="simple-close" data-action="bf-taskmap-close" aria-label="Close panel">×</button><h2>' + esc(title) + '</h2>' + body + '</section>';
  }

  function render(extra) {
    var state = loadState();
    var map = currentMap(state);
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    node.innerHTML = '<section class="simple-room brief-fog-room bf-taskmap-room">' +
      '<p class="scene-label">Brief Fog · Quest Compass</p>' +
      '<button type="button" class="bf-taskmap-hotspot bf-taskmap-scroll" data-action="bf-taskmap-edit" data-hotspot-label="Edit Map" aria-label="Edit Task Map"></button>' +
      '<button type="button" class="bf-taskmap-hotspot bf-taskmap-fog" data-action="bf-taskmap-confirm" data-hotspot-label="Clear Fog" aria-label="Confirm task map and continue"></button>' +
      '<article class="stage-card simple-card bf-taskmap-card"><h2>Brief Fog</h2>' +
      '<p>The Quest Compass reads the task brief, explains why it mapped it this way, and turns the assignment into Source Mine evidence slots.</p>' +
      mapSummary(map) + saveInfo(state) +
      '<div class="simple-actions"><button type="button" data-action="bf-taskmap-edit">Edit map</button><button type="button" data-action="bf-taskmap-reparse">Re-read brief</button><button type="button" data-action="bf-taskmap-confirm">Confirm map → Source Mine</button><button type="button" data-action="bf-taskmap-flag">Flag confusion</button><button type="button" data-action="bf-taskmap-advanced">Advanced chunk view</button><button type="button" data-action="return-cave-base">Cave Base</button></div></article>' + (extra || "") + '</section>';
    addStyle();
  }

  function editForm() {
    var state = loadState();
    var map = currentMap(state);
    render(drawer("Edit Quest Compass", saveInfo(state) +
      '<p>Edit the map, or change the raw task and press Re-read brief. Buckets become Source Mine evidence slots.</p>' +
      '<form data-bf-taskmap-form>' +
      '<label>Raw task brief<textarea name="rawTaskText" rows="5">' + esc(state.briefFog.rawTaskText || SAMPLE_TASK) + '</textarea></label>' +
      '<label>Output<input name="output" value="' + esc(map.output) + '"></label>' +
      '<label>Command<input name="command" value="' + esc(map.command) + '"></label>' +
      '<label>Focus<input name="focus" value="' + esc(map.focus) + '"></label>' +
      '<label>Subject / actor<input name="subject" value="' + esc(map.subject) + '"></label>' +
      '<label>Main process<textarea name="process" rows="3">' + esc(map.process) + '</textarea></label>' +
      '<label>Target<input name="target" value="' + esc(map.target) + '"></label>' +
      '<label>Outcome<textarea name="outcome" rows="3">' + esc(map.outcome) + '</textarea></label>' +
      '<label>Evidence / paragraph buckets<textarea name="buckets" rows="7">' + esc(safeArray(map.buckets).join("\n")) + '</textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="bf-taskmap-save">Save map</button><button type="button" data-action="bf-taskmap-reparse">Re-read brief</button><button type="button" data-action="bf-taskmap-confirm">Confirm map → Source Mine</button></div>' +
      '</form>'));
  }

  function mapFromForm(useParser) {
    var form = document.querySelector("[data-bf-taskmap-form]");
    if (!form) return null;
    var data = new FormData(form);
    var raw = String(data.get("rawTaskText") || SAMPLE_TASK).slice(0, 9000);
    if (useParser) return parseTask(raw);
    return {
      output: clean(data.get("output"), 180),
      command: clean(data.get("command"), 100),
      focus: clean(data.get("focus"), 140),
      subject: clean(data.get("subject"), 160),
      process: clean(data.get("process"), 700),
      target: clean(data.get("target"), 220),
      outcome: clean(data.get("outcome"), 500),
      buckets: String(data.get("buckets") || "").split(/[\n;,]/).map(function (item) { return clean(item, 90); }).filter(Boolean).slice(0, 12),
      confidence: 100,
      confidenceLabel: "edited",
      reasons: ["User edited and approved this map."],
      warnings: [],
      answerShape: answerShape(clean(data.get("command"), 100), String(data.get("buckets") || "").split(/[\n;,]/), clean(data.get("outcome"), 500))
    };
  }

  function chunkTagsForBucket(map, bucket) {
    return { subject: map.subject || "", command: map.command || "", focus: map.focus || "", action: bucket || map.process || "", target: map.target || "", outcome: map.outcome || "", keyAreas: bucket || "" };
  }

  function bucketId(bucket, index) {
    var stem = clean(bucket, 80).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return stem ? "bucket-" + stem : "bucket-" + index + "-" + uid();
  }

  function applyMap(state, map) {
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.taskMap = map;
    state.briefFog.sceneState = "task-map";
    state.briefFog.chunkTags = state.briefFog.chunkTags && typeof state.briefFog.chunkTags === "object" ? state.briefFog.chunkTags : {};
    state.briefFog.chunks = safeArray(map.buckets).map(function (bucket, index) {
      var id = bucketId(bucket, index);
      state.briefFog.chunkTags[id] = chunkTagsForBucket(map, bucket);
      return { id: id, text: bucket, plain: "Find evidence/examples for " + bucket + ".", action: "Use Source Mine to gather at least one evidence gem for " + bucket + ".", state: "unpacked" };
    });
    if (!state.briefFog.chunks.length) {
      map.buckets = defaultMap().buckets.slice();
      return applyMap(state, map);
    }
  }

  function saveMap(useParser, thenConfirm) {
    var state = loadState();
    var form = document.querySelector("[data-bf-taskmap-form]");
    if (form) {
      var data = new FormData(form);
      state.briefFog.rawTaskText = String(data.get("rawTaskText") || state.briefFog.rawTaskText || SAMPLE_TASK).slice(0, 9000);
    }
    var map = mapFromForm(useParser) || currentMap(state);
    if (useParser) map = parseTask(state.briefFog.rawTaskText || SAMPLE_TASK);
    applyMap(state, map);
    saveState(state, useParser ? "Brief Fog parser re-read the task" : "Brief Fog task map saved");
    if (thenConfirm) return confirmMap(state, map);
    render(drawer(useParser ? "Brief Re-read" : "Task Map Saved", '<p>The Quest Compass is ready. Check the map once, then continue to Source Mine.</p>' + mapSummary(map) + saveInfo(state) + '<div class="simple-actions"><button type="button" data-action="bf-taskmap-edit">Edit map</button><button type="button" data-action="bf-taskmap-confirm">Confirm map → Source Mine</button></div>'));
  }

  function confirmMap(existingState, existingMap) {
    var state = existingState || loadState();
    var map = existingMap || mapFromForm(false) || currentMap(state);
    applyMap(state, map);
    if (state.completed.indexOf("brief-fog") === -1) state.completed.push("brief-fog");
    if (state.unlocked.indexOf("source-mine") === -1) state.unlocked.push("source-mine");
    state.current = "source-mine";
    saveState(state, "Brief Fog cleared; Source Mine unlocked");
    clickAction("open-source-mine");
  }

  function flagConfusion() {
    var state = loadState();
    var map = currentMap(state);
    state.flags = safeArray(state.flags);
    state.flags.push({ id: uid(), text: "Brief Fog confusion: check " + (map.command || "command") + " task with buckets " + safeArray(map.buckets).join(", ") });
    saveState(state, "Brief Fog confusion flagged");
    render(drawer("Confusion Flagged", '<p>Flag saved. You can still use or edit the current map.</p>' + mapSummary(map) + saveInfo(state)));
  }

  function openAdvancedChunks() {
    var state = loadState();
    var map = currentMap(state);
    if (!safeArray(state.briefFog.chunks).length) {
      applyMap(state, map);
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
    if (document.querySelector("style[data-bf-taskmap-v2]")) return;
    var style = document.createElement("style");
    style.dataset.bfTaskmapV2 = "true";
    style.textContent = [
      '.bf-taskmap-room .bf-taskmap-card{width:min(590px,47vw)!important;}',
      '.bf-taskmap-summary dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0;}',
      '.bf-taskmap-summary dt{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;opacity:.78;}',
      '.bf-taskmap-summary dd{margin:2px 0 0;font-weight:800;}',
      '.bf-taskmap-buckets{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px;}',
      '.bf-taskmap-buckets span{display:inline-block;padding:6px 9px;border-radius:999px;background:rgba(255,231,171,.90);color:#2f2118;font-weight:900;}',
      '.bf-confidence{padding:8px 10px;border-radius:12px;background:rgba(22,38,28,.82);color:#e7ffdc;margin-bottom:8px;}',
      '.bf-confidence-medium{background:rgba(95,65,18,.86);}.bf-confidence-needs\ check{background:rgba(92,34,34,.88);}.bf-confidence-edited{background:rgba(47,43,92,.88);}',
      '.bf-taskmap-warning{padding:8px;border-radius:12px;background:rgba(255,231,171,.22);border:1px solid rgba(255,231,171,.42);}',
      '.bf-taskmap-details{margin:8px 0;padding:8px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);}',
      '.bf-taskmap-details summary{cursor:pointer;font-weight:900;}',
      '.bf-taskmap-hotspot{position:absolute;z-index:92;border:2px solid rgba(255,224,145,.72);border-radius:18px;background:rgba(255,210,112,.10);box-shadow:0 0 22px rgba(255,210,112,.22),inset 0 0 18px rgba(255,210,112,.08);cursor:pointer;}',
      '.bf-taskmap-hotspot::after{content:attr(data-hotspot-label);position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:6px 9px;border-radius:999px;background:rgba(8,8,18,.78);color:#fff7df;font-weight:900;white-space:nowrap;}',
      '.bf-taskmap-hotspot:hover,.bf-taskmap-hotspot:focus-visible{outline:3px solid rgba(255,240,188,.78);background:rgba(255,210,112,.18);}',
      '.bf-taskmap-scroll{left:16%;top:42%;width:22%;height:18%;}.bf-taskmap-fog{right:18%;bottom:18%;width:22%;height:22%;}',
      '.bf-taskmap-drawer textarea{min-height:70px;}',
      '@media(max-width:820px){.bf-taskmap-room .bf-taskmap-card{width:calc(100% - 24px)!important;top:auto!important;bottom:12px!important;}.bf-taskmap-summary dl{grid-template-columns:1fr;}.bf-taskmap-scroll{left:10%;top:38%;width:34%;height:16%;}.bf-taskmap-fog{right:8%;bottom:27%;width:31%;height:16%;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function relabelBriefFogButtons() {
    document.querySelectorAll('button[data-action="open-task-brief"]').forEach(function (button) { button.textContent = "Quest Compass"; });
    document.querySelectorAll('button[data-action="work-next-chunk"]').forEach(function (button) { button.textContent = "Edit Quest Compass"; });
    document.querySelectorAll('button[data-action="open-summary"]').forEach(function (button) { button.textContent = "Compass Summary"; });
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (["open-task-brief", "work-next-chunk", "open-summary", "finish-brief-fog"].indexOf(action) >= 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === "finish-brief-fog") return confirmMap();
      return render();
    }
    if (action === "bf-taskmap-edit") { event.preventDefault(); event.stopImmediatePropagation(); return editForm(); }
    if (action === "bf-taskmap-save") { event.preventDefault(); event.stopImmediatePropagation(); return saveMap(false, false); }
    if (action === "bf-taskmap-reparse") { event.preventDefault(); event.stopImmediatePropagation(); return saveMap(true, false); }
    if (action === "bf-taskmap-confirm") { event.preventDefault(); event.stopImmediatePropagation(); return saveMap(false, true); }
    if (action === "bf-taskmap-flag") { event.preventDefault(); event.stopImmediatePropagation(); return flagConfusion(); }
    if (action === "bf-taskmap-advanced") { event.preventDefault(); event.stopImmediatePropagation(); return openAdvancedChunks(); }
    if (action === "bf-taskmap-close") { event.preventDefault(); event.stopImmediatePropagation(); return render(); }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    relabelBriefFogButtons();
    var observer = new MutationObserver(function () { addStyle(); relabelBriefFogButtons(); });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
