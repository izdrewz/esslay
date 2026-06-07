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

  function safeArray(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveState(state) {
    try {
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
      tags[field[0]] = input ? String(input.value || "").slice(0, 500) : "";
    });
    return tags;
  }

  function saveTagsFromCurrentForm() {
    var form = document.querySelector("[data-chunk-form]");
    if (!form) return;
    var state = loadState();
    var chunk = chunkForForm(form, state);
    if (!chunk || !chunk.id) return;
    var store = chunkTagStore(state);
    store[chunk.id] = readTagValues(form);
    state.lastSavedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    state.lastAction = "Chunk tags saved";
    saveState(state);
  }

  function saveDraftFromCurrentForm(stateName) {
    var form = document.querySelector("[data-chunk-form]");
    if (!form) return -1;
    var state = loadState();
    var index = Number(form.dataset.index);
    var chunks = safeArray(state && state.briefFog && state.briefFog.chunks);
    var chunk = chunks[index];
    if (!chunk) return -1;
    var data = new FormData(form);
    chunk.text = String(data.get("text") || chunk.text || "").slice(0, 1200);
    chunk.plain = String(data.get("plain") || "").slice(0, 1200);
    chunk.action = String(data.get("action") || "").slice(0, 1200);
    if (stateName) chunk.state = stateName;
    if (!chunk.state || chunk.state === "not started") chunk.state = "in progress";
    var store = chunkTagStore(state);
    if (chunk.id) store[chunk.id] = readTagValues(form);
    state.lastSavedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    state.lastAction = "Chunk " + (index + 1) + " auto-saved";
    saveState(state);
    return index;
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
      '<p class="brief-fog-tag-hint"><strong>For this test task:</strong> command = explain; focus = how; subject = student; key areas = planning, source notes, drafting, proofreading, referencing habits; outcome = improve assignment quality.</p>' +
      '</section>';
  }

  function injectTagBox() {
    var form = document.querySelector("[data-chunk-form]");
    if (!form || form.querySelector("[data-brief-fog-tag-box]")) return;
    var state = loadState();
    var chunk = chunkForForm(form, state);
    var actions = form.querySelector(".simple-actions");
    if (actions) actions.insertAdjacentHTML("beforebegin", tagMarkup(form, state, chunk));

    var hint = form.querySelector("[data-brief-fog-autosave-hint]");
    if (!hint && actions) {
      actions.insertAdjacentHTML("beforebegin", '<p class="brief-fog-autosave-hint" data-brief-fog-autosave-hint><strong>Auto-save:</strong> Previous, Next, mark, flag, and park actions save the current chunk first.</p>');
    }

    form.querySelectorAll('button[data-action="open-chunk"]').forEach(function (button) {
      if (/next chunk/i.test(button.textContent || "")) button.textContent = "Next chunk";
      if (/previous chunk/i.test(button.textContent || "")) button.textContent = "Previous chunk";
      button.title = "Saves this chunk before moving.";
    });
  }

  function addStyle() {
    if (document.querySelector("style[data-brief-fog-tags]")) return;
    var style = document.createElement("style");
    style.dataset.briefFogTags = "true";
    style.textContent = [
      '.brief-fog-tag-box{margin:12px 0;padding:12px;border-radius:14px;border:1px solid rgba(97,70,45,.24);background:rgba(255,247,229,.76);}',
      '.brief-fog-tag-box h3{margin:0 0 6px;color:#2f2118!important;}',
      '.brief-fog-tag-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px;}',
      '.brief-fog-tag-grid label{margin:0!important;font-size:.92rem;}',
      '.brief-fog-tag-grid input{margin-top:3px!important;padding:7px!important;}',
      '.brief-fog-tag-hint,.brief-fog-autosave-hint{font-size:.88rem;line-height:1.35;}',
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

    if (form && ["save-chunk", "save-chunk-next", "mark-unpacked", "mark-unpacked-next", "flag-chunk", "flag-chunk-next", "missed-chunk", "missed-chunk-next"].indexOf(action) >= 0) {
      saveTagsFromCurrentForm();
    }
  }, true);

  document.addEventListener("input", function (event) {
    if (event.target && String(event.target.name || "").indexOf("chunkTag_") === 0) saveTagsFromCurrentForm();
  });

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    injectTagBox();
    var observer = new MutationObserver(function () { injectTagBox(); });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
