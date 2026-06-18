// Keeps the static Study Cave HUD count aligned without touching panels or buttons.
(function () {
  var TOTAL = 8;

  function fixHudOnly() {
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) {
      var text = String(node.textContent || "0 / " + TOTAL);
      node.textContent = text.replace(/\/\s*7\b/g, "/ " + TOTAL);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fixHudOnly);
  } else {
    fixHudOnly();
  }

  document.addEventListener("click", function () {
    window.setTimeout(fixHudOnly, 0);
  }, true);
})();