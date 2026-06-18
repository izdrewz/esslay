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
    if (roomId === "draft-route") return clickAction("open-draft-route");
    if (roomId === "paragraph-forge") return clickAction("open-paragraph-forge");
    return clickAction("continue-quest");
  }

  function unresolvedChunks(state) {
    return safeArray(state.briefFog.chunks).filter(function (chunk) {
      return ["unpacked", "flagged", "missed"].indexOf(String(chunk.state || "")) === -1;
    });
  }

  function currentRoomLabel(state) {
    var id = state.current || (state.completed.indexOf("brief-fog") >= 0 ? "source-mine" : "brief-fog");
    var found = ROUTE_ROOMS.find(function (room) { return room[0] === id; });
    return found ? found[1] : "Study Cave";
  }

  function coachModel() {
    var state = loadState();
    var chunks = safeArray(state.briefFog.chunks);
    var unresolved = unresolvedChunks(state);
    var sources = safeArray(state.sourceMine.sources);
    var quotes = safeArray(state.sourceMine.quotes);
    var flags = safeArray(state.flags);
    var missed = safeArray(state.missedLoot);
    var next = "Open the Task Map and continue the current room.";
    var why = "The cave should show one small next action, not a wall of buttons.";
    var action = "open-task-map";
    var checks = [];

    if (!chunks.length) {
      next = "Paste the assignment brief and split it into chunks.";
      why = "Brief Fog cannot help until the task is broken into visible pieces.";
      action = "open-task-brief";
      checks.push("Prompt clarity: not started");
      checks.push("Chunk coverage: missing");
      checks.push("Evidence readiness: locked until task is unpacked");
    } else if (unresolved.length) {
      next = "Work the next unresolved chunk.";
      why = unresolved.length + " chunk" + (unresolved.length === 1 ? " is" : "s are") + " still fuzzy. Translate one into plain meaning and one tiny action.";
      action = "work-next-chunk";
      checks.push("Prompt clarity: in progress");
      checks.push("Chunk coverage: " + (chunks.length - unresolved.length) + "/" + chunks.length + " resolved");
      checks.push("Next tiny step: use Work Next Chunk");
    } else if (!sources.length && !quotes.length) {
      next = "Move to Source Mine and add source notes.";
      why = "Brief Fog is clear. The next Grammarly-like check is evidence support.";
      action = "open-source-mine";
      checks.push("Prompt clarity: done");
      checks.push("Evidence readiness: needs sources");
      checks.push("Quote bank: empty");
    } else if (quotes.length && state.unlocked.indexOf("draft-route") >= 0) {
      next = "Open Draft Route and organise the answer.";
      why = "You have evidence saved. Now turn it into a route instead of free-writing blindly.";
      action = "open-draft-route";
      checks.push("Evidence readiness: " + quotes.length + " gem" + (quotes.length === 1 ? "" : "s") + " saved");
      checks.push("Structure check: ready for Draft Route");
      checks.push("Citation risk: check source links before final polish");
    } else {
      next = "Continue the current route step.";
      why = "The cave has enough context to move forward one chamber.";
      action = "continue-quest";
      checks.push("Progress: " + state.completed.length + " chambers complete");
      checks.push("Flags: " + flags.length);
      checks.push("Missed loot: " + missed.length);
    }

    if (flags.length) checks.push("Review flag: " + flags.length + " item" + (flags.length === 1 ? "" : "s") + " need attention");
    if (missed.length) checks.push("Missed loot: " + missed.length + " parked idea" + (missed.length === 1 ? "" : "s"));

    return { state: state, next: next, why: why, action: action, checks: checks };
  }

  function coachMarkup() {
    var model = coachModel();
    var state = model.state;
    return '<section class="study-cave-coach-panel" role="dialog" aria-label="Study Cave coach">' +
      '<button type="button" class="study-cave-coach-close" data-coach-action="close" aria-label="Close Cave Coach">×</button>' +
      '<p class="eyebrow">Cave Coach</p>' +
      '<h2>Next best step</h2>' +
      '<article class="coach-next-card"><strong>' + esc(model.next) + '</strong><p>' + esc(model.why) + '</p><button type="button" data-action="' + esc(model.action) + '">Do this now</button></article>' +
      '<div class="coach-status-grid"><span>Room <strong>' + esc(currentRoomLabel(state)) + '</strong></span><span>Progress <strong>' + state.completed.length + '/7</strong></span><span>Flags <strong>' + safeArray(state.flags).length + '</strong></span></div>' +
      '<section class="coach-checks"><h3>Smart checks</h3><ul>' + model.checks.map(function (check) { return '<li>' + esc(check) + '</li>'; }).join('') + '</ul></section>' +
      '<section class="coach-actions"><h3>Open</h3>' +
      '<button type="button" data-action="open-task-map">Task Map</button>' +
      '<button type="button" data-action="open-quest-board">Quest Board</button>' +
      '<button type="button" data-action="open-brief-fog">Brief Fog</button>' +
      '<button type="button" data-action="open-source-mine">Source Mine</button>' +
      '<button type="button" data-action="show-flags">Flags / missed loot</button>' +
      '<a href="house.html">Home Base</a>' +
      '<a href="hub.html">Village</a>' +
      '</section>' +
      '<button type="button" class="coach-test-link" data-test-action="open">Test Mode</button>' +
      '</section>';
  }

  function openCoach() {
    closeCoach();
    document.body.insertAdjacentHTML("beforeend", coachMarkup());
  }

  function closeCoach() {
    document.querySelectorAll(".study-cave-coach-panel").forEach(function (node) { node.remove(); });
  }

  function ensureCoachLauncher() {
    if (document.querySelector(".study-cave-coach-launcher")) return;
    var button = document.createElement("button");
    button.type = "button";
    button.className = "study-cave-coach-launcher";
    button.dataset.coachAction = "open";
    button.setAttribute("aria-label", "Open Cave Coach");
    button.textContent = "☰";
    document.body.appendChild(button);
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
    closeCoach();
    document.body.insertAdjacentHTML("beforeend", panelMarkup());
  }

  function closePanel() {
    document.querySelectorAll(".study-cave-test-panel").forEach(function (node) { node.remove(); });
  }

  function addStyle() {
    if (document.querySelector("style[data-study-cave-clean-ui]")) return;
    var style = document.createElement("style");
    style.dataset.studyCaveCleanUi = "true";
    style.textContent = [
      'html,body{height:100%;overflow:hidden!important;}body{background:#120c10!important;}',
      'body .studyquest-shell.scene-first{height:100dvh!important;min-height:0!important;display:grid!important;place-items:center!important;padding:4px!important;overflow:hidden!important;background:radial-gradient(circle at 50% 50%,rgba(58,38,68,.5),transparent 42%),linear-gradient(180deg,#211728 0%,#09070d 100%)!important;}',
      'body .studyquest-header.compact-header{display:none!important;}',
      'body .game-cave.room-viewport-frame{width:min(1600px,calc(100vw - 8px),calc((100dvh - 8px)*16/9))!important;height:auto!important;max-height:calc(100dvh - 8px)!important;aspect-ratio:16/9!important;transform:scale(1.08);transform-origin:center center;border:6px solid #382215!important;border-radius:20px!important;box-shadow:0 0 0 2px rgba(218,169,91,.45),0 0 0 12px rgba(22,12,16,.95),0 22px 74px rgba(0,0,0,.58)!important;}',
      'body .quest-hud{position:absolute!important;left:16px!important;top:14px!important;z-index:190!important;display:flex!important;gap:7px!important;flex-wrap:wrap!important;max-width:min(720px,calc(100% - 88px))!important;}',
      'body .quest-hud div{padding:6px 9px!important;border-radius:999px!important;background:rgba(8,8,18,.72)!important;border:1px solid rgba(236,215,170,.45)!important;color:#fff7df!important;font-size:.74rem!important;box-shadow:0 6px 18px rgba(0,0,0,.3)!important;}',
      'body .scene-hotspot span,body .flow-hotspot::after{font-size:.74rem!important;}',
      'body .quest-board-panel,body .map-board-panel,body .flags-panel{position:absolute!important;inset:18px!important;z-index:420!important;overflow:auto!important;border-radius:20px!important;background:rgba(250,242,225,.98)!important;color:#2f2118!important;box-shadow:0 22px 70px rgba(0,0,0,.48)!important;}',
      'body .quest-board-panel summary,body .map-board-panel summary,body .flags-panel summary{padding:12px 16px!important;font-weight:900!important;cursor:pointer!important;}',
      '.study-cave-coach-launcher{position:fixed;left:10px;top:50%;transform:translateY(-50%);z-index:9999;width:44px;height:54px;border:2px solid rgba(255,232,176,.72);border-radius:0 16px 16px 0;padding:0;background:linear-gradient(180deg,rgba(70,45,92,.98),rgba(20,15,32,.98));color:#fff7df;font-family:Georgia,serif;font-size:1.18rem;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.38),inset 0 -2px 0 rgba(0,0,0,.18);cursor:pointer;}',
      '.study-cave-coach-panel,.study-cave-test-panel{position:fixed;left:58px;top:9px;bottom:9px;z-index:10000;width:min(380px,calc(100vw - 72px));overflow:auto;padding:16px;border-radius:22px;border:4px solid #5a3825;background:linear-gradient(180deg,rgba(255,246,226,.98),rgba(224,199,151,.98));color:#2f2118;box-shadow:0 24px 80px rgba(0,0,0,.52),inset 0 0 0 2px rgba(255,255,255,.3);}',
      '.study-cave-coach-panel h2,.study-cave-test-panel h2{margin:0 42px 10px 0;color:#2f2118;font-family:Georgia,serif;line-height:1;}',
      '.study-cave-coach-close,.study-cave-test-close{position:absolute;right:10px;top:10px;width:36px;height:36px;border-radius:999px;border:1px solid rgba(97,70,45,.24);background:#fff;color:#2f2118;font-weight:900;cursor:pointer;}',
      '.coach-next-card,.coach-checks,.coach-actions,.coach-status-grid{margin:0 0 12px;padding:12px;border:1px solid rgba(90,56,37,.35);border-radius:16px;background:rgba(255,250,240,.56);}',
      '.coach-next-card strong{display:block;font-size:1rem;margin-bottom:6px;}.coach-next-card p{margin:0 0 10px;line-height:1.35;}',
      '.coach-status-grid{display:grid;gap:7px;grid-template-columns:1fr;}.coach-status-grid span{display:flex;justify-content:space-between;gap:8px;padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.5);font-weight:800;}',
      '.coach-checks h3,.coach-actions h3{margin:0 0 8px;color:#5b371f;font-family:Georgia,serif;font-size:.82rem;letter-spacing:.12em;text-transform:uppercase;}.coach-checks ul{margin:0;padding-left:18px;line-height:1.35;}',
      '.coach-actions{display:grid;gap:8px;}.coach-actions button,.coach-actions a,.coach-next-card button,.coach-test-link,.study-cave-test-grid button,.study-cave-test-actions button{display:flex;align-items:center;justify-content:space-between;width:100%;border:2px solid #5a3825;border-radius:999px;padding:9px 12px;background:linear-gradient(180deg,#fff8e8 0%,#e7c994 100%);color:#2c1d16;font-family:Georgia,serif;font-size:.86rem;font-weight:900;line-height:1;text-align:left;text-decoration:none;box-shadow:0 2px 7px rgba(0,0,0,.14),inset 0 -2px 0 rgba(0,0,0,.1);cursor:pointer;}',
      '.coach-next-card button{background:linear-gradient(180deg,#71502b,#2f1c14);color:#fff7df;}.coach-test-link{margin-top:8px;}',
      '.study-cave-test-grid{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0;}.study-cave-test-actions{display:grid;gap:8px;margin-top:10px;}.study-cave-test-note{font-size:.86rem;opacity:.78;}',
      '.study-cave-test-launcher{display:none!important;}',
      '@media (max-width:760px){body .game-cave.room-viewport-frame{transform:scale(1.04);} .study-cave-coach-launcher{left:7px;width:38px;height:48px}.study-cave-coach-panel,.study-cave-test-panel{left:48px;width:min(330px,calc(100vw - 56px));}}'
    ].join('');
    document.head.appendChild(style);
  }

  document.addEventListener("click", function (event) {
    var coachButton = event.target.closest("[data-coach-action]");
    if (coachButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (coachButton.dataset.coachAction === "open") return openCoach();
      if (coachButton.dataset.coachAction === "close") return closeCoach();
    }
  }, true);

  document.addEventListener("click", function (event) {
    if (event.target.closest(".study-cave-coach-panel [data-action], .study-cave-coach-panel a")) closeCoach();
  }, true);

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

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeCoach();
      closePanel();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    addStyle();
    ensureCoachLauncher();
    try {
      if (new URLSearchParams(window.location.search).get("test") === "1") openPanel();
    } catch (error) {}
  });
})();
