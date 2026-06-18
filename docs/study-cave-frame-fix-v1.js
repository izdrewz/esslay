(function () {
  function number(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function fitCaveFrame() {
    var shell = document.querySelector(".studyquest-shell.scene-first");
    var frame = document.querySelector(".game-cave.room-viewport-frame");
    if (!frame) return;

    try {
      var settings = JSON.parse(localStorage.getItem("esslay-room-viewport-settings-v1") || "{}");
      if (settings && settings.cave) {
        delete settings.cave.scale;
        delete settings.cave.mode;
        localStorage.setItem("esslay-room-viewport-settings-v1", JSON.stringify(settings));
      }
    } catch (error) {}

    var vw = Math.max(320, window.innerWidth || document.documentElement.clientWidth || 320);
    var vh = Math.max(240, window.innerHeight || document.documentElement.clientHeight || 240);
    var borderGap = 8;
    var aspect = 16 / 9;
    var width = Math.min(1700, vw - borderGap, (vh - borderGap) * aspect);
    var height = width / aspect;
    var zoom = vw > 760 ? 1.32 : 1.12;

    if (height > vh - borderGap) {
      height = vh - borderGap;
      width = height * aspect;
    }

    document.documentElement.style.setProperty("overflow", "hidden", "important");
    document.body.style.setProperty("overflow", "hidden", "important");
    document.body.style.setProperty("background", "#120c10", "important");

    if (shell) {
      shell.style.setProperty("height", "100dvh", "important");
      shell.style.setProperty("min-height", "0", "important");
      shell.style.setProperty("display", "grid", "important");
      shell.style.setProperty("place-items", "center", "important");
      shell.style.setProperty("padding", "4px", "important");
      shell.style.setProperty("overflow", "hidden", "important");
    }

    frame.style.setProperty("width", Math.round(width) + "px", "important");
    frame.style.setProperty("height", Math.round(height) + "px", "important");
    frame.style.setProperty("max-width", "calc(100vw - 8px)", "important");
    frame.style.setProperty("max-height", "calc(100dvh - 8px)", "important");
    frame.style.setProperty("aspect-ratio", "auto", "important");
    frame.style.setProperty("transform", "scale(" + zoom + ")", "important");
    frame.style.setProperty("transform-origin", "center center", "important");
    frame.style.setProperty("overflow", "hidden", "important");
    frame.style.setProperty("background-image", "url(assets/study-cave-opening.jpg?v=4)", "important");
    frame.style.setProperty("background-size", "100% 100%", "important");
    frame.style.setProperty("background-position", "center", "important");
    frame.style.setProperty("background-repeat", "no-repeat", "important");
  }

  function closePanels() {
    document.querySelectorAll(".quest-board-panel[open], .map-board-panel[open], .flags-panel[open]").forEach(function (panel) {
      panel.open = false;
    });
  }

  document.addEventListener("click", function (event) {
    var closeButton = event.target.closest("[data-close-panel]");
    if (closeButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var panel = closeButton.closest("details");
      if (panel) panel.open = false;
    }
  }, true);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closePanels();
  });

  window.addEventListener("resize", function () {
    window.requestAnimationFrame(fitCaveFrame);
  });

  function init() {
    closePanels();
    fitCaveFrame();
    window.setTimeout(fitCaveFrame, 80);
    window.setTimeout(fitCaveFrame, 350);
    window.setTimeout(fitCaveFrame, 900);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
