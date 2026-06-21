// Keeps the static Study Cave HUD count aligned and loads the separate Brief Fog Task Scroll modules.
(function () {
  var TOTAL = 8;
  var TASK_SCROLL_SCRIPTS = [
    "study-cave-task-scroll-core-v1.js?v=1",
    "study-cave-task-scroll-ui-v1.js?v=1",
    "study-cave-task-scroll-controller-v1.js?v=1"
  ];

  function fixHudOnly() {
    document.querySelectorAll("[data-flow-progress]").forEach(function (node) {
      var text = String(node.textContent || "0 / " + TOTAL);
      node.textContent = text.replace(/\/\s*7\b/g, "/ " + TOTAL);
    });
  }

  function loadTaskScrollModules() {
    if (window.__esslayTaskScrollModulesLoading || window.__esslayTaskScrollModulesLoaded) return;
    window.__esslayTaskScrollModulesLoading = true;
    var index = 0;

    function next() {
      if (index >= TASK_SCROLL_SCRIPTS.length) {
        window.__esslayTaskScrollModulesLoaded = true;
        return;
      }
      var script = document.createElement("script");
      script.src = TASK_SCROLL_SCRIPTS[index];
      script.onload = function () {
        index += 1;
        next();
      };
      script.onerror = function () {
        window.__esslayTaskScrollModulesLoading = false;
        console.error("Esslay Task Scroll module failed to load:", TASK_SCROLL_SCRIPTS[index]);
      };
      document.head.appendChild(script);
    }

    next();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      fixHudOnly();
      loadTaskScrollModules();
    });
  } else {
    fixHudOnly();
    loadTaskScrollModules();
  }

  document.addEventListener("click", function () {
    window.setTimeout(fixHudOnly, 0);
  }, true);
})();
