// Keeps legacy Study Cave HUD text aligned with the current 8-step route.
(function () {
  var TOTAL = 8;

  function fixText(node) {
    if (!node) return;
    node.textContent = String(node.textContent || "0 / " + TOTAL).replace(/\/\s*7\b/g, "/ " + TOTAL);
  }

  function fixAll() {
    document.querySelectorAll("[data-flow-progress]").forEach(fixText);
    document.querySelectorAll(".stage-card, .flow-card, .study-cave-map-status").forEach(function (node) {
      if (!node || !node.innerHTML) return;
      node.innerHTML = node.innerHTML.replace(/\/\s*7(\s*(?:chambers complete)?)/g, "/ " + TOTAL + "$1");
    });
  }

  document.addEventListener("DOMContentLoaded", fixAll);
  document.addEventListener("click", function () {
    window.setTimeout(fixAll, 0);
    window.setTimeout(fixAll, 120);
  }, true);

  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(fixAll).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
})();