// Study Cave illustrated Task Map renderer.
// Install: load this after the existing Study Cave scripts in docs/cave.html.
(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}") || {};
    } catch (error) {
      return {};
    }
  }

  function escapeText(value) {
    return String(value == null ? "" : value).replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    });
  }

  function renderIllustratedMap() {
    var mount = document.querySelector("[data-task-map]");
    if (!mount) return;

    var saved = readState();
    var completed = Array.isArray(saved.completed) ? saved.completed.length : 0;
    var current = String(saved.current || (completed ? "Source Mine" : "Brief Fog")).replace(/[-_]/g, " ");

    mount.innerHTML = '' +
      '<section class="study-cave-art-map" aria-label="Illustrated Study Cave map">' +
        '<div class="study-cave-art-map__image" aria-hidden="true"></div>' +
        '<button type="button" class="study-cave-map-hotspot map-cave-base" data-action="enter-cave-base" aria-label="Open Cave Base">Cave Base</button>' +
        '<button type="button" class="study-cave-map-hotspot map-brief-fog" data-action="open-brief-fog" aria-label="Open Brief Fog">Brief Fog</button>' +
        '<button type="button" class="study-cave-map-hotspot map-source-mine" data-action="open-source-mine" aria-label="Open Source Mine">Source Mine</button>' +
        '<button type="button" class="study-cave-map-hotspot map-draft-route" data-action="open-draft-route" aria-label="Open Draft Route">Draft Route</button>' +
        '<button type="button" class="study-cave-map-hotspot map-paragraph-forge" data-action="open-paragraph-forge" aria-label="Open Paragraph Forge">Paragraph Forge</button>' +
        '<button type="button" class="study-cave-map-hotspot map-bridge-hall" data-action="open-bridge-hall" aria-label="Open Bridge Hall">Bridge Hall</button>' +
        '<button type="button" class="study-cave-map-hotspot map-citation-vault" data-action="open-citation-vault" aria-label="Open Citation Vault">Citation Vault</button>' +
        '<button type="button" class="study-cave-map-hotspot map-polish-pool" data-action="open-polish-pool" aria-label="Open Polish Pool">Polish Pool</button>' +
        '<button type="button" class="study-cave-map-hotspot map-submission-gate" data-action="open-submission-gate" aria-label="Open Submission Gate">Submission Gate</button>' +
        '<div class="study-cave-map-status"><span>Current: ' + escapeText(current) + '</span><span>Progress: ' + completed + ' / 7</span></div>' +
      '</section>';
  }

  function scheduleRender() {
    window.setTimeout(renderIllustratedMap, 0);
    window.setTimeout(renderIllustratedMap, 80);
    window.setTimeout(renderIllustratedMap, 250);
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest('[data-action="open-task-map"]')) {
      scheduleRender();
    }
  }, true);

  function observeMapPanel() {
    var panel = document.getElementById("map-board-panel");
    if (!panel || typeof MutationObserver === "undefined") return;

    var observer = new MutationObserver(function () {
      if (panel.open) scheduleRender();
    });

    observer.observe(panel, { attributes: true, attributeFilter: ["open"] });
  }

  function init() {
    observeMapPanel();
    scheduleRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
