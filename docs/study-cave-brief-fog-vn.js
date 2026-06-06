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

  function timeStamp() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      return new Date().toISOString();
    }
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
        chunks: [],
        routeChoice: "",
        sceneState: "opening"
      }
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
    saved.briefFog = Object.assign({}, base.briefFog, saved.briefFog || {});
    saved.completed = safeArray(saved.completed);
    saved.unlocked = safeArray(saved.unlocked).length ? safeArray(saved.unlocked) : base.unlocked.slice();
    saved.flags = safeArray(saved.flags);
    saved.missedLoot = safeArray(saved.missedLoot);
    saved.lastSavedAt = String(saved.lastSavedAt || base.lastSavedAt);
    saved.lastAction = String(saved.lastAction || base.lastAction);
    saved.briefFog.chunks = safeArray(saved.briefFog.chunks);
    saved.briefFog.sceneState = String(saved.briefFog.sceneState || "opening");
    saved.briefFog.routeChoice = String(saved.briefFog.routeChoice || "");
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

  function passToExisting(action) {
    setTimeout(function () {
      var button = document.createElement("button");
      button.type = "button";
      button.dataset.action = action;
      button.hidden = true;
      document.body.appendChild(button);
      button.click();
      button.remove();
    }, 0);
  }

  function styleBlock() {
    return '<style data-brief-fog-vn-placeholder>' +
      '.bf-vn-room{isolation:isolate;}' +
      '.bf-placeholder-layer{position:absolute;inset:0;z-index:20;pointer-events:none;}' +
      '.bf-placeholder-bg-note{position:absolute;right:18px;bottom:14px;padding:6px 9px;border-radius:999px;background:rgba(5,5,12,.72);color:#f7e8c7;font-size:.76rem;font-weight:800;}' +
      '.bf-fog-mass{position:absolute;left:6%;top:18%;width:42%;height:58%;border-radius:48% 52% 45% 55%;background:radial-gradient(circle at 35% 45%,rgba(18,20,37,.84),rgba(37,42,68,.62) 42%,rgba(67,71,96,.18) 72%,transparent 78%);filter:blur(1px);box-shadow:0 0 60px rgba(99,115,150,.28);}' +
      '.bf-fog-mass span{position:absolute;width:10px;height:10px;border-radius:50%;background:#f5b84c;box-shadow:0 0 12px #ffc66a;}' +
      '.bf-fog-mass span:nth-child(1){left:35%;top:38%;}.bf-fog-mass span:nth-child(2){left:55%;top:50%;}.bf-fog-mass span:nth-child(3){left:44%;top:62%;}' +
      '.bf-imp-marker{position:absolute;left:23%;top:47%;padding:9px 12px;border-radius:16px;background:rgba(10,8,12,.72);border:1px solid rgba(245,184,76,.5);color:#ffd98d;font-weight:900;text-transform:uppercase;font-size:.72rem;}' +
      '.bf-girl-marker{position:absolute;right:11%;bottom:10%;width:17%;height:54%;min-width:120px;border-radius:46% 46% 12% 12%;background:linear-gradient(180deg,rgba(246,220,148,.86),rgba(41,34,74,.72));border:2px solid rgba(255,231,174,.42);box-shadow:0 24px 32px rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;color:#fff7df;font-weight:900;padding-bottom:18px;text-shadow:0 2px 4px #000;}' +
      '.bf-scroll-hotspot{position:absolute;left:22%;bottom:18%;z-index:42;pointer-events:auto;border:2px solid rgba(255,230,164,.84);border-radius:999px;padding:12px 18px;background:rgba(74,45,18,.92);color:#fff7df;font-weight:900;box-shadow:0 0 22px rgba(255,210,112,.35);cursor:pointer;}' +
      '.bf-glow-marker{position:absolute;right:25%;top:42%;width:16%;height:8px;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(255,240,168,.7),rgba(151,205,255,.5),transparent);box-shadow:0 0 24px rgba(255,230,150,.52);transform:rotate(-10deg);opacity:.15;}' +
      '.bf-route-marker{position:absolute;right:8%;top:24%;padding:9px 12px;border-radius:999px;background:rgba(10,20,32,.7);border:1px solid rgba(180,213,255,.42);color:#dcecff;font-weight:800;}' +
      '.bf-scene-choice .bf-glow-marker,.bf-scene-vanquish .bf-glow-marker,.bf-scene-venture .bf-glow-marker{opacity:.9;}' +
      '.bf-scene-escape .bf-girl-marker{right:4%;opacity:.78;}.bf-scene-venture .bf-girl-marker{right:29%;}.bf-scene-venture .bf-route-marker{box-shadow:0 0 22px rgba(180,213,255,.48);}' +
      '.bf-choice-panel{position:absolute;right:24px;top:64px;z-index:90;width:min(390px,38vw);padding:18px;border-radius:22px;border:2px solid rgba(255,223,157,.72);background:rgba(10,13,26,.88);color:#fff7df;box-shadow:0 22px 56px rgba(0,0,0,.48);}' +
      '.bf-choice-panel h2,.bf-choice-panel h3{margin:8px 0 7px;color:#fff1cf;}.bf-choice-panel button{display:block;width:100%;margin:6px 0 12px;padding:11px 14px;border-radius:999px;border:1px solid rgba(255,232,174,.78);background:rgba(78,49,22,.92);color:#fff7df;font-weight:900;cursor:pointer;text-align:left;}' +
      '.bf-choice-panel button:hover,.bf-choice-panel button:focus-visible,.bf-scroll-hotspot:hover,.bf-scroll-hotspot:focus-visible{outline:3px solid rgba(255,240,188,.7);background:rgba(104,65,25,.96);}' +
      '.bf-vn-room .bf-status-card{max-width:420px!important;}' +
      '@media(max-width:820px){.bf-choice-panel{left:12px;right:12px;top:56px;width:auto;}.bf-girl-marker{right:4%;height:42%;}.bf-fog-mass{width:58%;}.bf-scroll-hotspot{left:14%;bottom:14%;}}' +
      '</style>';
  }

  function visualMarkup(scene) {
    return '<div class="bf-placeholder-layer" aria-hidden="false">' +
      '<div class="bf-placeholder-bg-note">Placeholder VN scene · final art swaps in later</div>' +
      '<div class="bf-fog-mass"><span></span><span></span><span></span></div>' +
      '<div class="bf-imp-marker">imp/fog</div>' +
      '<div class="bf-girl-marker">girl</div>' +
      '<div class="bf-glow-marker"></div>' +
      '<div class="bf-route-marker">next route</div>' +
      '<button type="button" class="bf-scroll-hotspot" data-action="bf-read-scroll">Read task scroll</button>' +
      '</div>';
  }

  function statusCard(state, scene) {
    var chunks = safeArray(state.briefFog && state.briefFog.chunks);
    var resolved = chunks.filter(function (chunk) { return ["unpacked", "flagged", "missed"].indexOf(String(chunk.state || "")) >= 0; }).length;
    if (scene === "choice") return "";
    if (scene === "vanquish") {
      return '<article class="stage-card simple-card bf-status-card"><h2>Brief Fog</h2><p><strong>Chunks:</strong> ' + chunks.length + ' · <strong>Resolved:</strong> ' + resolved + '/' + chunks.length + '</p>' + saveInfo(state) + '<p>Route selected: Vanquish the Fog. Use the task brief and chunks to clear the room.</p><div class="simple-actions"><button type="button" data-action="open-task-brief">Task Brief</button><button type="button" data-action="work-next-chunk">Work Next Chunk</button><button type="button" data-action="open-summary">Summary</button><button type="button" data-action="bf-read-scroll">Choices</button><button type="button" data-action="return-cave-base">Cave Base</button></div></article>';
    }
    return '<article class="stage-card simple-card bf-status-card"><h2>Brief Fog</h2><p>The scroll lies in the fog. Click the in-world scroll to choose how to handle this chamber.</p><p><strong>Chunks:</strong> ' + chunks.length + ' · <strong>Resolved:</strong> ' + resolved + '/' + chunks.length + '</p>' + saveInfo(state) + '<div class="simple-actions"><button type="button" data-action="bf-read-scroll">Read task scroll</button><button type="button" data-action="return-cave-base">Cave Base</button><button type="button" data-action="open-task-map">Task Map</button></div></article>';
  }

  function choicePanel(state) {
    return '<section class="bf-choice-panel" aria-label="Brief Fog choices"><h2>Begin Quest?</h2><button type="button" data-action="bf-vanquish">VANQUISH THE FOG</button><h3>Scared?</h3><button type="button" data-action="bf-escape">Escape…</button><h3>Confident, Bold, Perhaps Unwise?</h3><button type="button" data-action="bf-venture">Venture Forth… Into The Unknown</button>' + saveInfo(state) + '</section>';
  }

  function renderBriefFog(scene) {
    var state = loadState();
    var node = stage();
    if (!node) return;
    scene = scene || state.briefFog.sceneState || "opening";
    closePanels();
    node.hidden = false;
    node.innerHTML = styleBlock() + '<section class="simple-room brief-fog-room bf-vn-room bf-scene-' + esc(scene) + '"><p class="scene-label">Brief Fog · ' + esc(scene === "choice" ? "Read/Choice" : scene.charAt(0).toUpperCase() + scene.slice(1)) + '</p>' + visualMarkup(scene) + statusCard(state, scene) + (scene === "choice" ? choicePanel(state) : "") + '</section>';
  }

  function readScroll() {
    var state = loadState();
    state.briefFog.routeChoice = "";
    state.briefFog.sceneState = "choice";
    saveState(state, "Brief Fog scroll read; choice opened");
    renderBriefFog("choice");
  }

  function chooseVanquish() {
    var state = loadState();
    state.briefFog.routeChoice = "vanquish";
    state.briefFog.sceneState = "vanquish";
    saveState(state, "Vanquish the Fog selected");
    passToExisting("open-task-brief");
  }

  function chooseEscape() {
    var state = loadState();
    state.briefFog.routeChoice = "escape";
    state.briefFog.sceneState = "escape";
    saveState(state, "Escaped Brief Fog without starting assistance");
    passToExisting("return-cave-base");
  }

  function chooseVenture() {
    var state = loadState();
    state.briefFog.routeChoice = "venture";
    state.briefFog.sceneState = "venture";
    if (state.completed.indexOf("brief-fog") === -1) state.completed.push("brief-fog");
    if (state.unlocked.indexOf("source-mine") === -1) state.unlocked.push("source-mine");
    state.current = "source-mine";
    var alreadyLogged = state.missedLoot.some(function (item) { return item && item.tag === "brief-fog-venture-skip"; });
    if (!alreadyLogged) {
      state.missedLoot.push({ id: uid(), tag: "brief-fog-venture-skip", text: "Brief Fog assistance skipped: question-unpacking chunks were left as missed loot." });
    }
    saveState(state, "Venture Forth selected; Source Mine unlocked and missed loot recorded");
    passToExisting("open-source-mine");
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action;
    if (action === "open-brief-fog") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderBriefFog();
    }
    if (action === "continue-quest") {
      var state = loadState();
      if (state.current !== "source-mine") {
        event.preventDefault();
        event.stopImmediatePropagation();
        return renderBriefFog();
      }
      return;
    }
    if (action === "bf-read-scroll") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return readScroll();
    }
    if (action === "bf-vanquish") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return chooseVanquish();
    }
    if (action === "bf-escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return chooseEscape();
    }
    if (action === "bf-venture") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return chooseVenture();
    }
  }, true);
})();
