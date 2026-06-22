(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  var fog = window.EsslayTaskScrollAutoFog;
  var ui = window.EsslayTaskScrollUI;
  if (!core || !fog || !ui || window.__esslayTaskScrollChoiceLearningLoaded) return;
  window.__esslayTaskScrollChoiceLearningLoaded = true;

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

  function getLearning(state) {
    state.briefFog = state.briefFog || {};
    var learning = state.briefFog.taskScrollLearning;
    if (!learning || typeof learning !== "object") learning = {};
    learning.version = 2;
    learning.corrections = Number(learning.corrections || 0);
    learning.confirmations = Number(learning.confirmations || 0);
    learning.weights = learning.weights && typeof learning.weights === "object" ? learning.weights : {};
    learning.history = Array.isArray(learning.history) ? learning.history : [];
    Object.keys(core.ROLES).forEach(function (role) {
      if (role && (!learning.weights[role] || typeof learning.weights[role] !== "object")) learning.weights[role] = {};
    });
    state.briefFog.taskScrollLearning = learning;
    return learning;
  }

  function clip(value, low, high) { return Math.max(low, Math.min(high, value)); }

  function selectedCues(fragment) {
    var active = Array.prototype.slice.call(document.querySelectorAll("[data-choice-cue][aria-pressed='true']")).map(function (node) {
      return node.dataset.choiceCue || "";
    });
    var custom = document.querySelector("[data-choice-custom-cue]");
    if (custom && custom.value.trim()) active.push(custom.value.trim());
    if (!active.length && fragment.auto && Array.isArray(fragment.auto.signals)) active = fragment.auto.signals.slice();
    if (!active.length) active = words(fragment.text).slice(0, 6);
    return unique(active).slice(0, 8);
  }

  function changeRole(fragment, role, note) {
    var state = fog.state();
    var scroll = state.briefFog.taskScroll;
    var target = scroll.fragments.find(function (item) { return item.id === fragment.id; });
    if (!target || !Object.prototype.hasOwnProperty.call(core.ROLES, role)) return false;

    var original = target.auto && target.auto.role ? target.auto.role : "";
    var cues = selectedCues(target);
    var learning = getLearning(state);
    var changed = !original || original !== role;
    var recordKey = [original, role, cues.join("|")].join("::");

    target.role = role;
    target.status = role === "parked" ? "parked" : (changed ? "player-confirmed" : "fog-confirmed");
    target.note = core.text(note, 900);
    target.decidedAt = core.iso();
    target.learningFromRole = original;
    target.learningCues = cues;
    target.learningRecordKey = recordKey;
    target.learningAppliedRole = role;
    scroll.recipeConfirmedAt = "";

    if (target.learningRecordedKey !== recordKey) {
      if (role !== "parked") {
        cues.forEach(function (cue) {
          words(cue).forEach(function (word) {
            var positive = Number(learning.weights[role][word] || 0);
            learning.weights[role][word] = clip(positive + (changed ? 1.2 : 0.3), -4, 6);
            if (changed && original && original !== role && learning.weights[original]) {
              var negative = Number(learning.weights[original][word] || 0);
              learning.weights[original][word] = clip(negative - 0.35, -4, 6);
            }
          });
        });
      }
      if (changed) learning.corrections += 1;
      else learning.confirmations += 1;
      learning.history.unshift({
        at: core.iso(),
        from: original || "uncertain",
        to: role,
        cues: cues,
        note: target.note
      });
      learning.history = learning.history.slice(0, 80);
      target.learningRecordedKey = recordKey;
    }

    core.save(state, changed ? "Fog reading corrected and learned locally" : "Fog reading confirmed locally");
    return true;
  }

  function roleOptions(selected) {
    return Object.keys(core.ROLES).map(function (role) {
      var label = role ? core.ROLES[role] : "Choose a role";
      return '<option value="' + esc(role) + '"' + (role === selected ? " selected" : "") + '>' + esc(label) + '</option>';
    }).join("");
  }

  function signalButtons(signals) {
    if (!signals || !signals.length) return '<p class="choice-muted">The Fog found no strong words. Pick the role and add your own cue if you know why it belongs there.</p>';
    return '<div class="choice-cues">' + signals.map(function (signal) {
      return '<button type="button" class="choice-cue" data-action="choice-toggle-cue" data-choice-cue="' + esc(signal) + '" aria-pressed="true">' + esc(signal) + '</button>';
    }).join("") + '</div>';
  }

  function reading(message) {
    var state = fog.state();
    var scroll = state.briefFog.taskScroll;
    if (!scroll.fragments.length) return ui.home("Bring a Quest Scroll before asking the Fog to read it.");
    var groups = fog.group(state);
    var learning = getLearning(state);
    var bright = groups.bright.length ? '<p><strong>Bright Path:</strong> ' + groups.bright.length + ' high-confidence readings waiting.</p>' : '<p><strong>Bright Path:</strong> no readings waiting.</p>';
    var knots = groups.knots.length ? '<p><strong>Unclear fragments:</strong> ' + groups.knots.length + ' need a quick check.</p>' : '<p><strong>Unclear fragments:</strong> none remain.</p>';
    ui.render('<article class="stage-card simple-card ts-card choice-card"><h2>Brief Fog</h2><p><strong>Fog Reading</strong></p><p>The Fog sorted the Quest Scroll first. Automatic estimates are preselected when there is a clear match; uncertain fragments ask for your decision directly.</p><p class="choice-muted">Local learning: ' + learning.corrections + ' correction(s), ' + learning.confirmations + ' confirmed estimate(s), stored only in this browser.</p><p class="ts-status">' + esc(message || "Choose only when you disagree or the Fog is uncertain.") + '</p><section class="choice-zone">' + bright + (groups.bright.length ? '<button type="button" data-action="choice-accept-bright">Accept Bright Path</button>' : '') + '</section><section class="choice-zone">' + knots + (groups.knots.length ? '<button type="button" data-action="choice-open-fragment">Check unclear fragments</button>' : '') + '</section><section class="choice-zone"><p>Current recipe: ' + groups.placed.length + ' placed · ' + groups.parked.length + ' parked</p></section><div class="simple-actions"><button type="button" data-action="task-scroll-review">Review / edit all readings</button><button type="button" data-action="task-scroll-recipe">Open Spell Recipe</button><button type="button" data-action="task-scroll-home">Quest Scroll</button></div></article>');
  }

  function fragmentCard(message) {
    var state = fog.state();
    var scroll = state.briefFog.taskScroll;
    var groups = fog.group(state);
    var fragment = groups.knots[0];
    if (!fragment) return reading("All unclear fragments have been decided.");
    var autoData = fragment.auto || {};
    var selected = autoData.role || "";
    var estimate = selected ? 'Fog estimate: <strong>' + esc(core.ROLES[selected]) + '</strong>' : 'Fog estimate: <strong>uncertain</strong>';
    var ingredient = selected === "required-evidence" || selected === "key-scope";

    ui.render('<article class="stage-card simple-card ts-card choice-card"><h2>Brief Fog</h2><p><strong>Unclear fragment</strong> · ' + groups.knots.length + ' left</p><section class="choice-zone"><p class="ts-meta">' + esc(ui.meta(scroll, fragment)) + '</p><p class="choice-estimate">' + estimate + '</p><div class="ts-text">' + esc(fragment.text) + '</div><label>Choose its role<select data-choice-role>' + roleOptions(selected) + '</select></label><p class="choice-help">The estimate is selected for you when the Fog has one. Change it here when it is wrong.</p><p class="choice-label">What wording supports your choice?</p>' + signalButtons(autoData.signals) + '<label>Add your own word or phrase<input data-choice-custom-cue placeholder="Optional: e.g. no full response needed"></label><label data-choice-note-label>' + (ingredient ? 'Crystal-slot name' : 'Why it matters / note') + '<textarea rows="3" data-choice-note placeholder="' + (ingredient ? 'Short Source Mine ingredient name' : 'Optional note') + '">' + esc(fragment.note || "") + '</textarea></label><p class="choice-help">Your chosen role and selected wording are saved as a local learning example. You can still edit it later.</p><p class="ts-status">' + esc(message || "") + '</p><div class="simple-actions"><button type="button" data-action="choice-save-fragment" data-id="' + esc(fragment.id) + '">Save choice → next</button><button type="button" data-action="choice-park-fragment" data-id="' + esc(fragment.id) + '">Park for later</button><button type="button" data-action="choice-back-reading">Back to Fog Reading</button></div></section></article>');
  }

  function currentNote() {
    var node = document.querySelector("[data-choice-note]");
    return node ? node.value : "";
  }

  function findFragment(id) {
    var state = fog.state();
    return state.briefFog.taskScroll.fragments.find(function (item) { return item.id === id; }) || null;
  }

  function updateRoleFields() {
    var select = document.querySelector("[data-choice-role]");
    var label = document.querySelector("[data-choice-note-label]");
    var note = document.querySelector("[data-choice-note]");
    if (!select || !label || !note) return;
    var ingredient = select.value === "required-evidence" || select.value === "key-scope";
    label.firstChild.nodeValue = ingredient ? "Crystal-slot name" : "Why it matters / note";
    note.placeholder = ingredient ? "Short Source Mine ingredient name" : "Optional note";
  }

  function installStyles() {
    if (document.querySelector("style[data-choice-learning-v1]")) return;
    var style = document.createElement("style");
    style.setAttribute("data-choice-learning-v1", "");
    style.textContent = '.choice-card{max-width:560px!important}.choice-zone{margin:10px 0;padding:10px;border:1px solid rgba(255,231,171,.36);border-radius:14px;background:rgba(7,10,18,.76)}.choice-zone label{display:block;margin-top:10px;font-weight:900}.choice-zone input,.choice-zone select,.choice-zone textarea{display:block;width:100%;box-sizing:border-box;margin-top:4px}.choice-muted,.choice-help{font-size:.87rem;opacity:.9}.choice-estimate{padding:7px;border-radius:10px;background:rgba(255,231,171,.12)}.choice-label{font-weight:900;margin:10px 0 5px}.choice-cues{display:flex;flex-wrap:wrap;gap:6px}.choice-cue{padding:5px 8px;border-radius:999px;border:1px solid rgba(255,231,171,.4);background:rgba(255,231,171,.2);color:#fff7df;font-weight:800}.choice-cue[aria-pressed="false"]{opacity:.55;background:rgba(7,10,18,.55)}';
    document.head.appendChild(style);
  }

  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-choice-role]")) updateRoleFields();
  }, true);

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "choice-toggle-cue") {
      event.preventDefault();
      var on = button.getAttribute("aria-pressed") !== "true";
      button.setAttribute("aria-pressed", on ? "true" : "false");
      return;
    }
    if (action === "choice-back-reading") { event.preventDefault(); event.stopImmediatePropagation(); return reading(); }
    if (action === "choice-open-fragment") { event.preventDefault(); event.stopImmediatePropagation(); return fragmentCard(); }
    if (action === "choice-accept-bright") {
      event.preventDefault(); event.stopImmediatePropagation();
      var state = fog.state();
      var count = fog.acceptBright(state);
      fog.save(state, count + " Bright Path reading(s) accepted");
      return reading();
    }
    if (action === "choice-save-fragment") {
      event.preventDefault(); event.stopImmediatePropagation();
      var select = document.querySelector("[data-choice-role]");
      if (!select || !select.value) return fragmentCard("Choose a role first. The Fog cannot learn from an empty category.");
      var fragment = findFragment(button.dataset.id || "");
      if (!fragment || !changeRole(fragment, select.value, currentNote())) return fragmentCard("This fragment could not be saved.");
      return fragmentCard();
    }
    if (action === "choice-park-fragment") {
      event.preventDefault(); event.stopImmediatePropagation();
      var target = findFragment(button.dataset.id || "");
      if (!target || !changeRole(target, "parked", currentNote())) return fragmentCard("This fragment could not be parked.");
      return fragmentCard();
    }
  }, true);

  installStyles();
  ui.sieve = reading;
  window.EsslayTaskScrollAutoFogUI = { reading: reading, knot: fragmentCard };
})();
