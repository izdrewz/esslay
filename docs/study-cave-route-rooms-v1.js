(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";
  var TOTAL_CHAMBERS = 7;
  var ROOM_ORDER = [
    "brief-fog",
    "source-mine",
    "draft-route",
    "paragraph-forge",
    "bridge-hall",
    "citation-vault",
    "polish-pool",
    "submission-gate"
  ];

  var ROOM_COPY = {
    "draft-route": {
      title: "Draft Route",
      roomClass: "draft-route-room",
      previous: "source-mine",
      next: "paragraph-forge",
      intro: "Turn task chunks and evidence gems into a paragraph route before writing.",
      begin: "Begin Draft Route",
      firstAction: "Plan Paragraphs",
      fields: ["Paragraph / point name", "Purpose in the argument", "Evidence gem to use"],
      savedLabel: "route markers",
      savedKey: "markers",
      unlockText: "Paragraph Forge unlocks after you save at least one route marker.",
      nextText: "Continue to Paragraph Forge"
    },
    "paragraph-forge": {
      title: "Paragraph Forge",
      roomClass: "paragraph-forge-room",
      previous: "draft-route",
      next: "bridge-hall",
      intro: "Forge rough body paragraphs from the route. This is draft-making, not polish.",
      begin: "Begin Paragraph Forge",
      firstAction: "Write Rough Paragraph",
      fields: ["Paragraph focus", "Rough paragraph", "What it still needs"],
      savedLabel: "rough paragraphs",
      savedKey: "paragraphs",
      unlockText: "Bridge Hall unlocks after you save at least one rough paragraph.",
      nextText: "Continue to Bridge Hall"
    },
    "bridge-hall": {
      title: "Bridge Hall",
      roomClass: "bridge-hall-room",
      previous: "paragraph-forge",
      next: "citation-vault",
      intro: "Connect paragraphs with flow, signposting, order, and reader guidance.",
      begin: "Begin Bridge Hall",
      firstAction: "Add Transition / Link",
      fields: ["Connection point", "Transition or signpost", "Flow issue to watch"],
      savedLabel: "bridge links",
      savedKey: "links",
      unlockText: "Citation Vault unlocks after you save at least one bridge link.",
      nextText: "Continue to Citation Vault"
    },
    "citation-vault": {
      title: "Citation Vault",
      roomClass: "citation-vault-room",
      previous: "bridge-hall",
      next: "polish-pool",
      intro: "Check references, citation details, page numbers, and quote integration.",
      begin: "Begin Citation Vault",
      firstAction: "Check Citation",
      fields: ["Source or quote", "Citation / reference detail", "Gap or fix needed"],
      savedLabel: "citation checks",
      savedKey: "checks",
      unlockText: "Polish Pool unlocks after you save at least one citation check.",
      nextText: "Continue to Polish Pool"
    },
    "polish-pool": {
      title: "Polish Pool",
      roomClass: "polish-pool-room",
      previous: "citation-vault",
      next: "submission-gate",
      intro: "Do final clarity, wording, formatting, proofreading, and obvious mistake checks.",
      begin: "Begin Polish Pool",
      firstAction: "Record Polish Fix",
      fields: ["Section or issue", "Fix made", "Final check note"],
      savedLabel: "polish fixes",
      savedKey: "fixes",
      unlockText: "Submission Gate unlocks after you save at least one polish fix.",
      nextText: "Continue to Submission Gate"
    },
    "submission-gate": {
      title: "Submission Gate / Final Spell",
      roomClass: "submission-gate-room",
      previous: "polish-pool",
      next: "",
      intro: "Final read-through and export/submission checkpoint. This is the final cast, not ordinary editing.",
      begin: "Begin Final Spell",
      firstAction: "Final Read-Through",
      fields: ["Final issue checked", "Outcome", "Ready note"],
      savedLabel: "final checks",
      savedKey: "checks",
      unlockText: "Final spell is ready when the final read-through is complete.",
      nextText: "Complete Study Cave"
    }
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

  function timeStamp() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function defaultRoomState(roomId) {
    var copy = ROOM_COPY[roomId];
    var state = { started: false };
    state[copy.savedKey] = [];
    return state;
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
      briefFog: { chunks: [], routeChoice: "", sceneState: "opening" },
      sourceMine: { started: false, sources: [], quotes: [] },
      routeRooms: {}
    };
  }

  function ensureRouteRooms(state) {
    state.routeRooms = state.routeRooms && typeof state.routeRooms === "object" ? state.routeRooms : {};
    Object.keys(ROOM_COPY).forEach(function (roomId) {
      var copy = ROOM_COPY[roomId];
      var existing = state.routeRooms[roomId] && typeof state.routeRooms[roomId] === "object" ? state.routeRooms[roomId] : {};
      existing.started = Boolean(existing.started);
      existing[copy.savedKey] = safeArray(existing[copy.savedKey]);
      state.routeRooms[roomId] = existing;
    });
  }

  function loadState() {
    var base = defaultState();
    var saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    } catch (error) {
      saved = null;
    }
    if (!saved || typeof saved !== "object") saved = base;
    saved.completed = safeArray(saved.completed);
    saved.unlocked = safeArray(saved.unlocked).length ? safeArray(saved.unlocked) : base.unlocked.slice();
    saved.flags = safeArray(saved.flags);
    saved.missedLoot = safeArray(saved.missedLoot);
    saved.lastSavedAt = String(saved.lastSavedAt || base.lastSavedAt);
    saved.lastAction = String(saved.lastAction || base.lastAction);
    saved.briefFog = Object.assign({}, base.briefFog, saved.briefFog || {});
    saved.briefFog.chunks = safeArray(saved.briefFog.chunks);
    saved.sourceMine = Object.assign({}, base.sourceMine, saved.sourceMine || {});
    saved.sourceMine.sources = safeArray(saved.sourceMine.sources);
    saved.sourceMine.quotes = safeArray(saved.sourceMine.quotes);
    ensureRouteRooms(saved);
    return saved;
  }

  function saveState(state, message) {
    state.lastSavedAt = timeStamp();
    state.lastAction = message || "Saved locally";
    ensureRouteRooms(state);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      state.lastAction = "Save failed in this browser";
    }
    document.querySelectorAll("[data-flow-quest-title]").forEach(function (node) { node.textContent = state.questTitle || "Study Skills Trial"; });
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) { node.textContent = state.completed.length + " / " + TOTAL_CHAMBERS; });
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

  function isRouteRoom(roomId) {
    return Boolean(ROOM_COPY[roomId]);
  }

  function roomState(state, roomId) {
    ensureRouteRooms(state);
    return state.routeRooms[roomId] || defaultRoomState(roomId);
  }

  function savedItems(state, roomId) {
    var copy = ROOM_COPY[roomId];
    return safeArray(roomState(state, roomId)[copy.savedKey]);
  }

  function hasRoomWork(state, roomId) {
    return savedItems(state, roomId).length > 0;
  }

  function unlockRoom(state, roomId) {
    if (roomId && state.unlocked.indexOf(roomId) === -1) state.unlocked.push(roomId);
  }

  function completeRoom(state, roomId) {
    if (roomId && state.completed.indexOf(roomId) === -1) state.completed.push(roomId);
  }

  function roomStyleBlock() {
    return '<style data-study-cave-route-rooms>' +
      '.draft-route-room{background-image:linear-gradient(180deg,rgba(5,4,8,.16),rgba(5,4,8,.34)),url("assets/study-cave/draft-route-placeholder-v01.png"),url("assets/study-cave/source-mine-placeholder-v01.png"),url("assets/study-cave/cave-base-placeholder-v01.jpg"),linear-gradient(135deg,#17111d,#463721)!important;}' +
      '.paragraph-forge-room{background-image:linear-gradient(180deg,rgba(5,4,8,.16),rgba(5,4,8,.34)),url("assets/study-cave/paragraph-forge-placeholder-v01.png"),url("assets/study-cave/cave-base-placeholder-v01.jpg"),radial-gradient(circle at 55% 55%,rgba(255,174,73,.34),transparent 42%),linear-gradient(135deg,#201114,#4d2814)!important;}' +
      '.bridge-hall-room{background-image:linear-gradient(180deg,rgba(5,4,8,.16),rgba(5,4,8,.34)),url("assets/study-cave/bridge-hall-placeholder-v01.png"),url("assets/study-cave/cave-base-placeholder-v01.jpg"),radial-gradient(circle at 50% 50%,rgba(205,183,117,.22),transparent 42%),linear-gradient(135deg,#111827,#3b2f20)!important;}' +
      '.citation-vault-room{background-image:linear-gradient(180deg,rgba(5,4,8,.16),rgba(5,4,8,.34)),url("assets/study-cave/citation-vault-placeholder-v01.png"),url("assets/study-cave/cave-base-placeholder-v01.jpg"),radial-gradient(circle at 45% 48%,rgba(236,215,170,.22),transparent 42%),linear-gradient(135deg,#17111d,#2e231a)!important;}' +
      '.polish-pool-room{background-image:linear-gradient(180deg,rgba(5,4,8,.14),rgba(5,4,8,.30)),url("assets/study-cave/polish-pool-placeholder-v01.png"),url("assets/study-cave/cave-base-placeholder-v01.jpg"),radial-gradient(circle at 50% 60%,rgba(120,190,230,.26),transparent 45%),linear-gradient(135deg,#111827,#12343e)!important;}' +
      '.submission-gate-room{background-image:linear-gradient(180deg,rgba(5,4,8,.13),rgba(5,4,8,.30)),url("assets/study-cave/submission-gate-placeholder-v01.png"),url("assets/study-cave/cave-base-placeholder-v01.jpg"),radial-gradient(circle at 50% 56%,rgba(255,221,126,.32),transparent 45%),linear-gradient(135deg,#161123,#3b2d53)!important;}' +
      '.route-room-card{width:min(430px,36vw)!important;}' +
      '.route-hotspot{position:absolute;z-index:95;border:2px solid rgba(255,224,145,.72);border-radius:18px;background:rgba(40,22,9,.10);color:#fff7df;font-weight:900;text-shadow:0 2px 4px #000;box-shadow:0 0 20px rgba(255,210,112,.20),inset 0 0 18px rgba(255,210,112,.08);cursor:pointer;}' +
      '.route-hotspot::after{content:attr(data-hotspot-label);position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:6px 9px;border-radius:999px;background:rgba(8,8,18,.78);white-space:nowrap;}' +
      '.route-hotspot:hover,.route-hotspot:focus-visible{outline:3px solid rgba(255,240,188,.78);background:rgba(255,210,112,.16);}' +
      '.hotspot-start{left:42%;top:34%;width:18%;height:24%;border-color:rgba(160,205,255,.82);}' +
      '.hotspot-main{left:8%;top:28%;width:26%;height:30%;}.hotspot-review{left:38%;top:24%;width:24%;height:26%;}.hotspot-gap{right:8%;bottom:18%;width:18%;height:18%;}.hotspot-next{right:8%;top:20%;width:20%;height:28%;}' +
      '.route-list{padding-left:18px;margin:10px 0 0;}.route-list li{margin-bottom:8px;}.route-mini{font-size:.88rem;opacity:.86;}.route-export{width:100%;min-height:220px;box-sizing:border-box;}' +
      '@media(max-width:820px){.route-room-card{width:calc(100% - 24px)!important;top:auto!important;bottom:12px!important;}.route-hotspot::after{font-size:.75rem;}.hotspot-start{left:38%;top:28%;width:26%;height:22%;}.hotspot-main{left:5%;top:31%;width:31%;height:22%;}.hotspot-review{left:36%;top:25%;width:28%;height:22%;}.hotspot-gap{right:5%;bottom:24%;width:24%;height:16%;}.hotspot-next{right:5%;top:22%;width:27%;height:21%;}}' +
      '</style>';
  }

  function itemList(state, roomId) {
    var copy = ROOM_COPY[roomId];
    var items = savedItems(state, roomId);
    if (!items.length) return '<p>No ' + esc(copy.savedLabel) + ' saved yet.</p>';
    return '<ol class="route-list">' + items.map(function (item) {
      return '<li><strong>' + esc(item.title || "Untitled") + '</strong><br><span class="route-mini">' + esc(item.detail || "") + '</span><br><em>' + esc(item.note || "") + '</em></li>';
    }).join("") + '</ol>';
  }

  function roomPanel(title, body) {
    return '<section class="simple-drawer" role="dialog" aria-label="' + esc(title) + '"><button type="button" class="simple-close" data-action="route-close-panel" aria-label="Close panel">×</button><h2>' + esc(title) + '</h2>' + body + '</section>';
  }

  function roomHotspots(state, roomId) {
    var copy = ROOM_COPY[roomId];
    var current = roomState(state, roomId);
    if (!current.started) {
      return '<button type="button" class="route-hotspot hotspot-start" data-action="route-begin" data-room="' + esc(roomId) + '" data-hotspot-label="' + esc(copy.begin) + '" aria-label="' + esc(copy.begin) + '"></button>';
    }
    var html = '<button type="button" class="route-hotspot hotspot-main" data-action="route-open-work" data-room="' + esc(roomId) + '" data-hotspot-label="' + esc(copy.firstAction) + '" aria-label="' + esc(copy.firstAction) + '"></button>';
    if (hasRoomWork(state, roomId)) {
      html += '<button type="button" class="route-hotspot hotspot-review" data-action="route-review" data-room="' + esc(roomId) + '" data-hotspot-label="Review" aria-label="Review saved work"></button>';
      html += '<button type="button" class="route-hotspot hotspot-gap" data-action="route-gap" data-room="' + esc(roomId) + '" data-hotspot-label="Issues" aria-label="Issues and gaps"></button>';
      html += '<button type="button" class="route-hotspot hotspot-next" data-action="route-next" data-room="' + esc(roomId) + '" data-hotspot-label="' + esc(copy.nextText) + '" aria-label="' + esc(copy.nextText) + '"></button>';
    }
    return html;
  }

  function renderRoom(roomId, extra) {
    if (!isRouteRoom(roomId)) return;
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    var node = stage();
    if (!node) return;
    unlockRoom(state, roomId);
    state.current = roomId;
    saveState(state, "Opened " + copy.title);
    var current = roomState(state, roomId);
    var items = savedItems(state, roomId);
    var actions = current.started
      ? '<button type="button" data-action="route-open-work" data-room="' + esc(roomId) + '">' + esc(copy.firstAction) + '</button>' +
        (items.length ? '<button type="button" data-action="route-review" data-room="' + esc(roomId) + '">Review</button><button type="button" data-action="route-gap" data-room="' + esc(roomId) + '">Issues</button><button type="button" data-action="route-next" data-room="' + esc(roomId) + '">' + esc(copy.nextText) + '</button>' : '') +
        '<button type="button" data-action="route-previous" data-room="' + esc(roomId) + '">Back</button><button type="button" data-action="open-task-map">Task Map</button>'
      : '<button type="button" data-action="route-begin" data-room="' + esc(roomId) + '">' + esc(copy.begin) + '</button><button type="button" data-action="route-previous" data-room="' + esc(roomId) + '">Back</button><button type="button" data-action="open-task-map">Task Map</button>';
    var note = items.length ? '<p class="route-mini">' + esc(copy.nextText) + ' is available.</p>' : '<p class="route-mini">' + esc(copy.unlockText) + '</p>';
    closePanels();
    node.hidden = false;
    node.innerHTML = roomStyleBlock() + '<section class="simple-room route-room ' + esc(copy.roomClass) + '"><p class="scene-label">' + esc(copy.title) + '</p>' + roomHotspots(state, roomId) + '<article class="stage-card simple-card route-room-card"><h2>' + esc(copy.title) + '</h2><p>' + esc(copy.intro) + '</p><p><strong>Saved:</strong> ' + items.length + ' ' + esc(copy.savedLabel) + '</p>' + saveInfo(state) + '<div class="simple-actions">' + actions + '</div>' + note + '</article>' + (extra || "") + '</section>';
  }

  function beginRoom(roomId) {
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    roomState(state, roomId).started = true;
    unlockRoom(state, roomId);
    state.current = roomId;
    saveState(state, copy.title + " begun");
    openWork(roomId);
  }

  function openWork(roomId) {
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    roomState(state, roomId).started = true;
    saveState(state, copy.title + " work opened");
    var form = '<p>' + esc(copy.intro) + '</p><form data-route-form data-room="' + esc(roomId) + '">' +
      '<label>' + esc(copy.fields[0]) + '<input name="title" placeholder="Add a short label"></label>' +
      '<label>' + esc(copy.fields[1]) + '<textarea name="detail" rows="4" placeholder="What are you doing in this room?"></textarea></label>' +
      '<label>' + esc(copy.fields[2]) + '<textarea name="note" rows="4" placeholder="What should be checked or used later?"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="route-save-work" data-room="' + esc(roomId) + '">Save</button><button type="button" data-action="route-review" data-room="' + esc(roomId) + '">Review saved</button></div></form><h3>Saved ' + esc(copy.savedLabel) + '</h3>' + itemList(state, roomId);
    renderRoom(roomId, roomPanel(copy.firstAction, saveInfo(state) + form));
  }

  function saveWork(roomId) {
    var form = document.querySelector('[data-route-form][data-room="' + roomId + '"]');
    if (!form) return openWork(roomId);
    var data = new FormData(form);
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    var current = roomState(state, roomId);
    current.started = true;
    current[copy.savedKey].push({
      id: uid(),
      title: String(data.get("title") || "Untitled").slice(0, 180),
      detail: String(data.get("detail") || "").slice(0, 1500),
      note: String(data.get("note") || "").slice(0, 1500)
    });
    unlockRoom(state, roomId);
    if (copy.next) unlockRoom(state, copy.next);
    state.current = roomId;
    saveState(state, copy.title + " saved; " + (copy.next ? ROOM_COPY[copy.next].title + " unlocked" : "final checks updated"));
    openWork(roomId);
  }

  function reviewRoom(roomId) {
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    var body = saveInfo(state) + '<p>Review the saved ' + esc(copy.savedLabel) + ' before moving on.</p>' + itemList(state, roomId) + '<div class="simple-actions"><button type="button" data-action="route-open-work" data-room="' + esc(roomId) + '">Add more</button><button type="button" data-action="route-next" data-room="' + esc(roomId) + '">' + esc(copy.nextText) + '</button></div>';
    renderRoom(roomId, roomPanel(copy.title + " Review", body));
  }

  function gapRoom(roomId) {
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    var body = saveInfo(state) + '<p>Use this to park anything weak, missing, or not ready. It records as missed loot so it can be checked later.</p><form data-route-gap-form data-room="' + esc(roomId) + '"><label>Issue / gap<textarea name="gap" rows="4" placeholder="What is missing, weak, confusing, or risky?"></textarea></label><div class="simple-actions"><button type="button" data-action="route-save-gap" data-room="' + esc(roomId) + '">Record issue</button></div></form>';
    renderRoom(roomId, roomPanel(copy.title + " Issues", body));
  }

  function saveGap(roomId) {
    var form = document.querySelector('[data-route-gap-form][data-room="' + roomId + '"]');
    if (!form) return gapRoom(roomId);
    var data = new FormData(form);
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    state.missedLoot.push({ id: uid(), tag: roomId + "-gap", text: copy.title + " issue: " + String(data.get("gap") || "Unspecified issue").slice(0, 300) });
    saveState(state, copy.title + " issue recorded as missed loot");
    gapRoom(roomId);
  }

  function nextRoom(roomId) {
    var state = loadState();
    var copy = ROOM_COPY[roomId];
    if (!hasRoomWork(state, roomId)) return openWork(roomId);
    completeRoom(state, roomId);
    if (copy.next) {
      unlockRoom(state, copy.next);
      state.current = copy.next;
      saveState(state, copy.title + " complete; " + ROOM_COPY[copy.next].title + " unlocked");
      return renderRoom(copy.next);
    }
    completeRoom(state, "submission-gate");
    state.current = "submission-gate";
    saveState(state, "Study Cave final spell complete");
    renderRoom("submission-gate", roomPanel("Final Spell Complete", saveInfo(state) + '<p>The placeholder cave route is complete. Final export/submission logic can be connected later.</p><button type="button" data-action="route-export-summary">Export cave summary</button>'));
  }

  function previousRoom(roomId) {
    var copy = ROOM_COPY[roomId];
    if (!copy.previous || copy.previous === "source-mine") {
      var button = document.createElement("button");
      button.type = "button";
      button.dataset.action = "open-source-mine";
      button.hidden = true;
      document.body.appendChild(button);
      button.click();
      button.remove();
      return;
    }
    renderRoom(copy.previous);
  }

  function exportSummary() {
    var state = loadState();
    var text = "Study Cave Route Summary\n\n";
    Object.keys(ROOM_COPY).forEach(function (roomId) {
      var copy = ROOM_COPY[roomId];
      text += copy.title + "\n";
      savedItems(state, roomId).forEach(function (item, index) {
        text += (index + 1) + ". " + (item.title || "Untitled") + "\n" + (item.detail || "") + "\n" + (item.note || "") + "\n";
      });
      text += "\n";
    });
    renderRoom("submission-gate", roomPanel("Export Cave Summary", saveInfo(state) + '<p>Copy this placeholder summary for now.</p><textarea class="route-export" readonly>' + esc(text) + '</textarea>'));
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action;
    var roomId = button.dataset.room;

    if (action === "continue-quest") {
      var state = loadState();
      if (isRouteRoom(state.current)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return renderRoom(state.current);
      }
    }

    if (action === "open-draft-route" || action === "source-draft-route") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderRoom("draft-route");
    }

    if (!isRouteRoom(roomId)) return;

    if (action === "route-begin") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return beginRoom(roomId);
    }
    if (action === "route-open-work") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openWork(roomId);
    }
    if (action === "route-save-work") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveWork(roomId);
    }
    if (action === "route-review") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return reviewRoom(roomId);
    }
    if (action === "route-gap") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return gapRoom(roomId);
    }
    if (action === "route-save-gap") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveGap(roomId);
    }
    if (action === "route-next") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return nextRoom(roomId);
    }
    if (action === "route-previous") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return previousRoom(roomId);
    }
    if (action === "route-close-panel") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderRoom(roomId || loadState().current);
    }
    if (action === "route-export-summary") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return exportSummary();
    }
  }, true);
})();
