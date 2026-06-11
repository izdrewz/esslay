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
    state.routeRooms["bridge-hall"] = state.routeRooms["bridge-hall"] && typeof state.routeRooms["bridge-hall"] === "object" ? state.routeRooms["bridge-hall"] : {};
    state.routeRooms["bridge-hall"].links = arr(state.routeRooms["bridge-hall"].links);
    state.routeRooms["paragraph-forge"] = state.routeRooms["paragraph-forge"] && typeof state.routeRooms["paragraph-forge"] === "object" ? state.routeRooms["paragraph-forge"] : {};
    state.routeRooms["paragraph-forge"].paragraphs = arr(state.routeRooms["paragraph-forge"].paragraphs);
    state.routeRooms["citation-vault"] = state.routeRooms["citation-vault"] && typeof state.routeRooms["citation-vault"] === "object" ? state.routeRooms["citation-vault"] : {};
    state.routeRooms["citation-vault"].started = true;
    state.routeRooms["citation-vault"].checks = arr(state.routeRooms["citation-vault"].checks);
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

  function stage() { return document.getElementById("stage-scene"); }
  function closePanels() { document.querySelectorAll("details[open]").forEach(function (details) { details.open = false; }); }
  function vault(state) { return state.routeRooms["citation-vault"]; }

  function links(state) {
    return arr(state.routeRooms["bridge-hall"].links).slice().sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); });
  }

  function paragraphs(state) {
    return arr(state.routeRooms["paragraph-forge"].paragraphs);
  }

  function checks(state) {
    return arr(vault(state).checks).slice().sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); });
  }

  function checkForLink(state, linkId) {
    return checks(state).find(function (check) { return check.linkId === linkId; }) || null;
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt) + ' · ' + esc(state.lastAction) + '</p>';
  }

  function styles() {
    return '<style data-citation-vault-v1>' +
      '.citation-vault-room{background-image:linear-gradient(180deg,rgba(5,4,8,.18),rgba(5,4,8,.36)),url("assets/study-cave/citation-vault-placeholder-v01.png"),url("assets/study-cave/bridge-hall-placeholder-v01.png"),linear-gradient(135deg,#17111d,#2e231a)!important;}' +
      '.citation-vault-card{width:min(640px,52vw)!important;max-height:calc(100% - 92px)!important;overflow:auto!important;padding:14px!important;}' +
      '.citation-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.citation-tabs button{border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 9px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:900;cursor:pointer}.citation-tabs button[aria-current="true"]{background:rgba(255,231,171,.92);color:#2f2118;}' +
      '.citation-item{padding:9px;border-radius:14px;border:1px solid rgba(255,231,171,.38);background:rgba(7,10,18,.72);margin:8px 0}.citation-chip{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;margin:2px}.citation-text{max-height:92px;overflow:auto;padding:7px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.88rem}.citation-vault-card textarea,.citation-vault-card input{width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit}.citation-vault-card label{display:block;margin:8px 0;font-weight:900}' +
      '@media(max-width:920px){.citation-vault-card{width:calc(100% - 28px)!important}}' +
      '</style>';
  }

  function tabs(active) {
    var items = [["check", "Check Citation"], ["links", "Bridge Links"], ["saved", "Saved Checks"], ["missing", "Missing"]];
    return '<nav class="citation-tabs" aria-label="Citation Vault tabs">' + items.map(function (item) {
      return '<button type="button" data-action="citation-tab" data-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join("") + '</nav>';
  }

  function linkSummary(link) {
    return '<strong>' + esc(link.title || "Bridge link") + '</strong><br>' +
      '<span class="citation-chip">flow link</span>' +
      '<div class="citation-text">' + esc(link.detail || "") + '</div>' +
      (link.paragraphPreview ? '<p><em>Paragraph: ' + esc(clean(link.paragraphPreview, 180)) + '</em></p>' : '');
  }

  function sourceHint(state, link) {
    var paragraph = paragraphs(state).find(function (item) { return item.id === link.paragraphId; });
    return (paragraph && paragraph.citationLabel) || "source label needed";
  }

  function checkPanel(state) {
    var list = links(state);
    if (!list.length) {
      return '<h3>Check Citation</h3><p>No Bridge Hall links found yet. Save a bridge link first.</p><div class="simple-actions"><button type="button" data-action="open-bridge-hall">Bridge Hall</button></div>';
    }
    var activeId = vault(state).activeLinkId || list[0].id;
    var link = list.find(function (item) { return item.id === activeId; }) || list[0];
    vault(state).activeLinkId = link.id;
    return '<h3>Check Citation</h3>' +
      '<section class="citation-item">' + linkSummary(link) + '</section>' +
      '<form data-citation-form data-link-id="' + esc(link.id) + '">' +
      '<label>Source / quote label<input name="title" value="' + esc(sourceHint(state, link)) + '"></label>' +
      '<label>Citation / reference detail<textarea name="detail" rows="5" placeholder="Author, year, page, module unit, video timestamp, URL, or source detail"></textarea></label>' +
      '<label>Gap or fix needed<textarea name="note" rows="3" placeholder="What still needs checking?"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="citation-save-check">Save citation check</button><button type="button" data-action="citation-tab" data-tab="links">Choose another link</button></div>' +
      '</form>';
  }

  function linksPanel(state) {
    var list = links(state);
    if (!list.length) return '<h3>Bridge Links</h3><p>No bridge links saved yet.</p>';
    return '<h3>Bridge Links</h3>' + list.map(function (link) {
      var done = checkForLink(state, link.id);
      return '<section class="citation-item">' + linkSummary(link) + '<div class="simple-actions">' +
        (done ? '<button type="button" disabled>Citation checked</button>' : '<button type="button" data-action="citation-select-link" data-link-id="' + esc(link.id) + '">Check this citation</button>') +
        '</div></section>';
    }).join("");
  }

  function savedPanel(state) {
    var saved = checks(state);
    if (!saved.length) return '<h3>Saved Checks</h3><p>No citation checks saved yet.</p>';
    return '<h3>Saved Checks</h3><ol>' + saved.map(function (check) {
      return '<li class="citation-item"><strong>' + esc(check.title || "Citation check") + '</strong><br><div class="citation-text">' + esc(check.detail || "") + '</div><em>' + esc(check.note || "") + '</em></li>';
    }).join("") + '</ol><div class="simple-actions"><button type="button" data-action="citation-continue-polish">Continue to Polish Pool</button></div>';
  }

  function missingPanel(state) {
    var missing = links(state).filter(function (link) { return !checkForLink(state, link.id); });
    return '<h3>Missing</h3><p><strong>Bridge links without citation checks:</strong> ' + missing.length + '</p>' +
      (missing.length ? '<ul>' + missing.map(function (link) { return '<li>' + esc(link.title || "Bridge link") + '</li>'; }).join("") + '</ul>' : '<p>None.</p>');
  }

  function panelFor(state, tab) {
    if (tab === "links") return linksPanel(state);
    if (tab === "saved") return savedPanel(state);
    if (tab === "missing") return missingPanel(state);
    return checkPanel(state);
  }

  function render(tab, message) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    state.current = "citation-vault";
    if (state.unlocked.indexOf("citation-vault") === -1) state.unlocked.push("citation-vault");
    vault(state).started = true;
    var active = tab || vault(state).activeTab || "check";
    vault(state).activeTab = active;
    save(state, message || "Citation Vault opened");
    node.innerHTML = styles() + '<section class="simple-room citation-vault-room"><p class="scene-label">Citation Vault</p>' +
      '<article class="stage-card simple-card citation-vault-card"><h2>Citation Vault</h2>' +
      '<p>Check source labels, citation details, gaps, and quote integration.</p>' +
      '<p><strong>Bridge links:</strong> ' + links(state).length + ' · <strong>Citation checks:</strong> ' + checks(state).length + '</p>' +
      saveInfo(state) + tabs(active) + panelFor(state, active) +
      '<div class="simple-actions"><button type="button" data-action="open-bridge-hall">Bridge Hall</button><button type="button" data-action="open-task-map">Task Map</button></div>' +
      '</article></section>';
  }

  function selectLink(id) {
    var state = load();
    vault(state).activeLinkId = id;
    vault(state).activeTab = "check";
    save(state, "Selected bridge link for citation check");
    render("check", "Selected bridge link for citation check");
  }

  function saveCheck() {
    var form = document.querySelector("[data-citation-form]");
    if (!form) return render("check", "Citation form missing");
    var state = load();
    var linkId = form.dataset.linkId;
    var link = links(state).find(function (item) { return item.id === linkId; });
    if (!link) return render("links", "Bridge link missing");
    var data = new FormData(form);
    var existing = checkForLink(state, linkId);
    var check = {
      id: existing ? existing.id : uid(),
      order: existing ? existing.order : checks(state).length + 1,
      linkId: linkId,
      title: clean(data.get("title"), 180) || "source label needed",
      detail: clean(data.get("detail"), 1500),
      note: clean(data.get("note"), 900),
      linkPreview: clean(link.detail, 600),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    vault(state).checks = checks(state).filter(function (item) { return item.linkId !== linkId; });
    vault(state).checks.push(check);
    if (state.unlocked.indexOf("polish-pool") === -1) state.unlocked.push("polish-pool");
    save(state, "Citation check saved; Polish Pool unlocked");
    render("saved", "Citation check saved; Polish Pool unlocked");
  }

  function continueToPolishPool() {
    var state = load();
    if (state.completed.indexOf("citation-vault") === -1) state.completed.push("citation-vault");
    if (state.unlocked.indexOf("polish-pool") === -1) state.unlocked.push("polish-pool");
    state.current = "polish-pool";
    save(state, "Citation Vault complete; Polish Pool unlocked");
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

    if (action === "open-citation-vault" || (action === "route-next" && room === "bridge-hall")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("check", "Citation Vault opened");
    }
    if (action === "continue-quest" && load().current === "citation-vault") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("check", "Citation Vault opened");
    }
    if (room === "citation-vault") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === "route-review") return render("saved", "Opened Saved Checks");
      if (action === "route-gap") return render("missing", "Opened Missing");
      if (action === "route-next") return continueToPolishPool();
      return render("check", "Citation Vault opened");
    }
    if (action === "citation-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render(button.dataset.tab || "check", "Opened Citation Vault");
    }
    if (action === "citation-select-link") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return selectLink(button.dataset.linkId || "");
    }
    if (action === "citation-save-check") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveCheck();
    }
    if (action === "citation-continue-polish") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return continueToPolishPool();
    }
  }, true);
})();