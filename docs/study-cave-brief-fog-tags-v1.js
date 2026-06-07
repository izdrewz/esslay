(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var TAG_FIELDS = [
    ["subject", "Subject / actor", "Who or what is doing the work?"],
    ["command", "Command", "What instruction is the question giving?"],
    ["focus", "Focus", "What angle or lens controls the answer?"],
    ["action", "Action / process", "What process, habit, method, or strategy is involved?"],
    ["target", "Target", "What object, task, or assignment is being affected?"],
    ["outcome", "Outcome", "What result should happen?"],
    ["keyAreas", "Key areas / evidence buckets", "Planning, sources, drafting, proofreading, referencing…"]
  ];
  var DEFAULT_TAGS = {
    subject: "student",
    command: "explain",
    focus: "how",
    action: "use planning, source notes, drafting, proofreading, and referencing habits",
    target: "academic assignment / assignment quality",
    outcome: "improve quality",
    keyAreas: "planning; source notes; drafting; proofreading; referencing habits"
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

  function normaliseText(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveState(state, message) {
    try {
      state.lastSavedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      state.lastAction = message || state.lastAction || "Saved locally";
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {}
  }

  function chunkForForm(form, state) {
    var index = Number(form.dataset.index);
    var chunks = safeArray(state && state.briefFog && state.briefFog.chunks);
    return chunks[index] || null;
  }

  function chunkTagStore(state) {
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.chunkTags = state.briefFog.chunkTags && typeof state.briefFog.chunkTags === "object" ? state.briefFog.chunkTags : {};
    return state.briefFog.chunkTags;
  }

  function readTagValues(form) {
    var tags = {};
    TAG_FIELDS.forEach(function (field) {
      var input = form.querySelector('[name="chunkTag_' + field[0] + '"]');
      tags[field[0]] = input ? normaliseText(input.value, 500) : "";
    });
    return tags;
  }

  function addUniqueNote(list, text) {
    text = normaliseText(text, 300);
    if (!text) return;
    var exists = safeArray(list).some(function (item) { return normaliseText(item && item.text, 300) === text; });
    if (!exists) list.push({ id: uid(), text: text });
  }

  function saveTagsFromCurrentForm() {
    var form = document.querySelector("[data-chunk-form]");
    if (!form) return;
    var state = loadState();
    var chunk = chunkForForm(form, state);
    if (!chunk || !chunk.id) return;
    var store = chunkTagStore(state);
    store[chunk.id] = readTagValues(form);
    saveState(state, "Chunk tags saved");
    addChunkListTags();
    injectEvidenceBucketHints();
  }

  function saveDraftFromCurrentForm(stateName) {
    var form = document.querySelector("[data-chunk-form]");
    if (!form) return -1;
    var state = loadState();
    state.briefFog = state.briefFog && typeof state.briefFog === "object" ? state.briefFog : {};
    state.briefFog.chunks = safeArray(state.briefFog.chunks);
    var index = Number(form.dataset.index);
    var chunk = state.briefFog.chunks[index];
    if (!chunk) return -1;
    var data = new FormData(form);
    chunk.text = String(data.get("text") || chunk.text || "").slice(0, 1200);
    chunk.plain = String(data.get("plain") || "").slice(0, 1200);
    chunk.action = String(data.get("action") || "").slice(0, 1200);
    if (stateName) chunk.state = stateName;
    if (!chunk.state || chunk.state === "not started") chunk.state = "in progress";
    var store = chunkTagStore(state);
    if (chunk.id) store[chunk.id] = readTagValues(form);
    if (stateName === "flagged") {
      state.flags = safeArray(state.flags);
      addUniqueNote(state.flags, chunk.plain || chunk.text || "Flagged chunk");
    }
    if (stateName === "missed") {
      state.missedLoot = safeArray(state.missedLoot);
      addUniqueNote(state.missedLoot, chunk.action || chunk.text || "Missed chunk");
    }
    saveState(state, "Chunk " + (index + 1) + " saved as " + chunk.state);
    return index;
  }

  function commandWarning(command) {
    command = normaliseText(command, 80).toLowerCase();
    if (!command) return "";
    if (command.indexOf("explain") >= 0) return "Explain means show how/why, not just list points. Each chunk needs a clear reason or process.";
    if (command.indexOf("analyse") >= 0) return "Analyse means break down how parts work and why they matter.";
    if (command.indexOf("compare") >= 0) return "Compare means keep both sides visible and use points of similarity/difference.";
    if (command.indexOf("evaluate") >= 0) return "Evaluate means judge value, strength, limits, or importance using reasons.";
    if (command.indexOf("discuss") >= 0) return "Discuss means cover more than one view or angle before reaching a reasoned position.";
    return "Check what this command asks you to do before gathering sources.";
  }

  function tagMarkup(form, state, chunk) {
    var store = chunkTagStore(state);
    var tags = Object.assign({}, DEFAULT_TAGS, chunk && chunk.id ? store[chunk.id] || {} : {});
    return '<section class="brief-fog-tag-box" data-brief-fog-tag-box>' +
      '<h3>Question tags</h3>' +
      '<p>Use these to label what the chunk is doing. These are optional, but they make Source Mine and Draft Route easier later.</p>' +
      '<div class="brief-fog-tag-grid">' + TAG_FIELDS.map(function (field) {
        return '<label>' + esc(field[1]) + '<input name="chunkTag_' + esc(field[0]) + '" value="' + esc(tags[field[0]] || "") + '" placeholder="' + esc(field[2]) + '"></label>';
      }).join("") + '</div>' +
      '<p class="brief-fog-command-warning"><strong>Command warning:</strong> ' + esc(commandWarning(tags.command)) + '</p>' +
      '<p class="brief-fog-tag-hint"><strong>For this test task:</strong> command = explain; focus = how; subject = student; key areas = planning, source notes, drafting, proofreading, referencing habits; outcome = improve assignment quality.</p>' +
      '</section>';
  }

  function cleanChunkButtons(form) {
    var labels = {
      "save-chunk": "Save",
      "mark-unpacked": "Mark unpacked",
      "flag-chunk-next": "Flag",
      "missed-chunk-next": "Park missed",
      "open-task-brief": "Task Brief",
      "open-summary": "Summary"
    };
    form.querySelectorAll("button[data-action]").forEach(function (button) {
      var action = button.dataset.action;
      if (action === "save-chunk-next" || action === "mark-unpacked-next") {
        button.remove();
        return;
      }
      if (labels[action]) button.textContent = labels[action];
      if (action === "open-chunk") {
        if (/next chunk/i.test(button.textContent || "")) button.textContent = "Next chunk";
        if (/previous chunk/i.test(button.textContent || "")) button.textContent = "Previous chunk";
        button.title = "Saves this chunk before moving.";
      }
    });
  }

  function injectTagBox() {
    var form = document.querySelector("[data-chunk-form]");
    if (!form) return;
    var state = loadState();
    var chunk = chunkForForm(form, state);
    var actions = form.querySelector(".simple-actions");
    if (actions && !form.querySelector("[data-brief-fog-tag-box]")) {
      actions.insertAdjacentHTML("beforebegin", tagMarkup(form, state, chunk));
    }
    var hint = form.querySelector("[data-brief-fog-autosave-hint]");
    if (!hint && actions) {
      actions.insertAdjacentHTML("beforebegin", '<p class="brief-fog-autosave-hint" data-brief-fog-autosave-hint><strong>Auto-save:</strong> Save, Previous, Next, Mark unpacked, Flag, and Park missed all save the current chunk first.</p>');
    }
    cleanChunkButtons(form);
  }

  function shortChip(label, value) {
    value = normaliseText(value, 90);
    return value ? '<span><strong>' + esc(label) + ':</strong> ' + esc(value) + '</span>' : '';
  }

  function addChunkListTags() {
    var state = loadState();
    var chunks = safeArray(state && state.briefFog && state.briefFog.chunks);
    var store = chunkTagStore(state);
    document.querySelectorAll(".chunk-status-list li").forEach(function (li) {
      if (li.querySelector(".brief-fog-tag-chips")) return;
      var button = li.querySelector('button[data-action="open-chunk"]');
      if (!button) return;
      var chunk = chunks[Number(button.dataset.index)];
      if (!chunk || !chunk.id) return;
      var tags = Object.assign({}, DEFAULT_TAGS, store[chunk.id] || {});
      var chips = shortChip("cmd", tags.command) + shortChip("focus", tags.focus) + shortChip("areas", tags.keyAreas);
      if (chips) li.insertAdjacentHTML("beforeend", '<div class="brief-fog-tag-chips">' + chips + '</div>');
    });
  }

  function evidenceBuckets(state) {
    state = state || loadState();
    var chunks = safeArray(state && state.briefFog && state.briefFog.chunks);
    var store = chunkTagStore(state);
    var seen = {};
    var buckets = [];
    chunks.forEach(function (chunk) {
      var tags = chunk && chunk.id ? store[chunk.id] || {} : {};
      String(tags.keyAreas || DEFAULT_TAGS.keyAreas).split(/[;,]/).forEach(function (part) {
        var value = normaliseText(part, 60);
        var key = value.toLowerCase();
        if (value && !seen[key]) {
          seen[key] = true;
          buckets.push(value);
        }
      });
    });
    if (!buckets.length) buckets = DEFAULT_TAGS.keyAreas.split("; ");
    return buckets;
  }

  function injectEvidenceBucketHints() {
    var form = document.querySelector("[data-quote-form]") || document.querySelector("[data-source-form]");
    if (!form || form.querySelector("[data-evidence-bucket-hint]")) return;
    var buckets = evidenceBuckets(loadState());
    form.insertAdjacentHTML("afterbegin", '<section class="evidence-bucket-hint" data-evidence-bucket-hint><h3>Evidence buckets from Brief Fog</h3><p>Try to gather evidence for these areas:</p><div class="brief-fog-tag-chips">' + buckets.map(function (bucket) { return '<span>' + esc(bucket) + '</span>'; }).join("") + '</div></section>');
  }

  function addStyle() {
    if (document.querySelector("style[data-brief-fog-tags]")) return;
    var style = document.createElement("style");
    style.dataset.briefFogTags = "true";
    style.textContent = [
      '.brief-fog-tag-box,.evidence-bucket-hint{margin:12px 0;padding:12px;border-radius:14px;border:1px solid rgba(97,70,45,.24);background:rgba(255,247,229,.76);}',
      '.brief-fog-tag-box h3,.evidence-bucket-hint h3{margin:0 0 6px;color:#2f2118!important;}',
      '.brief-fog-tag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px;}',
      '.brief-fog-tag-grid label{margin:0!important;font-size:.92rem;}',
      '.brief-fog-tag-grid input{margin-top:3px!important;padding:7px!important;}',
      '.brief-fog-tag-hint,.brief-fog-autosave-hint,.brief-fog-command-warning{font-size:.88rem;line-height:1.35;}',
      '.brief-fog-command-warning{padding:8px;border-radius:10px;background:rgba(255,231,171,.62);}',
      '.brief-fog-tag-chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;}',
      '.brief-fog-tag-chips span{display:inline-block;padding:4px 7px;border-radius:999px;background:rgba(44,28,16,.88);color:#fff7df;font-size:.78rem;font-weight:800;}',
      '@media(max-width:720px){.brief-fog-tag-grid{grid-template-columns:1fr;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function passOpenChunk(index) {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "open-chunk";
    button.dataset.index = String(index);
    button.hidden = true;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button) return;
    var action = button.dataset.action || "";
    var form = button.closest("[data-chunk-form]");

    if (form && action === "open-chunk") {
      event.preventDefault();
      event.stopImmediatePropagation();
      saveDraftFromCurrentForm("in progress");
      return passOpenChunk(Number(button.dataset.index));
    }

    if (form && (action === "flag-chunk-next" || action === "missed-chunk-next")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var index = saveDraftFromCurrentForm(action === "flag-chunk-next" ? "flagged" : "missed");
      return passOpenChunk(index >= 0 ? index : Number(form.dataset.index));
    }

    if (form && ["save-chunk", "mark-unpacked", "flag-chunk", "missed-chunk"].indexOf(action) >= 0) {
      saveTagsFromCurrentForm();
    }
  }, true);

  document.addEventListener("input", function (event) {
    if (event.target && String(event.target.name || "").indexOf("chunkTag_") === 0) saveTagsFromCurrentForm();
  });

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    injectTagBox();
    addChunkListTags();
    injectEvidenceBucketHints();
    var observer = new MutationObserver(function () {
      injectTagBox();
      addChunkListTags();
      injectEvidenceBucketHints();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
