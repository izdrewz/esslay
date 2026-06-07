(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var SAMPLE_TASK = "Write an 800-word practice response explaining how a student can use planning, source notes, drafting, proofreading, and referencing habits to improve the quality of an academic assignment.";
  var ROUTE_ROOMS = [
    ["cave-base", "Cave Base"],
    ["brief-fog", "Brief Fog"],
    ["source-mine", "Source Mine"],
    ["draft-route", "Draft Route"],
    ["paragraph-forge", "Paragraph Forge"],
    ["bridge-hall", "Bridge Hall"],
    ["citation-vault", "Citation Vault"],
    ["polish-pool", "Polish Pool"],
    ["submission-gate", "Submission Gate"]
  ];
  var ROUTE_ONLY = ["draft-route", "paragraph-forge", "bridge-hall", "citation-vault", "polish-pool", "submission-gate"];
  var ROUTE_KEYS = {
    "draft-route": "markers",
    "paragraph-forge": "paragraphs",
    "bridge-hall": "links",
    "citation-vault": "checks",
    "polish-pool": "fixes",
    "submission-gate": "checks"
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function uid() {
    return "test-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  function safeArray(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
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
          routeChoice: "",
          sceneState: "opening"
        },
        sourceMine: { started: false, sources: [], quotes: [] },
        routeRooms: {}
      };
    }
    saved.completed = safeArray(saved.completed);
    saved.unlocked = safeArray(saved.unlocked);
    saved.flags = safeArray(saved.flags);
    saved.missedLoot = safeArray(saved.missedLoot);
    saved.briefFog = saved.briefFog && typeof saved.briefFog === "object" ? saved.briefFog : {};
    saved.briefFog.chunks = safeArray(saved.briefFog.chunks);
    saved.sourceMine = saved.sourceMine && typeof saved.sourceMine === "object" ? saved.sourceMine : { started: false, sources: [], quotes: [] };
    saved.sourceMine.sources = safeArray(saved.sourceMine.sources);
    saved.sourceMine.quotes = safeArray(saved.sourceMine.quotes);
    saved.routeRooms = saved.routeRooms && typeof saved.routeRooms === "object" ? saved.routeRooms : {};
    ROUTE_ONLY.forEach(function (roomId) {
      var key = ROUTE_KEYS[roomId];
      saved.routeRooms[roomId] = saved.routeRooms[roomId] && typeof saved.routeRooms[roomId] === "object" ? saved.routeRooms[roomId] : { started: false };
      saved.routeRooms[roomId].started = Boolean(saved.routeRooms[roomId].started);
      saved.routeRooms[roomId][key] = safeArray(saved.routeRooms[roomId][key]);
    });
    return saved;
  }

  function saveState(state, message) {
    state.lastSavedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    state.lastAction = message || "Test mode update";
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function unlock(state, roomId) {
    if (state.unlocked.indexOf(roomId) === -1) state.unlocked.push(roomId);
  }

  function complete(state, roomId) {
    if (state.completed.indexOf(roomId) === -1) state.completed.push(roomId);
  }

  function clickAction(action) {
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    button.hidden = true;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function ensureMinimumTestData(state) {
    unlock(state, "cave-base");
    unlock(state, "brief-fog");
    unlock(state, "source-mine");
    ROUTE_ONLY.forEach(function (roomId) { unlock(state, roomId); });

    if (!state.briefFog.rawTaskText) state.briefFog.rawTaskText = SAMPLE_TASK;
    if (!state.briefFog.taskTitle) state.briefFog.taskTitle = "Study Skills Trial";
    if (!state.briefFog.chunks.length) {
      state.briefFog.chunks = [
        { id: uid(), text: "Understand the question and split it into parts.", plain: "Work out what the task is asking.", action: "Create task chunks.", state: "unpacked" },
        { id: uid(), text: "Gather sources and evidence for each part.", plain: "Find material that supports the answer.", action: "Mine evidence gems.", state: "unpacked" }
      ];
    }
    complete(state, "brief-fog");

    state.sourceMine.started = true;
    if (!state.sourceMine.sources.length) {
      state.sourceMine.sources.push({ id: uid(), title: "Test source", author: "Test mode", details: "Temporary test source detail", use: "Used to check Source Mine and later room unlocks" });
    }
    if (!state.sourceMine.quotes.length) {
      state.sourceMine.quotes.push({ id: uid(), sourceId: state.sourceMine.sources[0].id, chunkIndex: 0, text: "Test evidence gem", meaning: "Temporary evidence meaning", use: "Used to test room progression", state: "saved" });
    }

    ROUTE_ONLY.forEach(function (roomId) {
      var key = ROUTE_KEYS[roomId];
      state.routeRooms[roomId].started = true;
      if (!state.routeRooms[roomId][key].length) {
        state.routeRooms[roomId][key].push({ id: uid(), title: "Test item", detail: "Temporary test detail for " + roomId, note: "This can be deleted by resetting the Study Cave save." });
      }
    });
  }

  function openRoom(roomId) {
    var state = loadState();
    unlock(state, roomId);
    state.current = roomId;
    saveState(state, "Test mode opened " + roomId);

    if (roomId === "cave-base") return clickAction("enter-cave-base");
    if (roomId === "brief-fog") return clickAction("open-brief-fog");
    if (roomId === "source-mine") {
      unlock(state, "source-mine");
      state.current = "source-mine";
      saveState(state, "Test mode opened source-mine");
      return clickAction("open-source-mine");
    }
    return clickAction("continue-quest");
  }

  function panelMarkup() {
    return '<section class="study-cave-test-panel" role="dialog" aria-label="Study Cave test mode">' +
      '<button type="button" class="study-cave-test-close" data-test-action="close" aria-label="Close test mode">×</button>' +
      '<h2>Test Mode</h2>' +
      '<p>Open rooms directly without playing the full route. This is for checking images, routing, and basic room shells.</p>' +
      '<div class="study-cave-test-grid">' + ROUTE_ROOMS.map(function (room) {
        return '<button type="button" data-test-action="open-room" data-test-room="' + esc(room[0]) + '">' + esc(room[1]) + '</button>';
      }).join("") + '</div>' +
      '<div class="study-cave-test-actions">' +
      '<button type="button" data-test-action="seed">Unlock + seed test data</button>' +
      '<button type="button" data-test-action="open-room" data-test-room="submission-gate">Jump to final room</button>' +
      '</div>' +
      '<p class="study-cave-test-note">Seed test data writes temporary items to the browser save. Use the normal Reset save button to clear them.</p>' +
      '</section>';
  }

  function openPanel() {
    closePanel();
    document.body.insertAdjacentHTML("beforeend", panelMarkup());
  }

  function closePanel() {
    document.querySelectorAll(".study-cave-test-panel").forEach(function (node) { node.remove(); });
  }

  function ensureLauncher() {
    if (document.querySelector(".study-cave-test-launcher")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "study-cave-test-launcher";
    button.dataset.testAction = "open";
    button.textContent = "Test Mode";
    document.body.appendChild(button);
  }

  function addStyle() {
    if (document.querySelector("style[data-study-cave-test-mode]")) return;
    var style = document.createElement("style");
    style.dataset.studyCaveTestMode = "true";
    style.textContent = [
      '.study-cave-test-launcher{position:fixed;right:14px;bottom:14px;z-index:9999;border:1px solid rgba(255,232,174,.85);border-radius:999px;padding:9px 13px;background:rgba(16,10,8,.88);color:#fff7df;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer;}',
      '.study-cave-test-panel{position:fixed;right:14px;bottom:62px;z-index:10000;width:min(460px,calc(100vw - 28px));max-height:calc(100vh - 82px);overflow:auto;padding:16px;border-radius:18px;border:2px solid rgba(255,224,145,.72);background:rgba(250,242,225,.98);color:#2f2118;box-shadow:0 22px 70px rgba(0,0,0,.45);}',
      '.study-cave-test-panel h2{margin:0 42px 8px 0;color:#2f2118;}',
      '.study-cave-test-close{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:999px;border:1px solid rgba(97,70,45,.24);background:#fff;color:#2f2118;font-weight:900;cursor:pointer;}',
      '.study-cave-test-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:12px 0;}',
      '.study-cave-test-grid button,.study-cave-test-actions button{border:1px solid rgba(97,70,45,.34);border-radius:12px;padding:9px 10px;background:rgba(44,28,16,.92);color:#fff7df;font-weight:800;cursor:pointer;text-align:left;}',
      '.study-cave-test-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}',
      '.study-cave-test-note{font-size:.86rem;opacity:.78;}'
    ].join('');
    document.head.appendChild(style);
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button");
    if (!button || !button.dataset.testAction) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    var action = button.dataset.testAction;
    if (action === "open") return openPanel();
    if (action === "close") return closePanel();
    if (action === "seed") {
      var state = loadState();
      ensureMinimumTestData(state);
      saveState(state, "Test mode seeded full route");
      openPanel();
      return;
    }
    if (action === "open-room") {
      closePanel();
      return openRoom(button.dataset.testRoom || "cave-base");
    }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    ensureLauncher();
    try {
      if (new URLSearchParams(window.location.search).get("test") === "1") openPanel();
    } catch (error) {}
  });
})();
