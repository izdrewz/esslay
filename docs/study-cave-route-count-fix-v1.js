// Keeps the static Study Cave HUD count aligned and loads focused Study Cave helpers.
(function () {
  var TOTAL = 8;
  var TASK_SCROLL_SCRIPTS = [
    "study-cave-task-scroll-core-v1.js?v=5",
    "study-cave-task-scroll-split-patch-v1.js?v=1",
    "study-cave-task-scroll-hints-patch-v1.js?v=2",
    "study-cave-task-scroll-ui-v1.js?v=2",
    "study-cave-task-scroll-controller-v1.js?v=2",
    "study-cave-task-scroll-edit-v1.js?v=1",
    "study-cave-task-scroll-autoselect-v1.js?v=1"
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

  function loadScript(src, onload, errorText) {
    var script = document.createElement("script");
    script.src = src;
    script.onload = onload || function () {};
    script.onerror = function () { console.error(errorText || ("Failed to load " + src)); };
    document.head.appendChild(script);
  }

  function loadSourceMineImportFixes() {
    if (window.__esslaySourceMineImportFixLoading || window.__esslaySourceMineImportFixV1) return;
    window.__esslaySourceMineImportFixLoading = true;
    loadScript("study-cave-source-mine-import-fix-v1.js?v=2", function () {
      window.__esslaySourceMineImportFixLoading = false;
      if (!window.__esslaySourceMineFrontmatterCleanupV1) {
        loadScript("study-cave-source-mine-frontmatter-cleanup-v1.js?v=1", null, "Esslay Source Mine front matter cleanup failed to load.");
      }
    }, "Esslay Source Mine import fix failed to load.");
  }

  function currentRoom() {
    try {
      var state = JSON.parse(localStorage.getItem("esslay-study-cave-simple-v1"));
      return state && typeof state === "object" ? String(state.current || "") : "";
    } catch (error) {
      return "";
    }
  }

  function directRoomAction(roomId) {
    return {
      "bridge-hall": "open-bridge-hall",
      "citation-vault": "open-citation-vault",
      "polish-pool": "open-polish-pool",
      "submission-gate": "open-submission-gate"
    }[roomId] || "";
  }

  function openDedicatedRoom(action) {
    var button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.action = action;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function routeLegacyContinuation(event) {
    var button = event.target.closest("button, a");
    if (!button || button.dataset.action !== "continue-quest") return;
    var action = directRoomAction(currentRoom());
    if (!action) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDedicatedRoom(action);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      fixHudOnly();
      loadTaskScrollModules();
      loadSourceMineImportFixes();
    });
  } else {
    fixHudOnly();
    loadTaskScrollModules();
    loadSourceMineImportFixes();
  }

  document.addEventListener("click", function (event) {
    routeLegacyContinuation(event);
    window.setTimeout(fixHudOnly, 0);
  }, true);
})();
