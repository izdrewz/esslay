(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  var auto = window.EsslayTaskScrollAutoFog;
  var ui = window.EsslayTaskScrollUI;
  if (!core || !auto || !ui || window.__esslayTaskScrollAutoFogUiLoaded) return;
  window.__esslayTaskScrollAutoFogUiLoaded = true;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
    });
  }

  function confidence(data) {
    if (!data || !data.role) return "Fog uncertain";
    return data.confidence === "high" ? "Bright reading" : (data.confidence === "medium" ? "Fog knot" : "Fog uncertain");
  }

  function preview(scroll, fragment) {
    var data = fragment.auto || {};
    return '<li><strong>' + esc(auto.roleLabel(data.role)) + '</strong> · ' + esc(confidence(data)) + '<small>' + esc(ui.meta(scroll, fragment)) + '</small><em>' + esc(core.text(fragment.text, 130)) + '</em></li>';
  }

  function reading(message) {
    var state = auto.state();
    var scroll = state.briefFog.taskScroll;
    if (!scroll.fragments.length) return ui.home("Bring a Quest Scroll before asking the Fog to read it.");
    var groups = auto.group(state);
    var learning = state.briefFog.taskScrollLearning || {};
    var bright = groups.bright.length ? '<ol class="af-list">' + groups.bright.slice(0, 4).map(function (f) { return preview(scroll, f); }).join("") + '</ol>' : '<p>No Bright Path readings waiting.</p>';
    var knots = groups.knots.length ? '<ol class="af-list">' + groups.knots.slice(0, 4).map(function (f) { return preview(scroll, f); }).join("") + '</ol>' : '<p>No Fog Knots remain.</p>';

    ui.render('<article class="stage-card simple-card ts-card af-card"><h2>Brief Fog</h2><p><strong>Fog Reading</strong></p><p>The Fog read ' + groups.total + ' fragments before showing you anything. Bright Path readings are strong estimates. Fog Knots are uncertain or mixed.</p><p class="af-copy">Local learning: ' + Number(learning.corrections || 0) + ' correction(s) saved in this browser.</p><p class="ts-status">' + esc(message || "Review only the uncertain cards; everything else can be accepted together.") + '</p><section class="af-zone"><h3>Bright Path · ' + groups.bright.length + '</h3>' + bright + (groups.bright.length ? '<div class="simple-actions"><button type="button" data-action="auto-fog-accept">Accept Bright Path</button></div>' : '') + '</section><section class="af-zone"><h3>Fog Knots · ' + groups.knots.length + '</h3><p>These are the mini-game: inspect the trigger words, accept the reading, recast it, or park it.</p>' + knots + (groups.knots.length ? '<div class="simple-actions"><button type="button" data-action="auto-fog-knot">Investigate Fog Knots</button></div>' : '') + '</section><section class="af-zone"><h3>Current recipe</h3><p>' + groups.placed.length + ' placed · ' + groups.parked.length + ' parked</p></section><div class="simple-actions"><button type="button" data-action="task-scroll-review">Review / edit all readings</button><button type="button" data-action="task-scroll-recipe">Open Spell Recipe</button><button type="button" data-action="task-scroll-home">Quest Scroll</button></div></article>');
  }

  function knot(message) {
    var state = auto.state();
    var scroll = state.briefFog.taskScroll;
    var groups = auto.group(state);
    var fragment = groups.knots[0];
    if (!fragment) return reading("No Fog Knots remain.");
    var data = fragment.auto || {};
    var signals = (data.signals || []).length ? data.signals.map(function (signal) { return '<span class="af-signal">' + esc(signal) + '</span>'; }).join("") : '<span class="af-copy">No strong trigger words.</span>';
    var alternatives = (data.alternatives || []).map(function (item) { return auto.roleLabel(item.role); }).join(" · ");
    var label = data.role === "required-evidence" || data.role === "key-scope" ? "Crystal-slot name" : "Why it matters / note";
    var placeholder = data.role === "required-evidence" || data.role === "key-scope" ? "Short Source Mine ingredient name" : "Optional note";

    ui.render('<article class="stage-card simple-card ts-card af-card"><h2>Brief Fog</h2><p><strong>Fog Knot</strong> · ' + groups.knots.length + ' unresolved</p><section class="af-zone"><p class="ts-meta">' + esc(ui.meta(scroll, fragment)) + '</p><h3>' + esc(confidence(data)) + ': ' + esc(auto.roleLabel(data.role)) + '</h3><p class="af-copy">The Fog used these words:</p><div class="af-signals">' + signals + '</div>' + (alternatives ? '<p class="af-copy">Other possible readings: ' + esc(alternatives) + '</p>' : '') + '<div class="ts-text">' + esc(fragment.text) + '</div><label>' + esc(label) + '<textarea rows="3" data-auto-note placeholder="' + esc(placeholder) + '">' + esc(fragment.note || "") + '</textarea></label><p class="ts-status">' + esc(message || "Accept the Fog reading, change it in Review / edit fragments, or park it.") + '</p><div class="simple-actions"><button type="button" data-action="auto-fog-keep" data-id="' + esc(fragment.id) + '">Keep Fog reading</button><button type="button" data-action="auto-fog-park" data-id="' + esc(fragment.id) + '">Park for later</button><button type="button" data-action="task-scroll-review">Recast in Review / edit</button><button type="button" data-action="auto-fog-reading">Back to Fog Reading</button></div></section></article>');
  }

  function note() {
    var node = document.querySelector("[data-auto-note]");
    return node ? node.value : "";
  }

  function choose(id, role, source) {
    var state = auto.state();
    if (!auto.choose(state, id, role, note(), source)) return knot("That fragment could not be found.");
    auto.save(state, source === "auto" ? "Fog reading accepted" : "Fog reading changed by player");
    knot();
  }

  function style() {
    if (document.querySelector("style[data-auto-fog-ui-v2]")) return;
    var node = document.createElement("style");
    node.setAttribute("data-auto-fog-ui-v2", "");
    node.textContent = '.af-card{max-width:560px!important}.af-zone{margin:10px 0;padding:10px;border:1px solid rgba(255,231,171,.36);border-radius:14px;background:rgba(7,10,18,.76)}.af-zone h3{margin:0 0 6px}.af-list{margin:7px 0;padding-left:19px}.af-list li{margin:8px 0}.af-list strong,.af-list small,.af-list em{display:block}.af-list em{font-style:normal;opacity:.9}.af-copy{font-size:.87rem;opacity:.9}.af-signals{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0}.af-signal{padding:4px 7px;border-radius:999px;border:1px solid rgba(255,231,171,.36);background:rgba(255,231,171,.14);font-weight:800;font-size:.82rem}';
    document.head.appendChild(node);
  }

  function attach() { style(); ui.sieve = reading; }

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "auto-fog-reading") { event.preventDefault(); event.stopImmediatePropagation(); return reading(); }
    if (action === "auto-fog-accept") {
      event.preventDefault(); event.stopImmediatePropagation();
      var state = auto.state();
      var count = auto.acceptBright(state);
      auto.save(state, count + " Bright Path reading(s) accepted");
      return reading();
    }
    if (action === "auto-fog-knot") { event.preventDefault(); event.stopImmediatePropagation(); return knot(); }
    if (action === "auto-fog-keep") {
      event.preventDefault(); event.stopImmediatePropagation();
      var state = auto.state();
      var fragment = state.briefFog.taskScroll.fragments.find(function (item) { return item.id === button.dataset.id; });
      return choose(button.dataset.id || "", fragment && fragment.auto ? fragment.auto.role : "parked", "auto");
    }
    if (action === "auto-fog-park") { event.preventDefault(); event.stopImmediatePropagation(); return choose(button.dataset.id || "", "parked", "user"); }
  }, true);

  attach();
  document.addEventListener("DOMContentLoaded", attach);
})();
