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

    state.routeRooms["citation-vault"] = state.routeRooms["citation-vault"] && typeof state.routeRooms["citation-vault"] === "object" ? state.routeRooms["citation-vault"] : {};
    state.routeRooms["citation-vault"].checks = arr(state.routeRooms["citation-vault"].checks);

    state.routeRooms["paragraph-forge"] = state.routeRooms["paragraph-forge"] && typeof state.routeRooms["paragraph-forge"] === "object" ? state.routeRooms["paragraph-forge"] : {};
    state.routeRooms["paragraph-forge"].paragraphs = arr(state.routeRooms["paragraph-forge"].paragraphs);

    state.routeRooms["polish-pool"] = state.routeRooms["polish-pool"] && typeof state.routeRooms["polish-pool"] === "object" ? state.routeRooms["polish-pool"] : {};
    state.routeRooms["polish-pool"].started = true;
    state.routeRooms["polish-pool"].fixes = arr(state.routeRooms["polish-pool"].fixes);

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
  function pool(state) { return state.routeRooms["polish-pool"]; }

  function checks(state) {
    return arr(state.routeRooms["citation-vault"].checks).slice().sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); });
  }

  function paragraphs(state) {
    return arr(state.routeRooms["paragraph-forge"].paragraphs);
  }

  function fixes(state) {
    return arr(pool(state).fixes).slice().sort(function (a, b) { return Number(a.order || 0) - Number(b.order || 0); });
  }

  function fixForCheck(state, checkId) {
    return fixes(state).find(function (fix) { return fix.checkId === checkId; }) || null;
  }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt) + ' · ' + esc(state.lastAction) + '</p>';
  }

  function styles() {
    return '<style data-polish-pool-v1>' +
      '.polish-pool-room{background-image:linear-gradient(180deg,rgba(5,4,8,.16),rgba(5,4,8,.34)),url("assets/study-cave/polish-pool-placeholder-v01.png"),url("assets/study-cave/citation-vault-placeholder-v01.png"),linear-gradient(135deg,#111827,#12343e)!important;}' +
      '.polish-pool-card{width:min(640px,52vw)!important;max-height:calc(100% - 92px)!important;overflow:auto!important;padding:14px!important;}' +
      '.polish-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.polish-tabs button{border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 9px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:900;cursor:pointer}.polish-tabs button[aria-current="true"]{background:rgba(255,231,171,.92);color:#2f2118;}' +
      '.polish-item{padding:9px;border-radius:14px;border:1px solid rgba(255,231,171,.38);background:rgba(7,10,18,.72);margin:8px 0}.polish-chip{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;margin:2px}.polish-text{max-height:92px;overflow:auto;padding:7px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.88rem}.polish-pool-card textarea,.polish-pool-card input{width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit}.polish-pool-card label{display:block;margin:8px 0;font-weight:900}' +
      '@media(max-width:920px){.polish-pool-card{width:calc(100% - 28px)!important}}' +
      '</style>';
  }

  function tabs(active) {
    var items = [["polish", "Polish Fix"], ["checks", "Citation Checks"], ["saved", "Saved Fixes"], ["missing", "Missing"]];
    return '<nav class="polish-tabs" aria-label="Polish Pool tabs">' + items.map(function (item) {
      return '<button type="button" data-action="polish-tab" data-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join("") + '</nav>';
  }

  function checkSummary(check) {
    return '<strong>' + esc(check.title || "Citation check") + '</strong><br>' +
      '<span class="polish-chip">citation checked</span>' +
      '<div class="polish-text">' + esc(check.detail || "") + '</div>' +
      (check.note ? '<p><em>' + esc(check.note) + '</em></p>' : '');
  }

  function relatedParagraph(state, check) {
    var linkPreview = clean(check.linkPreview, 200);
    if (linkPreview) return linkPreview;
    var para = paragraphs(state)[0];
    return para ? clean(para.paragraph, 200) : "Paragraph text still needs a final clarity pass.";
  }

  function suggestedFix(state, check) {
    return "Check the paragraph for clarity and make sure the source/citation detail is not just a placeholder. Keep the useful evidence, remove repeated wording, and make the point easier to follow.";
  }

  function polishPanel(state) {
    var list = checks(state);
    if (!list.length) {
      return '<h3>Polish Fix</h3><p>No Citation Vault checks found yet. Save a citation check first.</p><div class="simple-actions"><button type="button" data-action="open-citation-vault">Citation Vault</button></div>';
    }
    var activeId = pool(state).activeCheckId || list[0].id;
    var check = list.find(function (item) { return item.id === activeId; }) || list[0];
    pool(state).activeCheckId = check.id;
    return '<h3>Polish Fix</h3>' +
      '<section class="polish-item">' + checkSummary(check) + '<div class="polish-text">Paragraph/context: ' + esc(relatedParagraph(state, check)) + '</div></section>' +
      '<form data-polish-form data-check-id="' + esc(check.id) + '">' +
      '<label>Section / issue<input name="title" value="' + esc(check.title || "Citation / clarity check") + '"></label>' +
      '<label>Fix made<textarea name="detail" rows="5">' + esc(suggestedFix(state, check)) + '</textarea></label>' +
      '<label>Final check note<textarea name="note" rows="3" placeholder="What still needs a final read?"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="polish-save-fix">Save polish fix</button><button type="button" data-action="polish-tab" data-tab="checks">Choose another check</button></div>' +
      '</form>';
  }

  function checksPanel(state) {
    var list = checks(state);
    if (!list.length) return '<h3>Citation Checks</h3><p>No citation checks saved yet.</p>';
    return '<h3>Citation Checks</h3>' + list.map(function (check) {
      var done = fixForCheck(state, check.id);
      return '<section class="polish-item">' + checkSummary(check) + '<div class="simple-actions">' +
        (done ? '<button type="button" disabled>Polish fix saved</button>' : '<button type="button" data-action="polish-select-check" data-check-id="' + esc(check.id) + '">Polish this issue</button>') +
        '</div></section>';
    }).join("");
  }

  function savedPanel(state) {
    var saved = fixes(state);
    if (!saved.length) return '<h3>Saved Fixes</h3><p>No polish fixes saved yet.</p>';
    return '<h3>Saved Fixes</h3><ol>' + saved.map(function (fix) {
      return '<li class="polish-item"><strong>' + esc(fix.title || "Polish fix") + '</strong><br><div class="polish-text">' + esc(fix.detail || "") + '</div><em>' + esc(fix.note || "") + '</em></li>';
    }).join("") + '</ol><div class="simple-actions"><button type="button" data-action="polish-continue-submission">Continue to Submission Gate</button></div>';
  }

  function missingPanel(state) {
    var missing = checks(state).filter(function (check) { return !fixForCheck(state, check.id); });
    return '<h3>Missing</h3><p><strong>Citation checks without polish fixes:</strong> ' + missing.length + '</p>' +
      (missing.length ? '<ul>' + missing.map(function (check) { return '<li>' + esc(check.title || "Citation check") + '</li>'; }).join("") + '</ul>' : '<p>None.</p>');
  }

  function panelFor(state, tab) {
    if (tab === "checks") return checksPanel(state);
    if (tab === "saved") return savedPanel(state);
    if (tab === "missing") return missingPanel(state);
    return polishPanel(state);
  }

  function render(tab, message) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    state.current = "polish-pool";
    if (state.unlocked.indexOf("polish-pool") === -1) state.unlocked.push("polish-pool");
    pool(state).started = true;
    var active = tab || pool(state).activeTab || "polish";
    pool(state).activeTab = active;
    save(state, message || "Polish Pool opened");
    node.innerHTML = styles() + '<section class="simple-room polish-pool-room"><p class="scene-label">Polish Pool</p>' +
      '<article class="stage-card simple-card polish-pool-card"><h2>Polish Pool</h2>' +
      '<p>Record clarity, wording, formatting, proofreading, and obvious mistake fixes.</p>' +
      '<p><strong>Citation checks:</strong> ' + checks(state).length + ' · <strong>Polish fixes:</strong> ' + fixes(state).length + '</p>' +
      saveInfo(state) + tabs(active) + panelFor(state, active) +
      '<div class="simple-actions"><button type="button" data-action="open-citation-vault">Citation Vault</button><button type="button" data-action="open-task-map">Task Map</button></div>' +
      '</article></section>';
  }

  function selectCheck(id) {
    var state = load();
    pool(state).activeCheckId = id;
    pool(state).activeTab = "polish";
    save(state, "Selected citation check for polish fix");
    render("polish", "Selected citation check for polish fix");
  }

  function saveFix() {
    var form = document.querySelector("[data-polish-form]");
    if (!form) return render("polish", "Polish form missing");
    var state = load();
    var checkId = form.dataset.checkId;
    var check = checks(state).find(function (item) { return item.id === checkId; });
    if (!check) return render("checks", "Citation check missing");
    var data = new FormData(form);
    var existing = fixForCheck(state, checkId);
    var fix = {
      id: existing ? existing.id : uid(),
      order: existing ? existing.order : fixes(state).length + 1,
      checkId: checkId,
      title: clean(data.get("title"), 180) || "Polish fix",
      detail: clean(data.get("detail"), 1500),
      note: clean(data.get("note"), 900),
      citationPreview: clean(check.detail, 600),
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    pool(state).fixes = fixes(state).filter(function (item) { return item.checkId !== checkId; });
    pool(state).fixes.push(fix);
    if (state.unlocked.indexOf("submission-gate") === -1) state.unlocked.push("submission-gate");
    save(state, "Polish fix saved; Submission Gate unlocked");
    render("saved", "Polish fix saved; Submission Gate unlocked");
  }

  function continueToSubmissionGate() {
    var state = load();
    if (state.completed.indexOf("polish-pool") === -1) state.completed.push("polish-pool");
    if (state.unlocked.indexOf("submission-gate") === -1) state.unlocked.push("submission-gate");
    state.current = "submission-gate";
    save(state, "Polish Pool complete; Submission Gate unlocked");
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

    if (action === "open-polish-pool" || (action === "route-next" && room === "citation-vault")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("polish", "Polish Pool opened");
    }
    if (action === "continue-quest" && load().current === "polish-pool") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("polish", "Polish Pool opened");
    }
    if (room === "polish-pool") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === "route-review") return render("saved", "Opened Saved Fixes");
      if (action === "route-gap") return render("missing", "Opened Missing");
      if (action === "route-next") return continueToSubmissionGate();
      return render("polish", "Polish Pool opened");
    }
    if (action === "polish-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render(button.dataset.tab || "polish", "Opened Polish Pool");
    }
    if (action === "polish-select-check") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return selectCheck(button.dataset.checkId || "");
    }
    if (action === "polish-save-fix") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveFix();
    }
    if (action === "polish-continue-submission") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return continueToSubmissionGate();
    }
  }, true);
})();