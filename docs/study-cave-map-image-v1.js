// Study Cave illustrated Task Map renderer.
(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";

  function readState() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "{}") || {}; }
    catch (error) { return {}; }
  }

  function escapeText(value) {
    return String(value == null ? "" : value).replace(/[&<>]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char];
    });
  }

  function addOverlayCss() {
    if (document.querySelector("style[data-study-cave-map-overlay-fix]")) return;
    var style = document.createElement("style");
    style.dataset.studyCaveMapOverlayFix = "true";
    style.textContent = [
      'body .cave-opening-screen .map-board-panel{position:absolute!important;inset:0!important;width:auto!important;max-width:none!important;height:auto!important;margin:0!important;padding:42px 34px 30px!important;display:grid!important;place-items:center!important;overflow:hidden!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;z-index:9500!important;}',
      'body .cave-opening-screen .map-board-panel:not([open]){display:none!important;}',
      'body .cave-opening-screen .map-board-panel summary{display:none!important;}',
      'body .cave-opening-screen .map-board-panel .panel-close{position:absolute!important;top:18px!important;right:18px!important;z-index:20!important;width:38px!important;height:38px!important;display:grid!important;place-items:center!important;border-radius:999px!important;background:rgba(255,248,226,.95)!important;color:#2f2118!important;border:2px solid rgba(90,56,37,.55)!important;box-shadow:0 8px 22px rgba(0,0,0,.32)!important;}',
      'body .cave-opening-screen [data-task-map]{width:min(1120px,82vw)!important;height:auto!important;display:grid!important;place-items:center!important;overflow:visible!important;}',
      'body .cave-opening-screen .study-cave-art-map{position:relative!important;width:100%!important;aspect-ratio:16/9!important;height:auto!important;min-height:0!important;max-height:calc(100dvh - 110px)!important;border:4px solid rgba(90,56,37,.72)!important;border-radius:18px!important;overflow:hidden!important;background:transparent!important;box-shadow:0 20px 60px rgba(0,0,0,.45)!important;}',
      'body .cave-opening-screen .study-cave-art-map__image{position:absolute!important;inset:0!important;background-image:url("assets/study-cave/study-cave-map-v01.jpg?v=2")!important;background-size:contain!important;background-position:center center!important;background-repeat:no-repeat!important;background-color:transparent!important;}',
      'body .cave-opening-screen .study-cave-map-status{display:none!important;}',
      '@media(max-width:760px){body .cave-opening-screen .map-board-panel{padding:44px 12px 18px 52px!important;}body .cave-opening-screen [data-task-map]{width:94vw!important;}.study-cave-art-map{max-height:calc(100dvh - 90px)!important;}}'
    ].join('');
    document.head.appendChild(style);
  }

  function removeOldBadAsset() {
    document.querySelectorAll('link[data-study-cave-map-asset],link[href*="study-cave-map-asset-v1.css"]').forEach(function (link) {
      link.remove();
    });
  }

  function renderIllustratedMap() {
    var mount = document.querySelector("[data-task-map]");
    if (!mount) return;
    removeOldBadAsset();

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
    addOverlayCss();
    window.setTimeout(renderIllustratedMap, 0);
    window.setTimeout(renderIllustratedMap, 80);
    window.setTimeout(renderIllustratedMap, 250);
    window.setTimeout(removeOldBadAsset, 500);
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest('[data-action="open-task-map"]')) scheduleRender();
  }, true);

  function init() {
    addOverlayCss();
    scheduleRender();
    var panel = document.getElementById("map-board-panel");
    if (!panel || typeof MutationObserver === "undefined") return;
    new MutationObserver(function () { if (panel.open) scheduleRender(); }).observe(panel, { attributes: true, attributeFilter: ["open"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
