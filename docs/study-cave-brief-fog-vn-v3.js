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
      },
      sourceMine: {
        sources: [],
        quotes: []
      }
    };
  }

  function normaliseSource(source) {
    source = source && typeof source === "object" ? source : {};
    return {
      id: source.id || uid(),
      title: String(source.title || "Untitled source").slice(0, 180),
      author: String(source.author || "").slice(0, 180),
      details: String(source.details || "").slice(0, 900),
      use: String(source.use || "").slice(0, 600)
    };
  }

  function normaliseQuote(quote) {
    quote = quote && typeof quote === "object" ? quote : {};
    return {
      id: quote.id || uid(),
      sourceId: String(quote.sourceId || ""),
      chunkIndex: Number.isFinite(Number(quote.chunkIndex)) ? Number(quote.chunkIndex) : -1,
      text: String(quote.text || "").slice(0, 1800),
      meaning: String(quote.meaning || "").slice(0, 1200),
      use: String(quote.use || "").slice(0, 700),
      state: String(quote.state || "saved")
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
    saved.sourceMine = Object.assign({}, base.sourceMine, saved.sourceMine || {});
    saved.completed = safeArray(saved.completed);
    saved.unlocked = safeArray(saved.unlocked).length ? safeArray(saved.unlocked) : base.unlocked.slice();
    saved.flags = safeArray(saved.flags);
    saved.missedLoot = safeArray(saved.missedLoot);
    saved.lastSavedAt = String(saved.lastSavedAt || base.lastSavedAt);
    saved.lastAction = String(saved.lastAction || base.lastAction);
    saved.briefFog.chunks = safeArray(saved.briefFog.chunks);
    saved.briefFog.sceneState = String(saved.briefFog.sceneState || "opening");
    saved.briefFog.routeChoice = String(saved.briefFog.routeChoice || "");
    saved.sourceMine.sources = safeArray(saved.sourceMine.sources).map(normaliseSource);
    saved.sourceMine.quotes = safeArray(saved.sourceMine.quotes).map(normaliseQuote);
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
      '.bf-scene-escape .bf-girl-marker{right:4%;opacity:.78;}.bf-scene-venture .bf-girl-marker{right:29%;}' +
      '.bf-choice-panel{position:absolute;right:24px;top:64px;z-index:90;width:min(390px,38vw);padding:18px;border-radius:22px;border:2px solid rgba(255,223,157,.72);background:rgba(10,13,26,.88);color:#fff7df;box-shadow:0 22px 56px rgba(0,0,0,.48);}' +
      '.bf-choice-panel h2,.bf-choice-panel h3{margin:8px 0 7px;color:#fff1cf;}.bf-choice-panel button{display:block;width:100%;margin:6px 0 12px;padding:11px 14px;border-radius:999px;border:1px solid rgba(255,232,174,.78);background:rgba(78,49,22,.92);color:#fff7df;font-weight:900;cursor:pointer;text-align:left;}' +
      '.bf-choice-panel button:hover,.bf-choice-panel button:focus-visible,.bf-scroll-hotspot:hover,.bf-scroll-hotspot:focus-visible{outline:3px solid rgba(255,240,188,.7);background:rgba(104,65,25,.96);}' +
      '.bf-vn-room .bf-status-card{max-width:420px!important;}' +
      '.source-mine-room .source-card{width:min(460px,38vw)!important;}' +
      '.source-hotspot{position:absolute;z-index:95;border:2px solid rgba(255,224,145,.72);border-radius:18px;background:rgba(40,22,9,.10);color:#fff7df;font-weight:900;text-shadow:0 2px 4px #000;box-shadow:0 0 20px rgba(255,210,112,.20),inset 0 0 18px rgba(255,210,112,.08);cursor:pointer;}' +
      '.source-hotspot::after{content:attr(data-hotspot-label);position:absolute;left:50%;bottom:8px;transform:translateX(-50%);padding:6px 9px;border-radius:999px;background:rgba(8,8,18,.78);white-space:nowrap;}' +
      '.source-hotspot:hover,.source-hotspot:focus-visible{outline:3px solid rgba(255,240,188,.78);background:rgba(255,210,112,.16);}' +
      '.source-hotspot-desk{left:4%;top:23%;width:31%;height:36%;}.source-hotspot-cart{left:43%;top:32%;width:17%;height:28%;}.source-hotspot-crystals{left:30%;top:15%;width:22%;height:31%;}.source-hotspot-stash{right:3%;bottom:9%;width:19%;height:26%;}.source-hotspot-draft{right:8%;top:19%;width:22%;height:28%;}.source-hotspot-map{left:36%;bottom:7%;width:18%;height:13%;}' +
      '.source-list{margin:10px 0 0;padding-left:18px;}.source-list li{margin-bottom:8px;}.source-mini{font-size:.9rem;opacity:.86;}.evidence-card{border:1px solid rgba(97,70,45,.22);border-radius:12px;padding:10px;margin:8px 0;background:rgba(255,255,255,.48);}' +
      '@media(max-width:820px){.bf-choice-panel{left:12px;right:12px;top:56px;width:auto;}.bf-girl-marker{right:4%;height:42%;}.bf-fog-mass{width:58%;}.bf-scroll-hotspot{left:14%;bottom:14%;}.source-mine-room .source-card{width:calc(100% - 24px)!important;top:auto!important;bottom:12px!important;}.source-hotspot::after{font-size:.75rem;}.source-hotspot-desk{left:2%;top:24%;width:36%;height:27%;}.source-hotspot-cart{left:43%;top:34%;width:20%;height:23%;}.source-hotspot-crystals{left:26%;top:11%;width:28%;height:24%;}.source-hotspot-stash{right:3%;bottom:23%;width:23%;height:20%;}.source-hotspot-draft{right:6%;top:15%;width:27%;height:24%;}.source-hotspot-map{left:34%;bottom:24%;width:24%;height:13%;}}' +
      '</style>';
  }

  function visualMarkup() {
    return '<div class="bf-placeholder-layer" aria-hidden="false">' +
      '<div class="bf-placeholder-bg-note">Placeholder VN scene · final art swaps in later</div>' +
      '<div class="bf-fog-mass"><span></span><span></span><span></span></div>' +
      '<div class="bf-imp-marker">imp/fog</div>' +
      '<div class="bf-girl-marker">girl</div>' +
      '<button type="button" class="bf-scroll-hotspot" data-action="bf-read-scroll">Read task scroll</button>' +
      '</div>';
  }

  function sourceHotspots() {
    return '<button type="button" class="source-hotspot source-hotspot-desk" data-action="source-open-notes" data-hotspot-label="Source Notes" aria-label="Open Source Notes"></button>' +
      '<button type="button" class="source-hotspot source-hotspot-cart" data-action="source-open-quotes" data-hotspot-label="Mined Quotes" aria-label="Open Mined Quotes"></button>' +
      '<button type="button" class="source-hotspot source-hotspot-crystals" data-action="source-open-evidence" data-hotspot-label="Evidence Nodes" aria-label="Open Evidence Nodes"></button>' +
      '<button type="button" class="source-hotspot source-hotspot-stash" data-action="source-open-gaps" data-hotspot-label="Missing Evidence" aria-label="Open Missing Evidence"></button>' +
      '<button type="button" class="source-hotspot source-hotspot-draft" data-action="source-draft-route" data-hotspot-label="Draft Route" aria-label="Open Draft Route"></button>' +
      '<button type="button" class="source-hotspot source-hotspot-map" data-action="open-task-map" data-hotspot-label="Task Map" aria-label="Open Task Map"></button>';
  }

  function sourcePanel(title, body) {
    return '<section class="simple-drawer" role="dialog" aria-label="' + esc(title) + '"><button type="button" class="simple-close" data-action="source-close-note" aria-label="Close note">×</button><h2>' + esc(title) + '</h2>' + body + '</section>';
  }

  function sourceName(state, id) {
    var source = safeArray(state.sourceMine.sources).find(function (item) { return item.id === id; });
    return source ? source.title : "No source selected";
  }

  function chunkName(state, index) {
    var chunk = safeArray(state.briefFog.chunks)[index];
    if (!chunk) return "No Brief Fog chunk linked";
    return "Chunk " + (index + 1) + ": " + String(chunk.text || "").slice(0, 80);
  }

  function sourceOptions(state) {
    var sources = safeArray(state.sourceMine.sources);
    if (!sources.length) return '<option value="">No saved source yet</option>';
    return '<option value="">Choose source</option>' + sources.map(function (source) {
      return '<option value="' + esc(source.id) + '">' + esc(source.title) + '</option>';
    }).join("");
  }

  function chunkOptions(state) {
    var chunks = safeArray(state.briefFog.chunks);
    if (!chunks.length) return '<option value="-1">No Brief Fog chunks yet</option>';
    return '<option value="-1">Choose task chunk</option>' + chunks.map(function (chunk, index) {
      return '<option value="' + index + '">Chunk ' + (index + 1) + ': ' + esc(String(chunk.text || "").slice(0, 70)) + '</option>';
    }).join("");
  }

  function sourceList(state) {
    var sources = safeArray(state.sourceMine.sources);
    if (!sources.length) return '<p>No sources saved yet.</p>';
    return '<ol class="source-list">' + sources.map(function (source) {
      return '<li><strong>' + esc(source.title) + '</strong>' + (source.author ? ' <span class="source-mini">by ' + esc(source.author) + '</span>' : '') + '<br><span class="source-mini">' + esc(source.details || "No details yet") + '</span><br><em>' + esc(source.use || "No use note yet") + '</em></li>';
    }).join("") + '</ol>';
  }

  function quoteList(state) {
    var quotes = safeArray(state.sourceMine.quotes);
    if (!quotes.length) return '<p>No mined quotes or paraphrase notes yet.</p>';
    return '<ol class="source-list">' + quotes.map(function (quote) {
      return '<li><strong>' + esc(quote.text || "Untitled quote/paraphrase") + '</strong><br><span class="source-mini">Source: ' + esc(sourceName(state, quote.sourceId)) + '</span><br><span class="source-mini">Linked to: ' + esc(chunkName(state, quote.chunkIndex)) + '</span><br><em>' + esc(quote.meaning || "No explanation yet") + '</em></li>';
    }).join("") + '</ol>';
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
    node.innerHTML = styleBlock() + '<section class="simple-room brief-fog-room bf-vn-room bf-scene-' + esc(scene) + '"><p class="scene-label">Brief Fog · ' + esc(scene === "choice" ? "Read/Choice" : scene.charAt(0).toUpperCase() + scene.slice(1)) + '</p>' + visualMarkup() + statusCard(state, scene) + (scene === "choice" ? choicePanel(state) : "") + '</section>';
  }

  function renderSourceMine(extra) {
    var state = loadState();
    var node = stage();
    if (!node) return;
    var sources = safeArray(state.sourceMine.sources);
    var quotes = safeArray(state.sourceMine.quotes);
    closePanels();
    node.hidden = false;
    node.innerHTML = styleBlock() + '<section class="simple-room source-mine-room"><p class="scene-label">Source Mine</p>' + sourceHotspots() + '<article class="stage-card simple-card source-card"><h2>Source Mine</h2><p>Mine sources, quotes, examples, and evidence before drafting.</p><p><strong>Sources:</strong> ' + sources.length + ' · <strong>Evidence notes:</strong> ' + quotes.length + '</p>' + saveInfo(state) + '<div class="simple-actions"><button type="button" data-action="source-open-notes">Add Source</button><button type="button" data-action="source-open-quotes">Mine Quote</button><button type="button" data-action="source-open-evidence">Evidence Nodes</button><button type="button" data-action="source-open-gaps">Missing Evidence</button><button type="button" data-action="source-draft-route">Draft Route</button><button type="button" data-action="return-cave-base">Cave Base</button></div></article>' + (extra || "") + '</section>';
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
    renderSourceMine(sourcePanel("Venture Forth", '<p>You pushed past the fog without the assistance chunks. Source Mine is now open, and the skipped support has been recorded as missed loot.</p>' + saveInfo(state)));
  }

  function openSourceNotes() {
    var state = loadState();
    renderSourceMine(sourcePanel("Source Notes", saveInfo(state) + '<p>Add sources you might use later. This can be a book, article, webpage, lecture note, theory, case study, or example source.</p><form data-source-form><label>Source title<input name="sourceTitle" placeholder="Article, book, webpage, lecture note…"></label><label>Author / organisation<input name="sourceAuthor" placeholder="Author, organisation, lecturer…"></label><label>Details / link / page / reference info<textarea name="sourceDetails" rows="4" placeholder="Paste link, page number, reference details, or where you found it."></textarea></label><label>What this source may help with<textarea name="sourceUse" rows="3" placeholder="Which point, definition, background, counterargument, example, or theory could it support?"></textarea></label><div class="simple-actions"><button type="button" data-action="source-save-source">Save source</button><button type="button" data-action="source-open-quotes">Mine quote next</button></div></form><h3>Saved sources</h3>' + sourceList(state)));
  }

  function saveSource() {
    var form = document.querySelector("[data-source-form]");
    if (!form) return openSourceNotes();
    var data = new FormData(form);
    var state = loadState();
    state.sourceMine.sources.push(normaliseSource({
      title: data.get("sourceTitle") || "Untitled source",
      author: data.get("sourceAuthor") || "",
      details: data.get("sourceDetails") || "",
      use: data.get("sourceUse") || ""
    }));
    state.current = "source-mine";
    saveState(state, "Source saved in Source Mine");
    openSourceNotes();
  }

  function openQuotes() {
    var state = loadState();
    renderSourceMine(sourcePanel("Mined Quotes / Evidence", saveInfo(state) + '<p>Save a quote, paraphrase, example, or evidence note. Link it back to a Brief Fog chunk so it has a purpose.</p><form data-quote-form><label>Source<select name="sourceId">' + sourceOptions(state) + '</select></label><label>Link to Brief Fog chunk<select name="chunkIndex">' + chunkOptions(state) + '</select></label><label>Quote / paraphrase / evidence note<textarea name="quoteText" rows="5" placeholder="Paste a short quote, paraphrase the source, or note an example."></textarea></label><label>Meaning in your own words<textarea name="quoteMeaning" rows="4" placeholder="Explain what this evidence means so it does not become quote dumping."></textarea></label><label>How you might use it<textarea name="quoteUse" rows="3" placeholder="Definition, context, evidence for a point, counterargument, theory, example…"></textarea></label><div class="simple-actions"><button type="button" data-action="source-save-quote">Save evidence note</button><button type="button" data-action="source-open-evidence">Review evidence</button></div></form><h3>Saved evidence notes</h3>' + quoteList(state)));
  }

  function saveQuote() {
    var form = document.querySelector("[data-quote-form]");
    if (!form) return openQuotes();
    var data = new FormData(form);
    var state = loadState();
    state.sourceMine.quotes.push(normaliseQuote({
      sourceId: data.get("sourceId") || "",
      chunkIndex: data.get("chunkIndex"),
      text: data.get("quoteText") || "Untitled evidence note",
      meaning: data.get("quoteMeaning") || "",
      use: data.get("quoteUse") || "",
      state: "saved"
    }));
    state.current = "source-mine";
    saveState(state, "Evidence note saved in Source Mine");
    openQuotes();
  }

  function openEvidence() {
    var state = loadState();
    var chunks = safeArray(state.briefFog.chunks);
    var quotes = safeArray(state.sourceMine.quotes);
    var body = saveInfo(state);
    if (!quotes.length) {
      body += '<p>No evidence notes yet. Use the research desk or mine cart to add sources and quotes.</p>';
    } else if (!chunks.length) {
      body += '<p>No Brief Fog chunks are saved yet, so evidence cannot be mapped to chunks. Saved evidence still appears below.</p>' + quoteList(state);
    } else {
      body += chunks.map(function (chunk, index) {
        var linked = quotes.filter(function (quote) { return quote.chunkIndex === index; });
        return '<section class="evidence-card"><h3>Chunk ' + (index + 1) + '</h3><p>' + esc(String(chunk.text || "").slice(0, 220)) + '</p>' + (linked.length ? '<ul>' + linked.map(function (quote) { return '<li><strong>' + esc(sourceName(state, quote.sourceId)) + ':</strong> ' + esc(String(quote.text || "").slice(0, 180)) + '<br><em>' + esc(quote.meaning || "No explanation yet") + '</em></li>'; }).join("") + '</ul>' : '<p><strong>No linked evidence yet.</strong></p>') + '</section>';
      }).join("");
    }
    body += '<div class="simple-actions"><button type="button" data-action="source-open-quotes">Mine quote</button><button type="button" data-action="source-open-gaps">Missing evidence</button><button type="button" data-action="source-draft-route">Draft Route</button></div>';
    renderSourceMine(sourcePanel("Evidence Nodes", body));
  }

  function openGaps() {
    var state = loadState();
    var chunks = safeArray(state.briefFog.chunks);
    var quotes = safeArray(state.sourceMine.quotes);
    var gaps = chunks.map(function (chunk, index) { return { chunk: chunk, index: index }; }).filter(function (item) {
      return !quotes.some(function (quote) { return quote.chunkIndex === item.index; });
    });
    var body = saveInfo(state);
    if (!chunks.length) {
      body += '<p>No Brief Fog chunks are saved yet. Missing evidence will be clearer after Brief Fog is unpacked.</p>';
    } else if (!gaps.length) {
      body += '<p>Every current Brief Fog chunk has at least one linked evidence note. That does not mean the evidence is final, but the obvious empty gaps are covered.</p>';
    } else {
      body += '<p>These task chunks do not have linked evidence yet.</p><ol class="source-list">' + gaps.map(function (item) {
        return '<li><strong>Chunk ' + (item.index + 1) + ':</strong> ' + esc(String(item.chunk.text || "").slice(0, 170)) + '<br><button type="button" data-action="source-log-gap" data-gap-index="' + item.index + '">Record as missed evidence</button></li>';
      }).join("") + '</ol>';
    }
    body += '<div class="simple-actions"><button type="button" data-action="source-open-quotes">Add evidence</button><button type="button" data-action="show-flags">Flags / Missed Loot</button></div>';
    renderSourceMine(sourcePanel("Missing Evidence", body));
  }

  function logGap(index) {
    var state = loadState();
    var chunk = safeArray(state.briefFog.chunks)[index];
    if (!chunk) return openGaps();
    state.missedLoot.push({ id: uid(), tag: "source-mine-gap", text: "Source Mine gap: no evidence linked to Chunk " + (index + 1) + " — " + String(chunk.text || "").slice(0, 130) });
    saveState(state, "Missing evidence recorded");
    openGaps();
  }

  function draftRoute() {
    var state = loadState();
    var quotes = safeArray(state.sourceMine.quotes);
    var body = saveInfo(state);
    if (!quotes.length) {
      body += '<p>Draft Route is not ready yet. Add at least one source or evidence note first.</p><div class="simple-actions"><button type="button" data-action="source-open-notes">Add source</button><button type="button" data-action="source-open-quotes">Mine quote</button></div>';
    } else {
      body += '<p>Draft Route is the next room after Source Mine. For now this checkpoint confirms your source notes are saved and ready to become a paragraph plan later.</p><p><strong>Evidence notes ready:</strong> ' + quotes.length + '</p><div class="simple-actions"><button type="button" data-action="source-open-evidence">Review evidence</button><button type="button" data-action="open-task-map">Task Map</button></div>';
    }
    renderSourceMine(sourcePanel("Draft Route", body));
  }

  function sourceNote() {
    openSourceNotes();
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
      if (state.current === "source-mine") {
        event.preventDefault();
        event.stopImmediatePropagation();
        return renderSourceMine();
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderBriefFog();
    }
    if (action === "open-source-mine") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine();
    }
    if (action === "source-placeholder" || action === "source-open-notes") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return sourceNote();
    }
    if (action === "source-open-quotes") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openQuotes();
    }
    if (action === "source-open-evidence") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openEvidence();
    }
    if (action === "source-open-gaps") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return openGaps();
    }
    if (action === "source-draft-route") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return draftRoute();
    }
    if (action === "source-save-source") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveSource();
    }
    if (action === "source-save-quote") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveQuote();
    }
    if (action === "source-log-gap") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return logGap(Number(button.dataset.gapIndex));
    }
    if (action === "source-close-note") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return renderSourceMine();
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
