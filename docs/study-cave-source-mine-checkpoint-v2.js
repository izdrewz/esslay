(function () {
  "use strict";

  var KEY = "esslay-study-cave-simple-v1";

  function list(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  function closeTestPanel() {
    document.querySelectorAll(".study-cave-test-panel").forEach(function (panel) { panel.remove(); });
  }

  function resume() {
    var state = null;
    try { state = JSON.parse(window.localStorage.getItem(KEY)); } catch (error) { state = null; }
    if (!state || typeof state !== "object") state = {};
    state.unlocked = list(state.unlocked);
    ["cave-base", "brief-fog", "source-mine"].forEach(function (room) {
      if (state.unlocked.indexOf(room) === -1) state.unlocked.push(room);
    });
    state.sourceMine = state.sourceMine && typeof state.sourceMine === "object" ? state.sourceMine : {};
    state.sourceMine.started = true;
    state.current = "source-mine";
    state.lastAction = "Source Mine checkpoint opened";
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (error) {}

    closeTestPanel();
    var button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.action = "open-source-mine";
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function addTestButton() {
    var panel = document.querySelector(".study-cave-test-panel");
    var actions = panel && panel.querySelector(".study-cave-test-actions");
    if (!actions || actions.querySelector("[data-source-mine-checkpoint-open]")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.dataset.sourceMineCheckpointOpen = "true";
    button.textContent = "Jump to Source Mine checkpoint";
    actions.insertBefore(button, actions.firstChild);
  }

  function addQuestBoardButton() {
    var actions = document.querySelector(".quest-board-card[data-category='archive_test'] .quest-card-actions");
    if (!actions || actions.querySelector("[data-source-mine-checkpoint-open]")) return;

    var button = document.createElement("button");
    button.type = "button";
    button.dataset.sourceMineCheckpointOpen = "true";
    button.textContent = "Source Mine checkpoint";
    button.title = "Resume your saved Source Mine cards and gems";
    actions.appendChild(button);
  }

  function installButtons() {
    addTestButton();
    addQuestBoardButton();
  }

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-source-mine-checkpoint-open]")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    resume();
  }, true);

  if (window.MutationObserver) {
    new MutationObserver(installButtons).observe(document.documentElement, { childList: true, subtree: true });
  }

  window.addEventListener("DOMContentLoaded", function () {
    installButtons();
    try {
      if (new URLSearchParams(window.location.search).get("checkpoint") === "source-mine") resume();
    } catch (error) {}
  });
})();
