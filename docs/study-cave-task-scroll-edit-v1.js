(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  var ui = window.EsslayTaskScrollUI;
  if (!core || !ui || window.__esslayTaskScrollEditLoaded) return;
  window.__esslayTaskScrollEditLoaded = true;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>\"]/g, function (c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
    });
  }

  function stage() { return document.getElementById("stage-scene"); }

  function fragmentById(id) {
    var scroll = core.load().briefFog.taskScroll;
    return scroll.fragments.find(function (fragment) { return fragment.id === id; }) || null;
  }

  function statusName(fragment) {
    if (!fragment.role) return "Unsorted";
    return core.ROLES[fragment.role] || fragment.role;
  }

  function options(selected) {
    var roles = Object.keys(core.ROLES);
    return roles.map(function (role) {
      var label = role ? core.ROLES[role] : "Unsorted / decide later";
      return '<option value="' + esc(role) + '"' + (selected === role ? " selected" : "") + '>' + esc(label) + '</option>';
    }).join("");
  }

  function review(message) {
    var state = core.load();
    var scroll = state.briefFog.taskScroll;
    var fragments = scroll.fragments.slice().sort(function (a, b) {
      return (Number(a.pageNumber || 0) - Number(b.pageNumber || 0)) || (Number(a.chunkIndex || 0) - Number(b.chunkIndex || 0));
    });

    var rows = fragments.map(function (fragment) {
      var location = ui.meta(scroll, fragment);
      return '<li class="ts-edit-row"><strong>' + esc(core.text(fragment.text, 190)) + '</strong>' +
        '<small>' + esc(location) + ' · ' + esc(statusName(fragment)) + '</small>' +
        (fragment.note ? '<em>Note: ' + esc(fragment.note) + '</em>' : '<em>No note</em>') +
        '<button type="button" data-action="task-scroll-edit" data-id="' + esc(fragment.id) + '">Edit</button></li>';
    }).join("");

    ui.render('<article class="stage-card simple-card ts-card" data-task-scroll-edit-view="review"><h2>Brief Fog</h2><p><strong>Review and edit Quest Scroll fragments</strong></p><p>Change any role, add or replace a note, or return a fragment to Unsorted. Nothing here deletes the original task text.</p><p class="ts-status">' + esc(message || "") + '</p><section class="ts-section"><ol class="ts-list ts-edit-list">' + rows + '</ol></section><div class="simple-actions"><button type="button" data-action="task-scroll-sieve">Return to Fog Sieve</button><button type="button" data-action="task-scroll-recipe">Spell Recipe</button><button type="button" data-action="task-scroll-home">Quest Scroll</button></div></article>');
  }

  function edit(id, message) {
    var fragment = fragmentById(id);
    if (!fragment) return review("That fragment could not be found.");
    var scroll = core.load().briefFog.taskScroll;
    ui.render('<article class="stage-card simple-card ts-card" data-task-scroll-edit-view="form"><h2>Brief Fog</h2><p><strong>Edit fragment</strong></p><section class="ts-fragment"><p class="ts-meta">' + esc(ui.meta(scroll, fragment)) + '</p><div class="ts-text">' + esc(fragment.text) + '</div><form data-task-scroll-edit-form data-id="' + esc(fragment.id) + '"><label>What does this fragment do?<select name="role">' + options(fragment.role) + '</select></label><label>Why it matters / crystal-slot name<textarea name="note" rows="4" placeholder="Optional unless this is a Source Mine ingredient.">' + esc(fragment.note) + '</textarea></label><p class="ts-note">Choose Unsorted to put it back into the Fog Sieve. Choosing Park keeps it out of the active recipe without deleting it.</p><p class="ts-status">' + esc(message || "") + '</p><div class="simple-actions"><button type="button" data-action="task-scroll-edit-save">Save changes</button><button type="button" data-action="task-scroll-review">Cancel</button></div></form></section></article>');
  }

  function saveEdit() {
    var form = document.querySelector("[data-task-scroll-edit-form]");
    if (!form) return;
    var state = core.load();
    var scroll = state.briefFog.taskScroll;
    var fragment = scroll.fragments.find(function (item) { return item.id === form.dataset.id; });
    if (!fragment) return review("That fragment could not be found.");
    var formData = new FormData(form);
    var role = String(formData.get("role") || "");
    if (!Object.prototype.hasOwnProperty.call(core.ROLES, role)) return edit(fragment.id, "Choose a valid role.");
    fragment.role = role;
    fragment.note = core.text(formData.get("note"), 900);
    fragment.status = !role ? "unsorted" : (role === "parked" ? "parked" : "kept");
    fragment.decidedAt = core.iso();
    scroll.recipeConfirmedAt = "";
    core.save(state, "Quest Scroll fragment edited");
    review("Changes saved.");
  }

  function addReviewButton() {
    var node = stage();
    if (!node) return;
    var card = node.querySelector(".ts-card");
    if (!card || card.querySelector("[data-task-scroll-edit-view]") || card.querySelector('[data-action="task-scroll-review"]')) return;
    var canReview = card.querySelector("[data-task-scroll-form]") || card.querySelector('[data-action="task-scroll-home"]') || card.querySelector('[data-action="task-scroll-recipe"]');
    if (!canReview) return;
    var actionRows = card.querySelectorAll(".simple-actions");
    var target = actionRows.length ? actionRows[actionRows.length - 1] : null;
    if (!target) {
      target = document.createElement("div");
      target.className = "simple-actions";
      card.appendChild(target);
    }
    var button = document.createElement("button");
    button.type = "button";
    button.dataset.action = "task-scroll-review";
    button.textContent = "Review / edit fragments";
    target.appendChild(button);
  }

  var style = document.createElement("style");
  style.setAttribute("data-task-scroll-edit-v1", "");
  style.textContent = ".ts-edit-list{list-style:decimal!important}.ts-edit-row{padding:9px 0;border-bottom:1px solid rgba(255,231,171,.18)}.ts-edit-row strong,.ts-edit-row small,.ts-edit-row em{display:block}.ts-edit-row button{margin-top:6px;border:1px solid rgba(236,215,170,.75);border-radius:999px;padding:6px 10px;background:rgba(25,16,10,.88);color:#fff7df;font-weight:800;cursor:pointer}";
  document.head.appendChild(style);

  document.addEventListener("click", function (event) {
    var button = event.target.closest("button, a");
    if (!button) return;
    var action = button.dataset.action || "";
    if (action === "task-scroll-review") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return review();
    }
    if (action === "task-scroll-edit") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return edit(button.dataset.id || "");
    }
    if (action === "task-scroll-edit-save") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return saveEdit();
    }
  }, true);

  var node = stage();
  if (node && window.MutationObserver) new MutationObserver(addReviewButton).observe(node, {childList:true, subtree:true});
  document.addEventListener("DOMContentLoaded", addReviewButton);
  window.setTimeout(addReviewButton, 0);
})();
