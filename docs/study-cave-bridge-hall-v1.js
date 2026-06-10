(function () {
  var KEY = "esslay-study-cave-simple-v1";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function arr(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function clean(value, limit) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit || 500);
  }

  function uid() {
    return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  }

  function now() {
    try {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (error) {
      return new Date().toISOString();
    }
  }

  function load() {
    var state = null;
    try { state = JSON.parse(localStorage.getItem(KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.completed = arr(state.completed);
    state.unlocked = arr(state.unlocked);
    state.routeRooms = state.routeRooms && typeof state.routeRooms === "object" ? state.routeRooms : {};
    state.routeRooms["paragraph-forge"] = state.routeRooms["paragraph-forge"] && typeof state.routeRooms["paragraph-forge"] === "object" ? state.routeRooms["paragraph-forge"] : {};
    state.routeRooms["paragraph-forge"].paragraphs = arr(state.routeRooms["paragraph-forge"].paragraphs);
    state.routeRooms["bridge-hall"] = state.routeRooms["bridge-hall"] && typeof state.routeRooms["bridge-hall"] === "object" ? state.routeRooms["bridge-hall"] : {};
    state.routeRooms["bridge-hall"].started = true;
    state.routeRooms["bridge-hall"].links = arr(state.routeRooms["bridge-hall"].links);
    state.lastSavedAt = state.lastSavedAt || "Not saved yet";
    state.lastAction = state.lastAction || "Ready";
    return state;
  }

  function save(state, message) {
    state.lastSavedAt = now();
    state.lastAction = message || "Saved locally";
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) {}
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) {
      node.textContent = arr(state.completed).length + " / 7";
    });
  }

  function stage() {
    return document.getElementById("stage-scene");
  }

  function closePanels() {
    document.querySelectorAll("details[open]").forEach(function (details) { details.open = false; });
  }

  function bridge(state) {
    return state.routeRooms["bridge-hall"];
  }

  function paragraphs(state) {
    return arr(state.routeRooms["paragraph-forge"].paragraphs).slice().sort(function (a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    });
  }

  function links(state) {
    return arr(bridge(state).links).slice().sort(function (a, b) {
      return Number(a.order || 0) - Number(b.order || 0);
    });
  }

  function linkForParagraph(state, paragraphId) {
    return links(state).find(function (link) { return link.paragraphId === paragraphId; }) || null;
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt) + ' · ' + esc(state.lastAction) + '</p>';
  }

  function styles() {
    return '<style data-bridge-hall-v1>' +
      '.bridge-hall-room{background-image:linear-gradient(180deg,rgba(5,4,8,.18),rgba(5,4,8,.36)),url("assets/study-cave/bridge-hall-placeholder-v01.png"),url("assets/study-cave/paragraph-forge-placeholder-v01.png"),linear-gradient(135deg,#111827,#3b2f20)!important;}' +
      '.bridge-hall-card{width:min(620px,50vw)!important;max-height:calc(100% - 92px)!important;overflow:auto!important;padding:14px!important;}' +
      '.bridge-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.bridge-tabs button{border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 9px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:900;cursor:pointer}.bridge-tabs button[aria-current="true"]{background:rgba(255,231,171,.92);color:#2f2118;}' +
      '.bridge-item{padding:9px;border-radius:14px;border:1px solid rgba(255,231,171,.38);background:rgba(7,10,18,.72);margin:8px 0}.bridge-chip{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;margin:2px}.bridge-text{max-height:92px;overflow:auto;padding:7px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.88rem}.bridge-hall-card textarea,.bridge-hall-card input,.bridge-hall-card select{width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit}.bridge-hall-card label{display:block;margin:8px 0;font-weight:900}' +
      '@media(max-width:920px){.bridge-hall-card{width:calc(100% - 28px)!important}}' +
      '</style>';
  }

  function tabs(active) {
    var items = [["build", "Build Bridge"], ["paragraphs", "Paragraphs"], ["saved", "Saved Bridges"], ["missing", "Missing"]];
    return '<nav class="bridge-tabs" aria-label="Bridge Hall tabs">' + items.map(function (item) {
      return '<button type="button" data-action="bridge-tab" data-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join("") + '</nav>';
  }

  function paragraphSummary(paragraph) {
    return '<strong>' + esc(paragraph.focus || paragraph.bucket || "Paragraph") + '</strong><br>' +
      '<span class="bridge-chip">' + esc(paragraph.bucket || "bucket") + '</span><span class="bridge-chip">' + esc(paragraph.citationLabel || "source") + '</span>' +
      '<div class="bridge-text">' + esc(paragraph.paragraph || "") + '</div>';
  }

  function suggestedLink(state, paragraph, index) {
    var list = paragraphs(state);
    if (index <= 0) return "This paragraph opens the argument by showing why " + clean(paragraph.bucket || paragraph.focus || "this point", 80) + " matters.";
    var previous = list[index - 1];
    return "This paragraph builds on " + clean(previous.focus || previous.bucket || "the previous point", 90) + " by moving into " + clean(paragraph.focus || paragraph.bucket || "the next point", 90) + ".";
  }

  function buildPanel(state) {
    var list = paragraphs(state);
    if (!list.length) {
      return '<h3>Build Bridge</h3><p>No Paragraph Forge paragraphs found yet. Save a rough paragraph first.</p><div class="simple-actions"><button type="button" data-action="open-paragraph-forge">Paragraph Forge</button></div>';
    }
    var activeId = bridge(state).activeParagraphId || list[0].id;
    var paragraph = list.find(function (item) { return item.id === activeId; }) || list[0];
    var index = list.indexOf(paragraph);
    return '<h3>Build Bridge</h3>' +
      '<section class="bridge-item">' + paragraphSummary(paragraph) + '</section>' +
      '<form data-bridge-form data-paragraph-id="' + esc(paragraph.id) + '">' +
      '<label>Bridge focus<input name="title" value="' + esc(paragraph.focus || paragraph.bucket || "") + '"></label>' +
      '<label>Transition / signpost<textarea name="detail" rows="5">' + esc(suggestedLink(state, paragraph, index)) + '</textarea></label>' +
      '<label>Flow issue to watch<textarea name="note" rows="3" placeholder="What could confuse the reader?"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="bridge-save-link">Save bridge link</button><button type="button" data-action="bridge-tab" data-tab="paragraphs">Choose another paragraph</button></div>' +
      '</form>';
  }

  function paragraphsPanel(state) {
    var list = paragraphs(state);
    if (!list.length) return '<h3>Paragraphs</h3><p>No rough paragraphs saved yet.</p>';
    return '<h3>Paragraphs</h3>' + list.map(function (paragraph) {
      var done = linkForParagraph(state, paragraph.id);
      return '<section class="bridge-item">' + paragraphSummary(paragraph) + '<div class="simple-actions">' +
        (done ? '<button type="button" disabled>Bridge saved</button>' : '<button type="button" data-action="bridge-select-paragraph" data-paragraph-id="' + esc(paragraph.id) + '">Bridge this paragraph</button>') +
        '</div></section>';
    }).join("");
  }

  function savedPanel(state) {
    var saved = links(state);
    if (!saved.length) return '<h3>Saved Bridges</h3><p>No bridge links saved yet.</p>';
    return '<h3>Saved Bridges</h3><ol>' + saved.map(function (link) {
      return '<li class="bridge-item"><strong>' + esc(link.title || "Bridge link") + '</strong><br><div class="bridge-text">' + esc(link.detail || "") + '</div><em>' + esc(link.note || "") + '</em></li>';
    }).join("") + '</ol><div class="simple-actions"><button type="button" data-action="bridge-continue-citation">Continue to Citation Vault</button></div>';
  }

  function missingPanel(state) {
    var missing = paragraphs(state).filter(function (paragraph) { return !linkForParagraph(state, paragraph.id); });
    return '<h3>Missing</h3><p><strong>Paragraphs without bridge links:</strong> ' + missing.length + '</p>' +
      (missing.length ? '<ul>' + missing.map(function (paragraph) { return '<li>' + esc(paragraph.focus || paragraph.bucket || "Paragraph") + '</li>'; }).join("") + '</ul>' : '<p>None.</p>');
  }

  function panelFor(state, tab) {
    if (tab === "paragraphs") return paragraphsPanel(state);
    if (tab === "saved") return savedPanel(state);
    if (tab === "missing") return missingPanel(state);
    return buildPanel(state);
  }

  function render(tab, message) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    state.current = "bridge-hall";
    if (state.unlocked.indexOf("bridge-hall") === -1) state.unlocked.push("bridge-hall");
    bridge(state).started = true;
    var active = tab || bridge(state).activeTab || "build";
    bridge(state).activeTab = active;
    save(state, message || "Bridge Hall opened");
    node.innerHTML = styles() + '<section class="simple-room bridge-hall-room"><p class="scene-label">Bridge Hall</p>' +
      '<article class="stage-card simple-card bridge-hall-card"><h2>Bridge Hall</h2>' +
      '<p>Connect rough paragraphs with flow, signposting, and reader guidance.</p>' +
      '<p><strong>Paragraphs:</strong> ' + paragraphs(state).length + ' · <strong>Bridge links:</strong> ' + links(state).length + '</p>' +
      saveInfo(state) + tabs(active) + panelFor(state, active) +
      '<div class="simple-actions"><button type="button" data-action="open-paragraph-forge">Paragraph Forge</button><button type="button" data-action="open-task-map">Task Map</button></div>' +
      '</article></section>';
  }

  function selectParagraph(id) {
    var state = load();
    bridge(state).activeParagraphId = id;
    bridge(state).activeTab = "build";
    save(state, "Selected paragraph for bridge link");
    render("build", "Selected paragraph for bridge link");
  }

  function saveLink() {
    var form = document.querySelector("[data-bridge-form]");
    if (!form) return render("build", "Bridge form missing");
    var state = load();
    var paragraphId = form.dataset.paragraphId;
    var paragraph = paragraphs(state).find(function (item) { return item.id === paragraphId; });
    if (!paragraph) return render("paragraphs", "Paragraph missing");
    var data = new FormData(form);
    var existing = linkForParagraph(state, paragraphId);
    var link = {
      id: existing ? existing.id : uid(),
      order: existing ? existing.order : links(state).length + 1,
      paragraphId: paragraphId,
      title: clean(data.get("title"), 180) || clean(paragraph.focus || paragraph.bucket, 180),
      detail: clean(data.get("detail"), 1500),
      note: clean(data.get("note"), 900),
      paragraphPreview: clean(paragraph.paragraph, 600),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    bridge(state).links = links(state).filter(function (item) { return item.paragraphId !== paragraphId; });
    bridge(state).links.push(link);
    if (state.unlocked.indexOf("citation-vault") === -1) state.unlocked.push("citation-vault");
    save(state, "Bridge link saved; Citation Vault unlocked");
    render("saved", "Bridge link saved; Citation Vault unlocked");
  }

  function continueToCitationVault() {
    var state = load();
    if (state.completed.indexOf("bridge-hall") === -1) state.completed.push("bridge-hall");
    if (state.unlocked.indexOf("citation-vault") === -1) state.unlocked.push("citation-vault");
    state.current = "citation-vault";
    save(state, "Bridge Hall complete; Citation Vault unlocked");
    var button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.action = "continue-quest";
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    var room = button.dataset.room || "";

    if (action === "open-bridge-hall" || (action === "route-next" && room === "paragraph-forge")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("build", "Bridge Hall opened");
    }
    if (room === "bridge-hall") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === "route-review") return render("saved", "Opened Saved Bridges");
      if (action === "route-gap") return render("missing", "Opened Missing");
      if (action === "route-next") return continueToCitationVault();
      return render("build", "Bridge Hall opened");
    }
    if (action === "bridge-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render(button.dataset.tab || "build", "Opened Bridge Hall");
    }
    if (action === "bridge-select-paragraph") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return selectParagraph(button.dataset.paragraphId || "");
    }
    if (action === "bridge-save-link") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveLink();
    }
    if (action === "bridge-continue-citation") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return continueToCitationVault();
    }
  }, true);
})();