(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  var fog = window.EsslayTaskScrollAutoFog;
  var ui = window.EsslayTaskScrollUI;
  if (!core || !fog || !ui || window.__esslayTaskScrollChronologicalReviewLoaded) return;
  window.__esslayTaskScrollChronologicalReviewLoaded = true;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
    });
  }

  function unique(values) {
    var seen = {};
    return (values || []).map(function (value) { return String(value || "").trim(); }).filter(function (value) {
      if (!value || seen[value]) return false;
      seen[value] = true;
      return true;
    });
  }

  function words(value) {
    return String(value || "").toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) || [];
  }

  function ordered(scroll) {
    return (scroll.fragments || []).slice().sort(function (a, b) {
      return (Number(a.pageNumber || 0) - Number(b.pageNumber || 0)) || (Number(a.chunkIndex || 0) - Number(b.chunkIndex || 0));
    });
  }

  function learning(state) {
    state.briefFog = state.briefFog || {};
    var data = state.briefFog.taskScrollLearning;
    if (!data || typeof data !== "object") data = {};
    data.version = 2;
    data.corrections = Number(data.corrections || 0);
    data.confirmations = Number(data.confirmations || 0);
    data.weights = data.weights && typeof data.weights === "object" ? data.weights : {};
    data.history = Array.isArray(data.history) ? data.history : [];
    Object.keys(core.ROLES).forEach(function (role) {
      if (role && (!data.weights[role] || typeof data.weights[role] !== "object")) data.weights[role] = {};
    });
    state.briefFog.taskScrollLearning = data;
    return data;
  }

  function clamp(value, low, high) { return Math.max(low, Math.min(high, value)); }

  function selectedCues(fragment) {
    var cues = Array.prototype.slice.call(document.querySelectorAll("[data-chron-cue][aria-pressed='true']")).map(function (node) {
      return node.dataset.chronCue || "";
    });
    var custom = document.querySelector("[data-chron-custom-cue]");
    if (custom && custom.value.trim()) cues.push(custom.value.trim());
    if (!cues.length && fragment.auto && Array.isArray(fragment.auto.signals)) cues = fragment.auto.signals.slice();
    if (!cues.length) cues = words(fragment.text).slice(0, 6);
    return unique(cues).slice(0, 8);
  }

  function recordChoice(fragmentId, role, note) {
    var state = fog.state();
    var scroll = state.briefFog.taskScroll;
    var fragment = scroll.fragments.find(function (item) { return item.id === fragmentId; });
    if (!fragment || !Object.prototype.hasOwnProperty.call(core.ROLES, role)) return false;

    var original = fragment.autoInitialRole || (fragment.auto && fragment.auto.role) || "";
    fragment.autoInitialRole = original;
    var cues = selectedCues(fragment);
    var changed = !original || original !== role;
    var key = [original || "uncertain", role, cues.join("|")].join("::");
    var profile = learning(state);

    fragment.role = role;
    fragment.status = role === "parked" ? "parked" : (changed ? "player-confirmed" : "fog-confirmed");
    fragment.note = core.text(note, 900);
    fragment.decidedAt = core.iso();
    fragment.learningFromRole = original;
    fragment.learningCues = cues;
    fragment.learningAppliedRole = role;
    scroll.recipeConfirmedAt = "";

    if (fragment.learningRecordedKey !== key) {
      if (role !== "parked") {
        cues.forEach(function (cue) {
          words(cue).forEach(function (word) {
            profile.weights[role][word] = clamp(Number(profile.weights[role][word] || 0) + (changed ? 1.2 : 0.3), -4, 6);
            if (changed && original && original !== role && profile.weights[original]) {
              profile.weights[original][word] = clamp(Number(profile.weights[original][word] || 0) - 0.35, -4, 6);
            }
          });
        });
      }
      if (changed) profile.corrections += 1;
      else profile.confirmations += 1;
      profile.history.unshift({ at: core.iso(), from: original || "uncertain", to: role, cues: cues, note: fragment.note });
      profile.history = profile.history.slice(0, 80);
      fragment.learningRecordedKey = key;
    }

    core.save(state, changed ? "Quest Scroll role corrected and learned locally" : "Quest Scroll role confirmed locally");
    return true;
  }

  function options(selected) {
    return Object.keys(core.ROLES).map(function (role) {
      var label = role ? core.ROLES[role] : "Choose a role";
      return '<option value="' + esc(role) + '"' + (role === selected ? " selected" : "") + '>' + esc(label) + '</option>';
    }).join("");
  }

  function cueButtons(signals) {
    if (!signals || !signals.length) return '<p class="chron-muted">No automatic wording cue. Add one below only if you want this decision to become a stronger local example.</p>';
    return '<div class="chron-cues">' + signals.map(function (signal) {
      return '<button type="button" class="chron-cue" data-action="chron-toggle-cue" data-chron-cue="' + esc(signal) + '" aria-pressed="true">' + esc(signal) + '</button>';
    }).join("") + '</div>';
  }

  function reviewHome(message) {
    var state = fog.state();
    var scroll = state.briefFog.taskScroll;
    if (!scroll.fragments.length) return ui.home("Bring a Quest Scroll before reviewing it.");
    var items = ordered(scroll);
    var saved = items.filter(function (item) { return !!item.role; }).length;
    var profile = learning(state);
    ui.render('<article class="stage-card simple-card ts-card chron-card"><h2>Brief Fog</h2><p><strong>Quest Scroll review</strong></p><p>Every fragment is shown in PDF order. The Fog has already preselected a role where it has an estimate. Leave it selected and continue, or change the dropdown on that card.</p><p class="chron-muted">' + saved + ' of ' + items.length + ' fragments currently have a saved role. Local learning: ' + profile.corrections + ' correction(s), ' + profile.confirmations + ' confirmation(s).</p><p class="ts-status">' + esc(message || "Reviewing a card does not erase earlier decisions.") + '</p><section class="chron-zone"><p><strong>Start at fragment 1</strong> and move forward in order. Earlier choices remain visible and editable.</p><div class="simple-actions"><button type="button" data-action="chron-open" data-index="0">Review Quest Scroll in order</button><button type="button" data-action="task-scroll-review">Open full edit list</button><button type="button" data-action="task-scroll-recipe">Open Spell Recipe</button></div></section></article>');
  }

  function reviewCard(index, message) {
    var state = fog.state();
    var scroll = state.briefFog.taskScroll;
    var items = ordered(scroll);
    if (!items.length) return reviewHome();
    index = Math.max(0, Math.min(Number(index || 0), items.length - 1));
    var fragment = items[index];
    var autoData = fragment.auto || {};
    var selected = fragment.role || autoData.role || "";
    var source = fragment.role ? "Saved choice" : (autoData.role ? "Fog estimate" : "Fog uncertain");
    var ingredient = selected === "required-evidence" || selected === "key-scope";
    var status = fragment.role ? core.ROLES[fragment.role] : (autoData.role ? core.ROLES[autoData.role] : "Choose a role");
    var nextLabel = index === items.length - 1 ? "Save selection and finish review" : "Save selection → next fragment";

    ui.render('<article class="stage-card simple-card ts-card chron-card"><h2>Brief Fog</h2><p><strong>Quest Scroll review</strong> · Fragment ' + (index + 1) + ' of ' + items.length + '</p><section class="chron-zone"><p class="ts-meta">' + esc(ui.meta(scroll, fragment)) + '</p><p class="chron-status">' + esc(source) + ': <strong>' + esc(status) + '</strong></p><div class="ts-text">' + esc(fragment.text) + '</div><label>Role for this fragment<select data-chron-role>' + options(selected) + '</select></label><p class="chron-help">The dropdown is already set to the Fog’s estimate when it has one. Change it only when you disagree.</p><details class="chron-learn"><summary>Optional: teach the Fog why this role fits</summary><p class="chron-help">The highlighted cues are what the Fog noticed. Leave them on, turn irrelevant ones off, or add your own phrase. This is used only for local future estimates.</p>' + cueButtons(autoData.signals) + '<label>Add your own word or phrase<input data-chron-custom-cue placeholder="Optional"></label></details><label data-chron-note-label>' + (ingredient ? 'Crystal-slot name' : 'Why it matters / note') + '<textarea rows="3" data-chron-note placeholder="' + (ingredient ? 'Short Source Mine ingredient name' : 'Optional note') + '">' + esc(fragment.note || "") + '</textarea></label><p class="ts-status">' + esc(message || "") + '</p><div class="simple-actions">' + (index > 0 ? '<button type="button" data-action="chron-open" data-index="' + (index - 1) + '">Previous fragment</button>' : '') + '<button type="button" data-action="chron-save-next" data-index="' + index + '" data-id="' + esc(fragment.id) + '">' + nextLabel + '</button><button type="button" data-action="chron-back-home">Review overview</button></div></section></article>');
  }

  function updateFields() {
    var select = document.querySelector("[data-chron-role]");
    var label = document.querySelector("[data-chron-note-label]");
    var note = document.querySelector("[data-chron-note]");
    if (!select || !label || !note) return;
    var ingredient = select.value === "required-evidence" || select.value === "key-scope";
    label.firstChild.nodeValue = ingredient ? "Crystal-slot name" : "Why it matters / note";
    note.placeholder = ingredient ? "Short Source Mine ingredient name" : "Optional note";
  }

  function note() {
    var field = document.querySelector("[data-chron-note]");
    return field ? field.value : "";
  }

  function styles() {
    if (document.querySelector("style[data-chronological-review-v1]")) return;
    var style = document.createElement("style");
    style.setAttribute("data-chronological-review-v1", "");
    style.textContent = '.chron-card{max-width:560px!important}.chron-zone{margin:10px 0;padding:10px;border:1px solid rgba(255,231,171,.36);border-radius:14px;background:rgba(7,10,18,.76)}.chron-zone label{display:block;margin-top:10px;font-weight:900}.chron-zone input,.chron-zone select,.chron-zone textarea{display:block;width:100%;box-sizing:border-box;margin-top:4px}.chron-muted,.chron-help{font-size:.87rem;opacity:.9}.chron-status{padding:7px;border-radius:10px;background:rgba(255,231,171,.12)}.chron-learn{margin-top:10px;padding:8px;border:1px solid rgba(255,231,171,.22);border-radius:10px}.chron-cues{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0}.chron-cue{padding:5px 8px;border-radius:999px;border:1px solid rgba(255,231,171,.4);background:rgba(255,231,171,.2);color:#fff7df;font-weight:800}.chron-cue[aria-pressed="false"]{opacity:.55;background:rgba(7,10,18,.55)}';
    document.head.appendChild(style);
  }

  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-chron-role]")) updateFields();
  }, true);

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "chron-toggle-cue") {
      event.preventDefault();
      button.setAttribute("aria-pressed", button.getAttribute("aria-pressed") === "true" ? "false" : "true");
      return;
    }
    if (action === "chron-open") { event.preventDefault(); event.stopImmediatePropagation(); return reviewCard(button.dataset.index || 0); }
    if (action === "chron-back-home") { event.preventDefault(); event.stopImmediatePropagation(); return reviewHome(); }
    if (action === "chron-save-next") {
      event.preventDefault(); event.stopImmediatePropagation();
      var select = document.querySelector("[data-chron-role]");
      var index = Number(button.dataset.index || 0);
      if (!select || !select.value) return reviewCard(index, "Choose a role or select Park for later before continuing.");
      if (!recordChoice(button.dataset.id || "", select.value, note())) return reviewCard(index, "This fragment could not be saved.");
      var total = ordered(fog.state().briefFog.taskScroll).length;
      if (index + 1 >= total) return reviewHome("Chronological review complete. Every fragment remains editable.");
      return reviewCard(index + 1);
    }
  }, true);

  styles();
  ui.sieve = reviewHome;
  window.EsslayTaskScrollAutoFogUI = { reading: reviewHome, knot: reviewCard };
})();
