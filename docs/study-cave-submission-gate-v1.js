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

    ensureRoom(state, "draft-route", "markers");
    ensureRoom(state, "paragraph-forge", "paragraphs");
    ensureRoom(state, "bridge-hall", "links");
    ensureRoom(state, "citation-vault", "checks");
    ensureRoom(state, "polish-pool", "fixes");
    ensureRoom(state, "submission-gate", "checks");

    state.lastSavedAt = state.lastSavedAt || "Not saved yet";
    state.lastAction = state.lastAction || "Ready";
    return state;
  }

  function ensureRoom(state, roomId, listKey) {
    state.routeRooms[roomId] = state.routeRooms[roomId] && typeof state.routeRooms[roomId] === "object" ? state.routeRooms[roomId] : {};
    state.routeRooms[roomId][listKey] = arr(state.routeRooms[roomId][listKey]);
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
  function room(state) { return state.routeRooms["submission-gate"]; }

  function markers(state) { return arr(state.routeRooms["draft-route"].markers); }
  function paragraphs(state) { return arr(state.routeRooms["paragraph-forge"].paragraphs); }
  function links(state) { return arr(state.routeRooms["bridge-hall"].links); }
  function citations(state) { return arr(state.routeRooms["citation-vault"].checks); }
  function fixes(state) { return arr(state.routeRooms["polish-pool"].fixes); }
  function finalChecks(state) { return arr(room(state).checks); }

  function saveInfo(state) {
    return '<p class="save-status"><strong>Browser save:</strong> ' + esc(state.lastSavedAt) + ' · ' + esc(state.lastAction) + '</p>';
  }

  function styles() {
    return '<style data-submission-gate-v1>' +
      '.submission-gate-room{background-image:linear-gradient(180deg,rgba(5,4,8,.16),rgba(5,4,8,.36)),url("assets/study-cave/submission-gate-placeholder-v01.png"),url("assets/study-cave/polish-pool-placeholder-v01.png"),linear-gradient(135deg,#1c1412,#43311d)!important;}' +
      '.submission-gate-card{width:min(660px,54vw)!important;max-height:calc(100% - 92px)!important;overflow:auto!important;padding:14px!important;}' +
      '.submission-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.submission-tabs button{border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 9px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:900;cursor:pointer}.submission-tabs button[aria-current="true"]{background:rgba(255,231,171,.92);color:#2f2118;}' +
      '.submission-item{padding:9px;border-radius:14px;border:1px solid rgba(255,231,171,.38);background:rgba(7,10,18,.72);margin:8px 0}.submission-chip{display:inline-block;padding:3px 7px;border-radius:999px;background:rgba(255,231,171,.9);color:#2f2118;font-weight:900;font-size:.78rem;margin:2px}.submission-text{max-height:110px;overflow:auto;padding:7px;border-radius:10px;background:rgba(255,255,255,.08);font-size:.88rem}.submission-gate-card textarea,.submission-gate-card input{width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border-radius:10px;border:1px solid rgba(236,215,170,.36);font:inherit}.submission-gate-card label{display:block;margin:8px 0;font-weight:900}' +
      '@media(max-width:920px){.submission-gate-card{width:calc(100% - 28px)!important}}' +
      '</style>';
  }

  function tabs(active) {
    var items = [["final", "Final Spell"], ["summary", "Route Summary"], ["saved", "Saved Checks"], ["missing", "Missing"]];
    return '<nav class="submission-tabs" aria-label="Submission Gate tabs">' + items.map(function (item) {
      return '<button type="button" data-action="submission-tab" data-tab="' + item[0] + '" aria-current="' + (active === item[0] ? "true" : "false") + '">' + item[1] + '</button>';
    }).join("") + '</nav>';
  }

  function latestFix(state) {
    return fixes(state)[fixes(state).length - 1] || null;
  }

  function finalPanel(state) {
    var fix = latestFix(state);
    if (!fix) {
      return '<h3>Final Spell</h3><p>No Polish Pool fix found yet. Save a polish fix first.</p><div class="simple-actions"><button type="button" data-action="open-polish-pool">Polish Pool</button></div>';
    }
    return '<h3>Final Spell</h3>' +
      '<section class="submission-item"><strong>Latest polish fix</strong><br><span class="submission-chip">ready for final check</span><div class="submission-text">' + esc(fix.detail || "") + '</div>' + (fix.note ? '<p><em>' + esc(fix.note) + '</em></p>' : '') + '</section>' +
      '<form data-submission-form>' +
      '<label>Final check label<input name="title" value="Final readiness check"></label>' +
      '<label>What is ready?<textarea name="detail" rows="5">The route has evidence, a paragraph, a bridge link, a citation check, and a polish fix. The draft is ready for final export/checking.</textarea></label>' +
      '<label>Anything still missing?<textarea name="note" rows="3" placeholder="Record any last issue before submission"></textarea></label>' +
      '<div class="simple-actions"><button type="button" data-action="submission-save-check">Save final check</button><button type="button" data-action="submission-tab" data-tab="summary">Review route summary</button></div>' +
      '</form>';
  }

  function summaryPanel(state) {
    return '<h3>Route Summary</h3>' +
      '<section class="submission-item"><span class="submission-chip">Draft markers: ' + markers(state).length + '</span><span class="submission-chip">Paragraphs: ' + paragraphs(state).length + '</span><span class="submission-chip">Bridge links: ' + links(state).length + '</span><span class="submission-chip">Citation checks: ' + citations(state).length + '</span><span class="submission-chip">Polish fixes: ' + fixes(state).length + '</span></section>' +
      '<ol>' + paragraphs(state).map(function (paragraph) {
        return '<li class="submission-item"><strong>' + esc(paragraph.focus || paragraph.bucket || "Paragraph") + '</strong><div class="submission-text">' + esc(paragraph.paragraph || "") + '</div></li>';
      }).join("") + '</ol>';
  }

  function savedPanel(state) {
    var saved = finalChecks(state);
    if (!saved.length) return '<h3>Saved Checks</h3><p>No final checks saved yet.</p>';
    return '<h3>Saved Checks</h3><ol>' + saved.map(function (check) {
      return '<li class="submission-item"><strong>' + esc(check.title || "Final check") + '</strong><br><div class="submission-text">' + esc(check.detail || "") + '</div><em>' + esc(check.note || "") + '</em></li>';
    }).join("") + '</ol><div class="simple-actions"><button type="button" data-action="submission-complete">Complete Final Spell</button></div>';
  }

  function missingPanel(state) {
    var missing = [];
    if (!markers(state).length) missing.push("Draft Route marker");
    if (!paragraphs(state).length) missing.push("Paragraph Forge paragraph");
    if (!links(state).length) missing.push("Bridge Hall link");
    if (!citations(state).length) missing.push("Citation Vault check");
    if (!fixes(state).length) missing.push("Polish Pool fix");
    if (!finalChecks(state).length) missing.push("Final saved check");
    return '<h3>Missing</h3>' + (missing.length ? '<ul>' + missing.map(function (item) { return '<li>' + esc(item) + '</li>'; }).join("") + '</ul>' : '<p>Nothing missing for the current v1 route.</p>');
  }

  function panelFor(state, tab) {
    if (tab === "summary") return summaryPanel(state);
    if (tab === "saved") return savedPanel(state);
    if (tab === "missing") return missingPanel(state);
    return finalPanel(state);
  }

  function render(tab, message) {
    var state = load();
    var node = stage();
    if (!node) return;
    closePanels();
    node.hidden = false;
    state.current = "submission-gate";
    if (state.unlocked.indexOf("submission-gate") === -1) state.unlocked.push("submission-gate");
    room(state).started = true;
    var active = tab || room(state).activeTab || "final";
    room(state).activeTab = active;
    save(state, message || "Submission Gate opened");
    node.innerHTML = styles() + '<section class="simple-room submission-gate-room"><p class="scene-label">Submission Gate / Final Spell</p>' +
      '<article class="stage-card simple-card submission-gate-card"><h2>Submission Gate / Final Spell</h2>' +
      '<p>Final readiness checkpoint for the current Study Cave route.</p>' +
      '<p><strong>Final checks:</strong> ' + finalChecks(state).length + '</p>' +
      saveInfo(state) + tabs(active) + panelFor(state, active) +
      '<div class="simple-actions"><button type="button" data-action="open-polish-pool">Polish Pool</button><button type="button" data-action="open-task-map">Task Map</button></div>' +
      '</article></section>';
  }

  function saveFinalCheck() {
    var form = document.querySelector("[data-submission-form]");
    if (!form) return render("final", "Final check form missing");
    var state = load();
    var data = new FormData(form);
    var check = {
      id: uid(),
      order: finalChecks(state).length + 1,
      title: clean(data.get("title"), 180) || "Final readiness check",
      detail: clean(data.get("detail"), 1800),
      note: clean(data.get("note"), 900),
      createdAt: new Date().toISOString()
    };
    room(state).checks.push(check);
    if (state.completed.indexOf("submission-gate") === -1) state.completed.push("submission-gate");
    state.finalSpellComplete = true;
    save(state, "Final check saved; route complete");
    render("saved", "Final check saved; route complete");
  }

  function completeFinalSpell() {
    var state = load();
    if (state.completed.indexOf("submission-gate") === -1) state.completed.push("submission-gate");
    state.finalSpellComplete = true;
    state.current = "submission-gate";
    save(state, "Final spell complete");
    render("saved", "Final spell complete");
  }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    var roomId = button.dataset.room || "";

    if (action === "open-submission-gate" || (action === "route-next" && roomId === "polish-pool")) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("final", "Submission Gate opened");
    }
    if (action === "continue-quest" && load().current === "submission-gate") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render("final", "Submission Gate opened");
    }
    if (roomId === "submission-gate") {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (action === "route-review") return render("saved", "Opened Saved Checks");
      if (action === "route-gap") return render("missing", "Opened Missing");
      if (action === "route-next") return completeFinalSpell();
      return render("final", "Submission Gate opened");
    }
    if (action === "submission-tab") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return render(button.dataset.tab || "final", "Opened Submission Gate");
    }
    if (action === "submission-save-check") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveFinalCheck();
    }
    if (action === "submission-complete") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return completeFinalSpell();
    }
  }, true);
})();