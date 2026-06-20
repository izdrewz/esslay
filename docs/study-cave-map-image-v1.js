// Safe illustrated Task Map loader.
// This does nothing on normal cave load. It only replaces the existing map content
// after the native Task Map details panel opens.
(function () {
  var PANEL_ID = "map-board-panel";
  var MAP_IMAGE = "assets/study-cave/study-cave-map-v01.jpg?v=3";

  function hotspot(label, action, left, top, width, height) {
    return '<button type="button" data-action="' + action + '" aria-label="' + label + '" title="' + label + '" style="position:absolute;left:' + left + '%;top:' + top + '%;width:' + width + '%;height:' + height + '%;z-index:2;border:0;border-radius:14px;background:transparent;color:transparent;cursor:pointer;"></button>';
  }

  function renderImageMap() {
    var panel = document.getElementById(PANEL_ID);
    var mount = panel && panel.querySelector("[data-task-map]");
    if (!panel || !panel.open || !mount) return;

    mount.innerHTML = '' +
      '<section aria-label="Illustrated Study Cave map" style="position:relative;width:100%;aspect-ratio:16 / 9;min-height:280px;overflow:hidden;border-radius:14px;background:#d8ad6b;">' +
        '<img src="' + MAP_IMAGE + '" alt="Illustrated Study Cave task map" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;">' +
        hotspot("Open Cave Base", "enter-cave-base", 4, 9, 28, 26) +
        hotspot("Open Brief Fog", "open-brief-fog", 35, 12, 28, 21) +
        hotspot("Open Source Mine", "open-source-mine", 70, 8, 25, 26) +
        hotspot("Open Draft Route", "open-draft-route", 5, 36, 30, 24) +
        hotspot("Open Paragraph Forge", "open-paragraph-forge", 37, 38, 26, 21) +
        hotspot("Open Bridge Hall", "open-bridge-hall", 68, 34, 29, 27) +
        hotspot("Open Citation Vault", "open-citation-vault", 4, 64, 31, 27) +
        hotspot("Open Polish Pool", "open-polish-pool", 37, 66, 28, 25) +
        hotspot("Open Submission Gate", "open-submission-gate", 67, 64, 27, 28) +
      '</section>';
  }

  function observeMapPanel() {
    var panel = document.getElementById(PANEL_ID);
    if (!panel || typeof MutationObserver === "undefined") return;

    var observer = new MutationObserver(function () {
      if (panel.open) window.setTimeout(renderImageMap, 0);
    });

    observer.observe(panel, { attributes: true, attributeFilter: ["open"] });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeMapPanel);
  } else {
    observeMapPanel();
  }
})();
