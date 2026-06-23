(function () {
  "use strict";

  var KEY = "esslay-study-cave-simple-v1";

  function list(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
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

    var button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.action = "open-source-mine";
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  window.addEventListener("DOMContentLoaded", function () {
    try {
      if (new URLSearchParams(window.location.search).get("checkpoint") === "source-mine") resume();
    } catch (error) {}
  });
})();
